const { getBundle } = require('../../common/i18n');
const { getAllNotasFiscaisWithStatusToPost, getAllNotasFiscaisWithIds, getNotaFiscalWithIdForUpdate, insertIntoNotasFiscaisPostLog, updateNotaFiscalStatus, updateNotaFiscalStatusPostDate } = require("../db");
const { getAllNFPostParameters, insertIntoXmlPDF } = require("./common/nfse-post-common");
const { readCredential } = require("../credentials");
const { parseXMLtoObject } = require("../xml");
const { updateScheduleJob } = require("../jobscheduler");
const { replaceMarkersWithObject, replaceNonUsedMarkersWithEmptyString } = require("../stringManipulation");
const { servicePOST } = require("../services/destination-service")
const soap = require("soap");
const https = require('https')
const moment = require('moment')



//     FUNÇÃO PRINCIPAL QUE É EXPORTADA
async function handleNfsePost(job, req, service, oReq) {
    try {
        const bundle = getBundle(req.user.locale);
        const tx = service.tx();
        const convertOptions = { compact: true, ignoreComment: true, spaces: 0 }


        //Obtem os dados do job para posterior envio assincrono do retorno

        const jobId = req.headers["x-sap-job-id"];
        const scheduleId = req.headers["x-sap-job-schedule-id"];
        const runId = req.headers["x-sap-job-run-id"];
        const scheduleHost = req.headers["x-sap-scheduler-host"];

        //Caso obtenha os dados, define execução em job
        if ((jobId) && (scheduleId) && (runId) && (scheduleHost)) {
            job = true;
            // Caso não venha com ID, significa que veio do job, ou é pra executar 
            // o envio de todas as pendentes de envio para o VIM de forma assincrona, 
            // por isso é enviado 202                
            const message = bundle.getText("mACCEPTED_ASYNC_JOB");
            req.res.status(202).send(JSON.stringify({ text: message }));
        };


        try {
            //
            //
            //Caso seja sem ID, busca todas as notas com STATUS para chamada em paralelo:
            // 6 - Pendente de envio 
            // 7 - Pendente de envio de cancelamento
            // 8 - Erro no envio
            if (oReq.length == 0) {
                notas = await getAllNotasFiscaisWithStatusToPost(service);


                //Caso não encontre notas, grava no NOTASFISCAISPOSTLOG que não foi encontrado a nota fiscal
                if (notas.length == 0 || (!notas.length)) {
                    const txt = bundle.getText("mERROR_NOT_FOUND_NFSE");
                    await insertIntoNotasFiscaisPostLog(tx, service, null, 1, txt);
                    await tx.commit();
                    if (job) { await updateScheduleJob(scheduleHost, jobId, scheduleId, runId, false, txt) };
                    return req.error(409, txt);



                }

                //Le sequencialmente as notas para fazer o envio
                for (let nota of notas) {
                    

                   
                    //Chama a nota em paralelo externamente
                    const response = await servicePOST('nfse', '/catalog/nfsePostParallel', null, JSON.stringify(nota));

                    if (response) {
                        console.log(response + ' ' + nota.ID);
                    } else {
                        //Chama a nota em paralelo externamente novamente
                        const response = await servicePOST('nfse', '/catalog/nfsePostParallel', null, JSON.stringify(nota));
                        console.log(response + ' ' + nota.ID);
                    }
                    
                    /*
                    //Chamada interna
                    service.nfsePostParallel(nota.ID)
                    //.then((result)=>{console.log("CompanyPrefectureCalled")});
                    */
                   
                }

                if (job) {  //Caso seja job só retorna o total enviado
                    await updateScheduleJob(scheduleHost, jobId, scheduleId, runId, true, "Posted to VIM Parallel Called")
                }//Caso seja online, retorna o status de todas as notas

            } else {
                //
                //
                //Caso seja com ID, busca a nota com o ID e faz a execução online:
                // 5 - Pendente de informação
                // 6 - Pendente de envio 
                // 7 - Pendente de envio de cancelamento
                // 8 - Erro no envio
                notas = await getAllNotasFiscaisWithIds(service, oReq);
                //select based on req.data


                //Caso não encontre notas, grava no NOTASFISCAISPOSTLOG que não foi encontrado a nota fiscal
                if (notas.length == 0 || (!notas.length)) {
                    const txt = bundle.getText("mERROR_NOT_FOUND_NFSE");
                    await insertIntoNotasFiscaisPostLog(tx, service, null, 1, txt);
                    await tx.commit();
                    if (job) { await updateScheduleJob(scheduleHost, jobId, scheduleId, runId, false, txt) };
                    return req.error(409, txt);

                }

                //Busca os parâmetros de envio de nota fiscal, caso algum não esteja preenchido, retorna erro
                let { serviceAddress, serviceMethod, serviceCertificate, serviceXML } = await getAllNFPostParameters(service, job, bundle, tx, scheduleHost, jobId, scheduleId, runId)

                //Busca o certificado para autenticação do serviço, caso não encontra, retorna erro
                const credentialKey = await readCredential("com.santander.nfse", "key", serviceCertificate.paramValue);
                const credentialPassword = await readCredential("com.santander.nfse", "password", serviceCertificate.paramValue);


                if (!credentialKey || !credentialPassword) {
                    const txt = bundle.getText("mCERTIFICATE_NOT_FOUND", [serviceCertificate.paramValue]);
                    var items = await insertIntoNotasFiscaisPostLog(tx, service, null, 1, txt);
                    await tx.commit();
                    if (job) { await updateScheduleJob(scheduleHost, jobId, scheduleId, runId, false, txt) };
                    return req.error(411, txt);
                }

                //Transforma de base64 para formato correto
                const keyBuffer = Buffer.from(credentialKey.value, 'base64');

                //Monta opções para montagem do sopaui
                const agent = new https.Agent({
                    requestCert: true,
                    rejectUnauthorized: false,
                    pfx: keyBuffer,
                    passphrase: credentialPassword.value,
                })

                //Define as opções do SOAP
                const options = {
                    wsdl_options: {
                        pfx: keyBuffer,
                        passphrase: credentialPassword.value,
                        httpsAgent: agent
                    },
                };
                
                //Cria o objeto soapClient
                let soapClient = await soap.createClientAsync(serviceAddress.paramValue + "?wsdl", options);

                //Define a segurança de autenticação
                soapClient.setSecurity(new soap.ClientSSLSecurityPFX(
                    keyBuffer,
                    credentialPassword.value,
                    {
                        strictSSL: false,
                    },
                ));

                var postLogItems = [];


                //Le sequencialmente as notas para fazer o envio
                for (let nota of notas) {

                    nota.docDate = moment(nota.docDate).utcOffset(-3).format('YYYY-MM-DD') // Enviar data de emissão com fuso horário do Brasil
                    postLogItems = await postToVim(tx, service, soapClient, serviceMethod, serviceXML, convertOptions, nota, postLogItems, true, bundle);

                }

                if (job) {  //Caso seja job só retorna o total enviado
                    await updateScheduleJob(scheduleHost, jobId, scheduleId, runId, true, "Posted to VIM (total: " + postLogItems.length + ")")
                }//Caso seja online, retorna o status de todas as notas

                return postLogItems;

            }

        } catch (e) {
            console.error(e);
            const message = e;

            if (job) { await updateScheduleJob(scheduleHost, jobId, scheduleId, runId, false, message) };

            if (service != null) {
                await insertIntoNotasFiscaisPostLog(tx, service, null, 1, e.toString());
                await tx.commit();
            }
            throw (e);
        }
    } catch (e) {
        throw (e);
    }
}



//     FUNÇÃO PRINCIPAL QUE É EXPORTADA
async function handleNfsePostParallel(req, service) {
    try {
        const bundle = getBundle(req.user.locale);
        ////const tx = service.tx();
        const convertOptions = { compact: true, ignoreComment: true, spaces: 0 }


        try {

            nota = await getNotaFiscalWithIdForUpdate(service, req.data.ID);

            //Caso não encontre notas, grava no NOTASFISCAISPOSTLOG que não foi encontrado a nota fiscal
            if (!nota) {
                const txt = bundle.getText("mERROR_NOT_FOUND_NFSE");
                await insertIntoNotasFiscaisPostLog(service, service, null, 1, txt);
                return req.error(409, txt);

            }

            nota.docDate = moment(nota.docDate).utcOffset(-3).format('YYYY-MM-DD') // Enviar data de emissão com fuso horário do Brasil

            //Busca os parâmetros de envio de nota fiscal, caso algum não esteja preenchido, retorna erro
            let { serviceAddress, serviceMethod, serviceCertificate, serviceXML } = await getAllNFPostParameters(service, null, bundle, service, null, null, null, null)

            //Busca o certificado para autenticação do serviço, caso não encontra, retorna erro
            const credentialKey = await readCredential("com.santander.nfse", "key", serviceCertificate.paramValue);
            const credentialPassword = await readCredential("com.santander.nfse", "password", serviceCertificate.paramValue);


            if (!credentialKey || !credentialPassword) {
                const txt = bundle.getText("mCERTIFICATE_NOT_FOUND", [serviceCertificate.paramValue]);
                var items = await insertIntoNotasFiscaisPostLog(service, service, null, 1, txt);
                return req.error(411, txt);
            }

            //Transforma de base64 para formato correto
            const keyBuffer = Buffer.from(credentialKey.value, 'base64');

            //Monta opções para montagem do sopaui
            const agent = new https.Agent({
                requestCert: true,
                rejectUnauthorized: false,
                pfx: keyBuffer,
                passphrase: credentialPassword.value,
            })
            
            //Define as opções do SOAP
            const options = {
                wsdl_options: {
                    pfx: keyBuffer,
                    passphrase: credentialPassword.value,
                    httpsAgent: agent
                },
            };
            //Cria o objeto soapClient
            let soapClient = await soap.createClientAsync(serviceAddress.paramValue + "?wsdl", options);

            //Define a segurança de autenticação
            soapClient.setSecurity(new soap.ClientSSLSecurityPFX(
                keyBuffer,
                credentialPassword.value,
                {
                    strictSSL: false,
                },
            ));

            var postLogItems = [];


            //Le sequencialmente as notas para fazer o envio

            return await postToVim(service, service, soapClient, serviceMethod, serviceXML, convertOptions, nota, postLogItems, false, bundle);





        } catch (e) {
            console.error(e)
            const message = e;

            if (service != null) {
                await insertIntoNotasFiscaisPostLog(service, service, null, 1, e.toString());
            }
            throw (e);
        }
    } catch (e) {
        throw (e);
    }
};


async function postToVim(tx, service, soapClient, serviceMethod, serviceXML, convertOptions, nota, postLogItems, commit, bundle) {
    try {
        //Caso nota esteja pendente de envio ou erro de envio
        //
        if (nota.status_nfseStatus == 5 || nota.status_nfseStatus == 6 || nota.status_nfseStatus == 8) {

            //Caso o pedido e item estiver preenchido, deve-se limpar para o envio a conta contábil e centro de custo 
            if (nota.srvPO) {
                nota.srvAccount = "";
                nota.srvCostCenter = "";

                //Caso a conta e centro de custo estiver preenchido, deve-se limpar o pedido e item
            } else if (nota.srvAccount) {
                nota.srvPO = "";
                nota.srvPOItem = "";
            }

            //Retirar cr lf da descrição
            nota.serviceDescription = (nota.serviceDescription + "").split(/[\r\n]+/g).join(" ");

            nota.serviceDescription = nota.serviceDescription.split("&").join("E");
        
            //Obter o XML de envio como string
            let xmlToSend = serviceXML.paramValue + "";//new string
            let xmlToSendLog = "";

            //Fazer a substituição dos markers para os valores do objeto da nota
            xmlToSend = replaceMarkersWithObject(xmlToSend, nota, null, 4, 0);
            xmlToSendLog = xmlToSend; //xml sem pdf para log


            xmlToSend = await insertIntoXmlPDF(service, convertOptions, nota, xmlToSend);


            //O que não foi substituido deixa vazio
            xmlToSend = replaceNonUsedMarkersWithEmptyString(xmlToSend);
            xmlToSendLog = replaceNonUsedMarkersWithEmptyString(xmlToSendLog);

            //Fazer a chamada
            let response = await soapClient[serviceMethod.paramValue + "Async"]({
                _xml: xmlToSend
            });

            //Obter a resposta
            let responseJs = await parseXMLtoObject(response[1]);

            let valResponseJs;

            let respostaVim;

            //Verificar se houve sucesso no retorno
            responseJs = responseJs["soap:Envelope"]["soap:Body"][0];

            //obtem tag VIMMessageOut
            if (responseJs.VIMMessageOut){
                
                valResponseJs = responseJs.VIMMessageOut;
            } else {
                valResponseJs = responseJs["ns2:VIMMessageOut"];
            }

            //Caso Resultado seja um array, pega primeira linha
            if (Array.isArray(valResponseJs)){
                valResponseJs = valResponseJs[0];
            }

            //obtem tag Success
            if (Array.isArray(valResponseJs)){
                valResponseJs = valResponseJs["success"];
            } else {
                valResponseJs = valResponseJs.success;
            }

            //Caso Resultado seja um array, pega primeira linha
            if (Array.isArray(valResponseJs)){
                respostaVim = valResponseJs[0];
            } else {
                respostaVim = valResponseJs;
            }




            //let respostaVim = responseJs["soap:Envelope"]["soap:Body"][0]["ns2:VIMMessageOut"][0]["success"][0];

            if (respostaVim == "X") {
                let txt = bundle.getText("mPOST_SUCCESS");
                await updateNotaFiscalStatusPostDate(tx, service, nota.ID, 10);
                postLogItems = postLogItems.concat(await insertIntoNotasFiscaisPostLog(tx, service, nota.ID, 3, txt));
                if (commit) tx.commit();
                console.log(nota.ID + 'posted');
                return postLogItems;
            } else {
                let txt = bundle.getText("mPOST_ERROR");
                txt = txt + ': ' + xmlToSendLog;
                postLogItems = postLogItems.concat(await insertIntoNotasFiscaisPostLog(tx, service, nota.ID, 1, txt));
                if (commit) tx.commit();
                return postLogItems;
            }

            // Em caso de pendente de envio de cancelamento
        } else if (nota.status_nfseStatus == 7) {
            //7.1.3.4 cancelamento
        }

    } catch (e) {
        if (e.stack) { 
            throw(e.stack);
        } else {
        throw (e);
        }
    }
};


module.exports.handleNfsePost = handleNfsePost;
module.exports.handleNfsePostParallel = handleNfsePostParallel;
