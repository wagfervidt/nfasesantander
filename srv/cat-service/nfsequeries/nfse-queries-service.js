const constants = require('constants');
const { readCredential } = require("../credentials");
const notafiscalCustomLogic = require("../notafiscal");
const {
  getCompaniesToQueryNfse,
  getNotasFiscaisScheduleLogByCompanyAndPrefectureWithSuccess,
  getFirstNotasFiscaisScheduleLogByCompanyAndPrefecture,
  insertIntoNotasFiscaisScheduleLog,
  insertIntoNotasFiscaisErrorLog,
  getCompaniesPrefecturesDetail,
  getVendorSearchList,
  getTextExceptions,
  getBethaCities
} = require("../db");
const { updateScheduleJob } = require("../jobscheduler");
const {
  getDateW3CStringFromDate,
  getNumericDigitsOnly,
  getDateIsoStringFromDate
} = require("../stringManipulation");
const {
  createClientWithRetries,
  callsMethodWithRetries
} = require("../soap");
const {
  readXmlTemplate,
  signXmlNfse,
  parseXMLtoObject,
  parseObjectToXML
} = require("../xml");
const { XslTransformBySources } = require("../xslt");
const { servicePOST } = require("../services/destination-service")
const { getBundle } = require('../../common/i18n');
const soap = require("soap");
const _ = require('lodash');
const { testInterval, testIntervalCompany } = require('../callInterval/testInterval')
const https = require('https')
const moment = require('moment')

async function handleNfseQueries(req, service) {

  try {
    const jobId = req.headers["x-sap-job-id"];
    const scheduleId = req.headers["x-sap-job-schedule-id"];
    const runId = req.headers["x-sap-job-run-id"];
    const scheduleHost = req.headers["x-sap-scheduler-host"];
    const bundle = getBundle(req.user.locale);
    try {

      //Busca as empresas/prefeituras ativas
      const companyPrefectureList = await getCompaniesToQueryNfse(service);

      if (companyPrefectureList.length === 0) {
        const message = bundle.getText("mERROR_NO_MASTER_DATA");
        await updateScheduleJob(scheduleHost, jobId, scheduleId, runId, false, message);
        return;
      }

      //Faz a consulta de notas com empresa/prefeitura
    
      await fetchNfseList(companyPrefectureList, service, bundle)

      const message = bundle.getText("mFINISHED_PROCESSING");
      await updateScheduleJob(scheduleHost, jobId, scheduleId, runId, true, message);

    } catch (e) {
      console.error(e)
      const message = e.stack + "\n\n" + e.toString();
  
      await updateScheduleJob(scheduleHost, jobId, scheduleId, runId, false, message);
      if (service != null) {
        const tx = service.tx()
        await insertIntoNotasFiscaisScheduleLog(
          tx,
          service,
          null,
          null,
          null,
          getDateIsoStringFromDate(),
          1,
          message
        );
        await tx.commit();
      }
    }
  } catch (e) {
    console.error(e)
  }
}

async function fetchNfseList(companyPrefectureList, service, bundle) {

  //Faz a leitura sequencial de empresa/prefeitura
  for (let companyPrefecture of companyPrefectureList) {

    //Obtém a data de hoje - utc 3 
    const todayDate = getTodayDate();

    //Obtém a para início do processamento
    let lastDate = await getLastDate(companyPrefecture, service);

    const loteBody = {
      lastDate: lastDate,
      todayDate: todayDate,
      companyPrefectureID: companyPrefecture.ID
    }
    //Espera 1 segundo a cada envio para não estourar POOL da prefeitura
    await new Promise(resolve => setTimeout(resolve, 250));

    //Chama a nota em paralelo externamente
    const response = await servicePOST('nfse', '/catalog/nfseQueriesParallel', null, JSON.stringify(loteBody));

    if (response) {
      console.log(response + ' ' + companyPrefecture.ID);
    } else {
      //Chama a nota em paralelo externamente novamente
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await servicePOST('nfse', '/catalog/nfseQueriesParallel', null, JSON.stringify(loteBody));
      console.log(response + ' ' + companyPrefecture.ID);
    }

    //Chamada interna
    //service.nfseQueriesParallel(lastDate, todayDate, companyPrefecture.ID)
    //.then((result)=>{console.log("CompanyPrefectureCalled")});

  }
}

async function handleNfseQueriesParallel(req, service) {

  try {
    const bundle = getBundle(req.user.locale);
    const lastDate = new Date(req.data.lastDate);
    const todayDate = new Date(req.data.todayDate);
    const companyPrefectureID = req.data.companyPrefectureID;

    const companyPrefecture = await getCompaniesPrefecturesDetail(service, companyPrefectureID);

    if(!companyPrefecture) return

    const certificate = await readCredential("com.santander.nfse", "key", companyPrefecture.companyCertificate);
    const password = await readCredential("com.santander.nfse", "password", companyPrefecture.companyCertificate);

    //Caso não tenha certificado, retorna erro e grava na Schedule Log
    if (certificate == null) {
      const txt = bundle.getText("mCERTIFICATE_NOT_FOUND", [companyPrefecture.companyCertificate]);
      const tx = service.tx();
      await insertIntoNotasFiscaisScheduleLog(
        tx,
        service,
        companyPrefecture.companyID,
        companyPrefecture.prefectureID,
        companyPrefecture.CCMPrefecture,
        getDateIsoStringFromDate(lastDate),
        2,
        txt
      );
      await tx.commit();
      return;
    }

    //Transforma de base64 para binary
    var certificateAsBin = Buffer.from(certificate.value, 'base64');

    //Obtém WSDL (Alternativo ou através do endereço principal)
    setWsdlAddress(companyPrefecture);

    //Cria instancia do soapClient
    const soapClient = await buildSoapClient(certificateAsBin, password, companyPrefecture);


    // -----------------------
    //Faz a chamadas SOAP buscando nota na prefeitura em questão
    await fetchBetween(lastDate, todayDate, companyPrefecture, certificateAsBin, password, soapClient, service, bundle);
      
  } catch (e) {
    console.log(e)

    const tx = service.tx()
    await insertIntoNotasFiscaisErrorLog(
      tx,
      service,
      req.data.companyPrefectureID,
      moment(req.data.lastDate).format('yyyy-MM-DD'),
      moment(req.data.todayDate).format('yyyy-MM-DD'),
      e.message || e
    )
    tx.commit()

    throw (e);
  }

}

async function fetchBetween(startDate, todayDate, company, certificateAsBin, password, soapClient, service, bundle) {

  let currentDate = startDate
  const tx = service.tx();
  //Pega o dia que esta rodando o loop e converte para ISOString
  let dateString = getDateIsoStringFromDate(currentDate);

  //Pega as exceptions cadastradas no banco na data valida
  let textExceptions = await getTextExceptions(service, dateString);



  //Caso a procura seja com prestadores
  let vendorList = null;
  if (company.prefectureSearchVendor) {
    vendorList = await getVendorSearchList(service, company);

    if (vendorList.length == 0) {
      const message = bundle.getText("mERROR_QUERY_NOVENDORLIST", company.prefectureName);
      //const tx = service.tx();
      await insertIntoNotasFiscaisScheduleLog(
        tx,
        service,
        company.companyID,
        company.prefectureID,
        company.CCMPrefecture,
        getDateIsoStringFromDate(currentDate),
        2,
        message
      );
      await tx.commit();
      return;
    }
  }

  try {
    if (!company.prefectureParallel) {
      await fetchBetweenNotParallel(startDate, todayDate, vendorList, company, certificateAsBin, password, soapClient, textExceptions, service, bundle)
      return
    }

    //Faz o laço do dia considerado para a busca até o dia atual
    while (currentDate < todayDate) {
      console.log('COMPANY NAME: ' + company.companyName);
      console.log('PREFECTURE:' + company.prefectureName);
      console.log('PROCESSING DATE: ' + currentDate.toString());

      if (!company.prefectureSearchVendor) { //Chamada sem prestador
        //Chamada para busca das notas
        let constResFetchNFSE = await fetchNFSE(currentDate, company, null, certificateAsBin, password, soapClient, service, textExceptions, bundle);

        await insertIntoNotasFiscaisScheduleLog(
          tx,
          service,
          company.companyID,
          company.prefectureID,
          company.CCMPrefecture,
          getDateIsoStringFromDate(currentDate),
          constResFetchNFSE.status,
          constResFetchNFSE.txt
        );
        await tx.commit();

        //em caso de erro
        if (constResFetchNFSE.status == 1 || constResFetchNFSE.status == 2) {
          break; //Não segue
        };

      } else { //Chamada com prestador
        try {
          await fetchNFSEVendors(currentDate, company, vendorList, certificateAsBin, password, soapClient, service, textExceptions, bundle);

          await insertIntoNotasFiscaisScheduleLog(
            tx,
            service,
            company.companyID,
            company.prefectureID,
            company.CCMPrefecture,
            getDateIsoStringFromDate(currentDate),
            3,
            bundle.getText("mQUERY_SUCCESS")
          );
          await tx.commit();

        } catch (error) {
          await insertIntoNotasFiscaisScheduleLog(
            tx,
            service,
            company.companyID,
            company.prefectureID,
            company.CCMPrefecture,
            getDateIsoStringFromDate(currentDate),
            error.status,
            error.message
          );
          await tx.commit();

        }
      };

      //Adiciona 1 dia para a consulta de nota fiscal para Empresa/Prefeitura
      currentDate.setDate(currentDate.getDate() + 1); console.log('NEXT DATE: ' + currentDate.getDate());
    }; //while
  } catch (e) {
    console.error('ERRO: ' + e.body || e.message || e.data || e)
    const message = bundle.getText("mERROR_QUERY_COMPANY", company.companyCNPJ);
    let stackTrace;
    if (!e.stack) {
      stackTrace = JSON.stringify(e)
    } else {
      stackTrace = e.stack + "\n\n" + e.toString();
    }
    //const tx = service.tx();
    await insertIntoNotasFiscaisScheduleLog(
      tx,
      service,
      company.companyID,
      company.prefectureID,
      company.CCMPrefecture,
      getDateIsoStringFromDate(currentDate),
      2,
      message + ": " + stackTrace
    );
    await tx.commit();
  }
}

async function fetchBetweenNotParallel(currentDate, todayDate, vendorList, company, certificateAsBin, password, soapClient, textExceptions, service, bundle){
  const tx = service.tx()

  if(company.WSBetha) {
    const validCities = await getBethaCities(service)
    company.validCities = validCities
  }

  const numberOfDaysInterval = moment(todayDate).diff(currentDate, 'days')
  if(company.prefectureName === 'Barueri/SP' && numberOfDaysInterval > 60) {
    // Intervalo de dias pra Barueri não pode exceder 60 dias
    todayDate = moment(currentDate).add(60, 'days')['_d']
  }

  console.log('COMPANY NAME: ' + company.companyName);
  console.log('PREFECTURE:' + company.prefectureName);
  console.log(`PROCESSING DATE: ${currentDate.toString()} - ${todayDate}`)

  if (!company.prefectureSearchVendor) { //Chamada sem prestador
    //Chamada para busca das notas
    let constResFetchNFSE = await fetchNFSE(currentDate, company, null, certificateAsBin, password, soapClient, service, textExceptions, bundle, todayDate);

    await insertIntoNotasFiscaisScheduleLog(
      tx,
      service,
      company.companyID,
      company.prefectureID,
      company.CCMPrefecture,
      getDateIsoStringFromDate(todayDate),
      constResFetchNFSE.status,
      constResFetchNFSE.txt
    );
    await tx.commit();

    //em caso de erro
    if (constResFetchNFSE.status == 1 || constResFetchNFSE.status == 2) throw(constResFetchNFSE.txt)

  } else { //Chamada com prestador
    try {
      await fetchNFSEVendors(currentDate, company, vendorList, certificateAsBin, password, soapClient, service, textExceptions, bundle, todayDate);

      await insertIntoNotasFiscaisScheduleLog(
        tx,
        service,
        company.companyID,
        company.prefectureID,
        company.CCMPrefecture,
        getDateIsoStringFromDate(todayDate),
        3,
        bundle.getText("mQUERY_SUCCESS")
      );
      await tx.commit();

    } catch (error) {
      await insertIntoNotasFiscaisScheduleLog(
        tx,
        service,
        company.companyID,
        company.prefectureID,
        company.CCMPrefecture,
        getDateIsoStringFromDate(currentDate),
        error.status,
        error.message
      );
      await tx.commit();

    }
  };
  
}

async function fetchNFSEVendors(currentDate, company, vendorList, certificateAsBin, password, soapClient, service, textExceptions, bundle, todayDate = null) {
  const promises = [];
  for (const vendor of vendorList) {
    //Aguardar 100 milisegundos para evitar de todo mundo consultar ao mesmo tempo
    await new Promise(resolve => setTimeout(resolve, 500));

    //faz o push da promisse individual
    promises.push(fetchNFSEWrapper(
      currentDate,
      company,
      vendor,
      certificateAsBin,
      password,
      soapClient,
      service,
      textExceptions,
      bundle, 
      todayDate));
  }
  return await Promise.all(promises); 
};
async function fetchNFSEWrapper(currentDate, company, vendor, certificateAsBin, password, soapClient, service, textExceptions, bundle, todayDate) {
  
  //A Função NFSEWrapper serve para pegar o retorno da execução da função fetchNFSE (1/2 - erro | 3 - sucesso | exception - erro)
  //E retorno como exception em caso de erro, ou retorno o resultado em caso de sucesso
  try {
    const constResFetchNFSE = await fetchNFSE(currentDate, company, vendor, certificateAsBin, password, soapClient, service, textExceptions, bundle, todayDate);
    if (constResFetchNFSE.status == 1 || constResFetchNFSE.status == 2) {
      const error = new Error(constResFetchNFSE.txt); //Não segue
      error.status = constResFetchNFSE.status;
      throw error;
    } else {
      return constResFetchNFSE;
    }
  } catch (error) {
    // Quando retorna erro não pode dar throw pois da crash no server
    error.status = error.status ? error.status : 1;
    const tx = service.tx();
    
    await insertIntoNotasFiscaisScheduleLog(
      tx,
      service,
      company.companyID,
      company.prefectureID,
      company.CCMPrefecture,
      getDateIsoStringFromDate(currentDate),
      error.status,
      bundle.getText("mCONNECTION_ERROR")
    );
    await tx.commit();
  };
};

const fetchNFSE = async (currentDate, company, vendor, certificateAsBin, password, soapClient, service, textExceptions, bundle, todayDate = null) => {
  const aNotasSaved = [];

  const tx = service.tx();
  let finished = false;
  let page = 0;
  let fetchBeginDate = getDateW3CStringFromDate(currentDate);
  let fetchEndDate = getDateW3CStringFromDate(currentDate);
  if(todayDate) fetchEndDate = getDateW3CStringFromDate(todayDate)


  try {
    //Caso a opção D+1 na prefeitura estiver preenchida, adiciona 1 dia na date_end
    if (company.prefectureSearchD1) {
      let tomorowDate = todayDate ? new Date(todayDate.getTime()) : new Date(currentDate.getTime());
      tomorowDate.setDate(tomorowDate.getDate() + 1);
      fetchEndDate = getDateW3CStringFromDate(tomorowDate);
    }
    //Laço de execução por página
    while (!finished) {

      // Espera buscar notas de novo nessa prefeitura caso precise
      if(page > 0) await testIntervalCompany(company.prefectureName)

      console.log('PAGE: ' + (page + 1))
      console.log('FROM ' + fetchBeginDate + ' TO ' + fetchEndDate)

      /* //Remove os zeros a esquerda do numero do vendor
      let vendorNumber = vendor.CNPJ
      vendorNumber = Number(vendorNumber).toString();
      vendor.CNPJ = vendorNumber*/

      //Monta o envelope de requisição para a prefeitura 
      const requestXml = await buildXml(company, vendor, fetchBeginDate, fetchEndDate, page, certificateAsBin, password);
    
      //Faz a chamada na prefeitura com o xml request
      const response = await callsMethodWithRetries(soapClient, company.prefectureServiceMethod, requestXml, 2);
      
      if (response.length === 0) {
        console.log('ERROR RESPONSE')
        //Se o retorno não vier com informações, retorna erro na Schedule log com  "Connection Error",
        //seta que finalizou a consulta e coloca a data atual para não avançar outros dias no laço
        return {
          txt: bundle.getText("mCONNECTION_ERROR"), 
          status: 1
        }
      }

      let responseXml = await buildResponseXml(response, company);

      //Verificar se houve erro na reposta caso a prefeitura tem atributo para erro
      let sErrorAttr = "";
      if (company.prefectureMappingErrorAttr) {
        sErrorAttr = company.prefectureMappingErrorAttr;
      } else {
        sErrorAttr = 'Erro';
      }
      let oCheckError = await parseXMLtoObject(responseXml);

      let errorAttr = _.get(oCheckError, sErrorAttr);

      if (errorAttr) {
        console.log('ERROR RESPONSE: ' + JSON.stringify(errorAttr))

        //Se o retorno não vier com informações, retorna erro na Schedule log com  "Connection Error",
        //seta que finalizou a consulta e coloca a data atual para não avançar outros dias no laço
        return {
          txt: JSON.stringify(errorAttr),
          status: 1
        };
      }
     
      //Executa a transformação do response para um objeto com mesmo nome de campo da tabela de NOTAS FISCAIS
      let nfseListAsXml = await XslTransformBySources(responseXml, company.prefectureMappingResponseXSLT);
      
      //Faz a transformação do XML transformado para objeto
      let nfseListAsObj = await parseXMLtoObject(nfseListAsXml);

      //Se tiver o elemento '$' no objeto da nota remove ele
      nfseListAsObj = await notafiscalCustomLogic.removeXMLNameTag(nfseListAsObj, company.prefectureName)

      //Le sequencialmente as o objeto retornado
      for (var keyResponse in nfseListAsObj) {
        nfseListAsObj = nfseListAsObj[keyResponse];
        break;
      }

      //Se o objeto é uma matriz e tem conteudo, faz a leitura sequencial das notas fiscais
      if (Array.isArray(nfseListAsObj.NotaFiscal) && nfseListAsObj.NotaFiscal.length > 0) {

        console.log('NFSEs: ' + nfseListAsObj.NotaFiscal.length)

        for (var j in nfseListAsObj.NotaFiscal) {

          var notaFiscal = nfseListAsObj.NotaFiscal[j];

          // Remove not necessary array positions
          for (var ntAttr in notaFiscal) {
            if (Array.isArray(notaFiscal[ntAttr]) && notaFiscal[ntAttr].length == 1) {
              notaFiscal[ntAttr] = notaFiscal[ntAttr][0];
            }
          }

          //Preenche a empresa e prefeitura na nota fiscal
          notaFiscal["company.ID"] = company.companyID;
          notaFiscal["prefecture.ID"] = company.prefectureID;

          // Se for do Webservice Betha, salvar notas apenas de prefeituras cadastradas
          if(company.WSBetha) {
            const validCity = company.validCities.find(city => city.cityCode === notaFiscal.city)
            if(!validCity) continue
            notaFiscal["prefecture.ID"] = validCity.prefectureID;
          }

          // Insert which nfseNo do you need to test and uncomment the code
          
          /* if (notaFiscal.nfseNo != '') {
            continue;
          } */


          // Prepend zeros to the nfse number (reference)
          if(company.prefectureReferenceLength) {
            while(notaFiscal.reference.length < company.prefectureReferenceLength) notaFiscal.reference = '0' + notaFiscal.reference
          }
          
          // Remove everything that is not a number
          notaFiscal.serviceCode = getNumericDigitsOnly(notaFiscal.serviceCode)

                                  
          //Faz calculo de montantes da nota fiscal
          notaFiscal = notafiscalCustomLogic.calculcateAmounts(notaFiscal);

          //Manipula o texto de nota fiscal para preencher campos adicionais do serviço
          notaFiscal = notafiscalCustomLogic.treatSrvDescription(notaFiscal);

          //Caso a cidade retornada no XML seja string (nome da cidade), como acontece em barueri,
          //procura o respectivo código e grava o código IBGE da cidade
          notaFiscal = await notafiscalCustomLogic.searchCityString(service, notaFiscal, "city");
          notaFiscal = await notafiscalCustomLogic.searchCityString(service, notaFiscal, "srvCity");
          notaFiscal = await notafiscalCustomLogic.searchCityString(service, notaFiscal, "companyCity");

          console.log('NFSE ' + j++ + ': ' + notaFiscal.nfseNo)

          //Valida se a nota fiscal já existe ou cancela ( item especificação  7.1.6.4.2)
          /*  Descomentar "* e barra" para testar   -> */
          if (await notafiscalCustomLogic.existAndIsACancel(tx, service, notaFiscal, aNotasSaved)) {    
            //Testa se a prefeitura em questão precisa de intervalo entre as chamadas
             await testInterval(company.prefectureName)
            continue;
          }
          /*                        */

          //Verifica se a nota fiscal cai na regra de excessão ( item especificação 7.1.6.4.3)
          if (await notafiscalCustomLogic.isException(tx, service, notaFiscal, currentDate, aNotasSaved)) {
            //Testa se a prefeitura em questão precisa de intervalo entre as chamadas
             await testInterval(company.prefectureName)
            continue;
          }

          //Verifica se a nota fiscal cai na regra de excessão ( item especificação 7.1.6.4.3)
          if (await notafiscalCustomLogic.isTextException(tx, service, notaFiscal, textExceptions, aNotasSaved)) {
            //Testa se a prefeitura em questão precisa de intervalo entre as chamadas
             await testInterval(company.prefectureName)

            continue;
          }

          //Verifica se a nota fiscal é uma substituição de outra (item especificação 7.1.6.4.4)
          if (notaFiscal.nfseSubst) {
            await notafiscalCustomLogic.checkSubstitute(tx, service, notaFiscal, nfseListAsObj.NotaFiscal, aNotasSaved);
          }

          //Faz a gravação da nota fiscal
          await notafiscalCustomLogic.save(tx, service, notaFiscal, aNotasSaved);

          console.log('NFSE ' + j + ' SAVED')
        }

        // Caso encontre menos de 50 notas, termina o loop
        if(nfseListAsObj.NotaFiscal.length < 50) finished = true
        
        //Caso a busca na prefeitura não é paginada (retorna no serviço todas as notas)
        //Considera que finalizou a busca
        // Faz a gravação no schedule log como ok
        if (company.prefectureSingleQueryWithAllResults) {

          //INSERIR COMMIT DE NOTAS
          if (!aNotasSaved.length == 0) {
            console.log('NFSE_NOTASFISCAIS DB COMMIT');
            //Efetiva a gravação as notas da empresa/prefeitura/dia
            await tx.commit();
            //Faz o envio das notas para busca de PDF
            console.log('POST PDF DONE');
            await service.nfsePDF(aNotasSaved);
          }

          return {
            txt: bundle.getText("mQUERY_SUCCESS"),
            status: 3
          };


        }
      } else {
        console.log('NFSEs: 0 : return: ' + responseXml);
        finished = true;
      }


      //Não deixar o contador com mais de 300 páginas
      if (++page > 300) {
        finished = true;
      }

      console.log('NEXT PAGE')
    }

    //INSERIR COMMIT DE NOTAS
    if (!aNotasSaved.length == 0) {
      console.log('NFSE_NOTASFISCAIS DB COMMIT');
      //Efetiva a gravação as notas da empresa/prefeitura/dia
      await tx.commit();
      //Faz o envio das notas para busca de PDF
      console.log('POST PDF DONE');
      await service.nfsePDF(aNotasSaved);

    }

    return {
      txt: bundle.getText("mQUERY_SUCCESS"),
      status: 3
    };


  } catch (e) {
    console.error('ROLLBACK: ' + e)
    await tx.rollback()
    throw (e);
  }
}

async function buildXml(company, vendor, fetchBeginDate, fetchEndDate, pageCount, certificateAsBin, password) {
  //Obtem o template XML de consulta, e preenche as tags com as variaveis para consulta
  let
    vendor_CNPJ,
    vendor_CCM;

  if (vendor) {
    vendor_CNPJ = (vendor.CNPJ) ? vendor.CNPJ : '';
    vendor_CCM = (vendor.CCM) ? vendor.CCM : '';
  } else {
    vendor_CNPJ = '';
    vendor_CCM = '';
  }

  const xmlTemplate = readXmlTemplate("request", {
    CNPJ_Company: getNumericDigitsOnly(company.companyCNPJ),
    Date_begin: fetchBeginDate,
    Date_end: fetchEndDate,
    CCM_Company: (company.companyHomePrefectureID !== company.prefectureID) ? '' : getNumericDigitsOnly(company.companyCCM),
    Page_counter: pageCount + 1,
    Prefecture_CCM: company.CCMPrefecture,
    CNPJ_Vendor: vendor_CNPJ,
    CCM_Vendor: vendor_CCM
  });

  //Executa a transformação do XSLT, a partir do xslt mapping request associado a prefeitura
  let xml = await XslTransformBySources(xmlTemplate, company.prefectureMappingRequestXSLT);

  //Caso no mapeamento o XML tenha o campo assinatura, executa a assinatura do XML
  if (company.prefectureMappingSignatureField) {
    xml = await signXmlNfse(
      xml,
      company.prefectureMappingSignatureField,
      certificateAsBin,
      password.value);
  }

  //Caso campo de transformação de xml request ( < para &lt) esteja preenchido, fazer a transformação
  if (company.prefectureMappingTransXMLReq) {
    xml = xml.split("<").join("&lt;");
    xml = xml.split(">").join("&gt;");
  }

  //Se possuir Wrapper (envelope), incluir dentro do envelope cadastrado do mapping o xml request
  if (company.prefectureMappingRequestWrapper) {
    //Se o conteúdo do xml não estiver dentro de um "CDATA", retirar o header do xml
    if (company.prefectureMappingRequestWrapper.indexOf("<![[CDATA") === -1) {
      xml = xml.replace("<?xml version=\"1.0\" encoding=\"UTF-8\"?>", "");
    }
    //Incluir o wrapper no XML Request
    xml = company.prefectureMappingRequestWrapper.replace("{xmlReq}", xml);
  }

  return xml;
}

function setWsdlAddress(companyItem) {
  //Caso exista um WSDL com endereço alternativo, considera o mesmo para montagem do soapClient
  if (companyItem.prefectureAltWSDL) {
    //Alexis, verificar se isso está correto para a prefeitura PELOTAS
    companyItem.prefectureServiceAddress = companyItem.prefectureServiceAddress + companyItem.prefectureAltWSDL;
  } else {
    //Caso contrário, adiciona ?wsdl no endereço default
    companyItem.prefectureServiceAddress = companyItem.prefectureServiceAddress + "?wsdl";
  }
}

async function buildSoapClient(keyBuffer, companyCertificatePassword, company) {
  //Monta opções para montagem do sopaui
  const agent = new https.Agent({
    requestCert: true,
    rejectUnauthorized: false,
    pfx: keyBuffer,
    passphrase: companyCertificatePassword.value,
  });
  
  const options = {
    connection: 'keep-alive',
    wsdl_options: {
      forever: true,
      pfx: keyBuffer,
      passphrase: companyCertificatePassword.value,
      strictSSL: false,
      rejectUnauthorized: false,
      secureOptions: [constants.SSL_OP_NO_TLSv1_2, constants.SSL_OP_NO_SSLv3, constants.SSL_OP_NO_SSLv2],
      httpsAgent: agent
    }
  };

  if (company.prefectureSecurityOption) {
    options.wsdl_options.secureProtocol = company.prefectureSecurityOption
  }

  const soapClient = await createClientWithRetries(company.prefectureServiceAddress, options, 10);

  //Caso endereço seja HTTPs, seta o certificado para autenticação
  if (company.prefectureServiceAddress.startsWith("https:")) {
    const securityOptions = {
      strictSSL: false,
      rejectUnauthorized: false,
      secureOptions: [constants.SSL_OP_NO_TLSv1_2, constants.SSL_OP_NO_SSLv3, constants.SSL_OP_NO_SSLv2],
    }

    if(company.prefectureSecurityOption) {
      securityOptions.secureProtocol = company.prefectureSecurityOption
    }

    const prefectureEndpoint = company.prefectureServiceAddress.split('?wsdl')[0]
    
    soapClient.setEndpoint(prefectureEndpoint)
    
    soapClient.setSecurity(new soap.ClientSSLSecurityPFX(
      keyBuffer,
      companyCertificatePassword.value,
      securityOptions
    ));
  }
  return soapClient;
}
async function buildResponseXml(response, company) {
  //Caso retorne com sucesso, já recupera o item index 1 do objeto de resposta
  var responseXml = response[1];
  
  //Se a tag de resposta está preenchida na prefeitura, e o index 0 da resposta é um objeto,
  //ele recupera o campo do objeto com a tag de resposta
  if (company.prefectureMappingResponseTag && typeof response[0] == "object") {
    if(company.prefectureName === 'Maringá/PR'){
      responseXml = response[0].return.$value
    }else{
      responseXml = response[0][company.prefectureMappingResponseTag];
    }
  }

  //Quando o valor do campo de retorno definido no xml não está dentro de um CDATA, ele
  // faz o parse geral, porém precisamos que ele esteja em formato XML para realizar a conversão
  // XLT do response, para isso, é necesssário transformar o objeto para XML novamente
  if (typeof responseXml !== "string") {
    responseXml = await parseObjectToXML(responseXml);
  }

  //Caso no mapping tenha a campo para transformação de &lt para < , fazer a substituição
  if (company.prefectureMappingTransXMLResp && typeof response[0] == "string") {
    responseXml = response[0].split("&lt;").join("<");
    responseXml = responseXml.split("&gt;").join(">");
  }
  return responseXml;
}
function getTodayDate() {
  const todayDate = new Date();
  //Faz ajuste GMT -3 pra Brasil
  todayDate.setHours(todayDate.getUTCHours() - 3);//gmt -3 for brazillian
  return todayDate;
}

async function getLastDate(companyPrefecture, service) {
  //Obém a data atual e retira gmt -3 pra rodar no fuso horario brasileiro
  let lastDate = new Date()
  //Faz o calculo para subtrair o UTC
  lastDate.setHours(lastDate.getUTCHours() - 3);//gmt -3 for brazillian

  //Considera a data com hora zerada
  lastDate.setHours(0);
  lastDate.setMinutes(0);
  lastDate.setSeconds(0);

  //Obter data dia anterior - tirar
  lastDate.setDate(lastDate.getDate() - 1)

  let lastSuccessDate = await getNotasFiscaisScheduleLogByCompanyAndPrefectureWithSuccess(
    service,
    companyPrefecture.companies_ID,
    companyPrefecture.prefectures_ID,
    companyPrefecture.CCMPrefecture
  );
  //Caso não encontre a ultima com sucesso,
  if (lastSuccessDate) {
    //Caso encontre a ultima data com sucesso, considera a mesma pra fazer a busca
    lastDate = new Date(`${lastSuccessDate.readDate} 00:00:00 GMT-0300`);
  } else {
    //Faz a busca da primeira data de execução de busca da empresa na ScheduleLog
    let firstDate = await getFirstNotasFiscaisScheduleLogByCompanyAndPrefecture(
      service,
      companyPrefecture.companies_ID,
      companyPrefecture.prefectures_ID,
      companyPrefecture.CCMPrefecture
    );
    //Se encontra, considera a data da primeira execução
    if (firstDate) {
      lastDate = new Date(`${firstDate.readDate} 00:00:00 GMT-0300`);
    }
  }

  return lastDate;
}

module.exports = {
  getLastDate: getLastDate,
  getTodayDate: getTodayDate,
  handleNfseQueries: handleNfseQueries,
  handleNfseQueriesParallel: handleNfseQueriesParallel
}


