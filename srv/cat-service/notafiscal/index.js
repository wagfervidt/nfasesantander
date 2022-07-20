const stringManipulation = require("../stringManipulation");
const descriptionTreatment = require("./descriptionTreatments");
const { isTxtException } = require("./descriptionTreatments")
const db = require("../db");


const notaFiscalDescriptionTreatments = [];

function addNotaFiscalDescriptionTreatment(is, treat) {
    notaFiscalDescriptionTreatments.push({
        is: is,
        treat: treat
    });
}

addNotaFiscalDescriptionTreatment(descriptionTreatment.isPedido, descriptionTreatment.treatPedido);
addNotaFiscalDescriptionTreatment(descriptionTreatment.isItem, descriptionTreatment.treatItem);
addNotaFiscalDescriptionTreatment(descriptionTreatment.isContato, descriptionTreatment.treatContato);
addNotaFiscalDescriptionTreatment(descriptionTreatment.isCC, descriptionTreatment.treatCC);
addNotaFiscalDescriptionTreatment(descriptionTreatment.isConta, descriptionTreatment.treatConta);
addNotaFiscalDescriptionTreatment(descriptionTreatment.isUniorg, descriptionTreatment.treatUniorg);
addNotaFiscalDescriptionTreatment(descriptionTreatment.isVencimento, descriptionTreatment.treatVencimento);
addNotaFiscalDescriptionTreatment(descriptionTreatment.isBanco, descriptionTreatment.treatBanco);
addNotaFiscalDescriptionTreatment(descriptionTreatment.isArea, descriptionTreatment.treatArea);
addNotaFiscalDescriptionTreatment(descriptionTreatment.isAgencia, descriptionTreatment.treatAgencia);


function checkLineVariableAndTreat(line, notafiscal) {

    for (let key in notaFiscalDescriptionTreatments) {
        let notaFiscalDescriptionTreatment = notaFiscalDescriptionTreatments[key];
        if (notaFiscalDescriptionTreatment.is(line)) {
            notafiscal = notaFiscalDescriptionTreatment.treat(line, notafiscal);
        }
    }
    return notafiscal;
}

function calculcateAmounts(notafiscal) {

    if (!notafiscal.netAmount) {

        let total = notafiscal.totalAmount == '' ? 0 : parseFloat(notafiscal.totalAmount);
        let PIS = notafiscal.totalPIS == '' ? 0 : parseFloat(notafiscal.totalPIS);
        let COFINS = notafiscal.totalCOFINS == '' ? 0 : parseFloat(notafiscal.totalCOFINS);
        let INSS = notafiscal.totalINSS == '' ? 0 : parseFloat(notafiscal.totalINSS);
        let IR = notafiscal.totalIR == '' ? 0 : parseFloat(notafiscal.totalIR);
        let CSLL = notafiscal.totalCSLL == '' ? 0 : parseFloat(notafiscal.totalCSLL);
        let ISS = notafiscal.totalISS == '' ? 0 : parseFloat(notafiscal.totalISS);

        notafiscal.netAmount = (
            total //- 
            // PIS - 
            // COFINS - 
            // INSS - 
            // IR - 
            // CSLL - 
            // ISS
        ).toFixed(2);

    }


    return notafiscal;
}

function treatSrvDescription(notafiscal) {
    let sanitizedSrvDescription = notafiscal.serviceDescription;

    if (!sanitizedSrvDescription) {
        sanitizedSrvDescription = notafiscal.srvDescription;
    }
    if (!sanitizedSrvDescription) {
        return notafiscal;
    }
    if (Array.isArray(sanitizedSrvDescription)) {
        sanitizedSrvDescription = sanitizedSrvDescription.join("\r\n");
    }
    sanitizedSrvDescription = stringManipulation.removeAccents(sanitizedSrvDescription);
    sanitizedSrvDescription = stringManipulation.convertNLtoCRLF(sanitizedSrvDescription);

    let lines = sanitizedSrvDescription.split(/\r\n/);
    for (var l = 0; l < lines.length; l++) {
        notafiscal = checkLineVariableAndTreat(lines[l], notafiscal);
    }
    return notafiscal;
}

async function existAndIsACancel(tx, service, notafiscal, aNotasSaved) {
    //Busca nota fiscal no sistema com mesmo número, CPNJ fornecedor e inscrição municipal
    let items = await service.read("NotasFiscais").where({
        "company.ID": notafiscal["company.ID"],
        "prefecture.ID": notafiscal["prefecture.ID"],
        vendor: notafiscal.vendor,
        vendorCCM: notafiscal.vendorCCM,
        nfseNo: notafiscal.nfseNo
    });

    //Caso não encontra, retorna falso
    if (items.length == 0) {
        return false;
    }

    let item = items[0];
    //
    // CASO SEJA CANCELAMENTO (CancelDate preenchido) //
    //
    if (notafiscal.cancelDate) {

        notafiscal.cancelDate = db.normalizeToDate(notafiscal.cancelDate, 3).toISOString();
        //Caso a nota fiscal tenha Status:
        // 1 = Erro na busca de NFS-E
        // 2 = Erro ao executar transformação
        // 5 = Pendente de informações
        // 6 = Pendente de envio
        // 8 = Erro no envio
        if (item.status_nfseStatus == "1" || item.status_nfseStatus == "2" || item.status_nfseStatus == "5" || item.status_nfseStatus == "6" || item.status_nfseStatus == "8") {
            //Atualiza a nota fiscal  como cancelada
            await tx.update('NotasFiscais').set({
                nfseStatus: notafiscal.nfseStatus,
                cancelDate: notafiscal.cancelDate,
                lastDate: notafiscal.cancelDate.substr(0, 10),
                status_nfseStatus: "3",
                upPDF: false
            }).where({
                ID: item.ID
            });
            if (item.ID) { aNotasSaved.push(item.ID) };
            //await db.insertIntoNotasFiscaisLog(tx, service, item.ID, item.status_nfseStatus, 3);
            return true;
        }

        // Caso a nota fiscal tenha Status 4 - Não considerada(exceção/manualmente) atualiza a nota fiscal
        // para cancelada com os dados da nota fiscal atualizada
        if (item.status_nfseStatus == "4" || item.status_nfseStatus == "11") {
            await tx.update('NotasFiscais').set({
                nfseStatus: notafiscal.nfseStatus,
                cancelDate: notafiscal.cancelDate,
                lastDate: notafiscal.cancelDate.substr(0, 10),
                status_nfseStatus: "3",
                upPDF: false
            }).where({
                ID: item.ID
            });
            if (item.ID) { aNotasSaved.push(item.ID) };
            //await db.insertIntoNotasFiscaisLog(tx, service, item.ID, item.status_nfseStatus, 3);
            return true;
        }

        // Caso o status seja:
        // 3 - Cancelada
        // 7 - Pendente de envio de cancelamento
        // 9 - Cancelamento processado
        // Retorna como TRUE
        if (item.status_nfseStatus == "3" || item.status_nfseStatus == "7" || item.status_nfseStatus == "9") {
            return true;
        }

        // Caso a nota fiscal tenha Status 10 - Processada atualiza a nota fiscal
        // para Pendente de envio de cancelamento com os dados da nota fiscal atualizada
        if (item.status_nfseStatus == "10") {
            await tx.update('NotasFiscais').set({
                nfseStatus: notafiscal.nfseStatus,
                cancelDate: notafiscal.cancelDate,
                lastDate: notafiscal.cancelDate.substr(0, 10),
                status_nfseStatus: "7",
                postDate: null,
                upPDF: false
            }).where({
                ID: item.ID
            });
            if (item.ID) { aNotasSaved.push(item.ID) };
            //await db.insertIntoNotasFiscaisLog(tx, service, item.ID, item.status_nfseStatus, 7);
            return true;
        }
    }


    return true;

}

async function isException(tx, service, notafiscal, date, aNotasSaved) {

    var dateString = stringManipulation.getDateIsoStringFromDate(date);

    //Remove os zeros que podem vir antes do numero do vendor para comparar com as exceções do sistema
    let vendorNumber = notafiscal.vendor
    vendorNumber = Number(vendorNumber).toString();

    //Procura se tem exceção no banco que é compativel com a numero do vendor da nota
    let readExceptions = await service.read("NotasFiscaisReadException",
        ntre => {
            ntre("*");
            ntre.companies(
                (c) => {
                    c("*");
                    c.company((co) => {
                        co("*");
                    })
                }
            )
        }
    ).where(`vendor = '${vendorNumber}' AND '${dateString}' >= validFrom AND '${dateString}' <= validTo`);

    ;

    for (var key in readExceptions) {
        let readException = readExceptions[key];

        if (readException.companies && readException.companies.length > 0) {
            for (var keyC in readException.companies) {
                let company = readException.companies[keyC].company;

                if (company.ID == notafiscal["company.ID"]) {
                    notafiscal.status_nfseStatus = "4";
                    const notaSaved = await db.insertIntoNotasFiscais(tx, service, notafiscal);
                    if (notaSaved.ID) {
                        aNotasSaved.push(notaSaved.ID)
                    }
                    return true;
                }
            }
        } else {
            notafiscal.status_nfseStatus = "4";
            notafiscal.lastDate = notafiscal.docDate.substr(0, 10);
            const notaSaved = await db.insertIntoNotasFiscais(tx, service, notafiscal);
            if (notaSaved.ID) {
                aNotasSaved.push(notaSaved.ID)
            }
            return true;
        }
    }

    return false;
}

async function isTextException(tx, service, notafiscal, textExceptions, aNotasSaved) {
    try {

        if (!textExceptions) {
            return false;
        }

        if (textExceptions.length == 0) {
            return false;
        }

        let sanitizedSrvDescription = notafiscal.serviceDescription;

        if (!sanitizedSrvDescription) {
            sanitizedSrvDescription = notafiscal.srvDescription;
        }
        if (!sanitizedSrvDescription) {
            return false;
        }
        if (Array.isArray(sanitizedSrvDescription)) {
            sanitizedSrvDescription = sanitizedSrvDescription.join("\r\n");
        }
        sanitizedSrvDescription = stringManipulation.removeAccents(sanitizedSrvDescription);
        sanitizedSrvDescription = stringManipulation.convertNLtoCRLF(sanitizedSrvDescription);

        //Quebra o texto em linhas
        let lines = sanitizedSrvDescription.split(/\r\n/);
        let checkTextException = false;

        //Laço de linhas da descrição da nota
        for (line of lines) {
            //Laço de exceptions para ser testado
            for (textException of textExceptions) {
                let isException = await isTxtException(line, stringManipulation.removeAccents(textException.txtException));
                if (isException) {
                    checkTextException = true;
                    break;
                }
            }
            if (checkTextException) break;
        }
        if (checkTextException) {
            notafiscal.status_nfseStatus = "4";
            notafiscal.lastDate = notafiscal.docDate.substr(0, 10);
            const notaSaved = await db.insertIntoNotasFiscais(tx, service, notafiscal);
            if (notaSaved.ID) {
                aNotasSaved.push(notaSaved.ID)
            }
            return true;
        } else {
            return false;
        }
    } catch (e) {
        throw e
    }

}

async function checkSubstitute(tx, service, notafiscal, notaFiscalLista, aNotasSaved) {

    let notasCancel = notafiscal.nfseSubst.split(' ');

    //Busca se tem a nota a ser substituida no sistema
    var items = await service.read("NotasFiscais").where({
        //"company.ID": notafiscal["company.ID"],
        "prefecture.ID": notafiscal["prefecture.ID"],
        vendor: notafiscal.vendor,
        vendorCCM: notafiscal.vendorCCM,
        nfseNo: notasCancel
    });

    if (items.length > 0) {
        for (let item of items) {

            //Caso já esteja com data de cancelamento, desconsidera
            if (item.cancelDate) {
                continue;
            }

            //Verifica se a nota tem um cancelDate
            if(notafiscal.cancelDate){
                notafiscal.cancelDate = db.normalizeToDate(notafiscal.cancelDate, 3).toISOString();
            }
            
            //Caso não esteja com data de cancelamento, verificar o status 
            if (
                item.status_nfseStatus == "1" ||  // 1 - Erro na busca de NFS-E
                item.status_nfseStatus == "2" ||  // 2 - Erro ao executar transformação
                item.status_nfseStatus == "5" ||  // 5 - Pendente de informações
                item.status_nfseStatus == "6" ||  // 6 - Pendente de envio
                item.status_nfseStatus == "8") {   // 8 - Erro no envio

                //Atualizar a nota para cancelada
                if(notafiscal.cancelDate){
                    await tx.update('NotasFiscais').set({
                        nfseStatus: notafiscal.nfseStatus,
                        cancelDate: notafiscal.cancelDate,
                        lastDate: notafiscal.cancelDate.substr(0, 10),
                        status_nfseStatus: "3",
                        upPDF: false
                    }).where({
                        ID: item.ID
                    });
                }else{
                    await tx.update('NotasFiscais').set({
                        nfseStatus: notafiscal.nfseStatus,
                        cancelDate: notafiscal.docDate,
                        lastDate: notafiscal.docDate.substr(0, 10),
                        status_nfseStatus: "3",
                        upPDF: false
                    }).where({
                        ID: item.ID
                    });
                }
                 
                if (item.ID) { aNotasSaved.push(item.ID) };
                //await db.insertIntoNotasFiscaisLog(tx, service, item.ID, item.status_nfseStatus, 3);
                continue;
            }

            //Caso a nota esteja como não considerada (excessão ou manualmente) alterar status para cancelada
            if (item.status_nfseStatus == "4" || item.status_nfseStatus == "11") {

                if(notafiscal.cancelDate){
                    await tx.update('NotasFiscais').set({
                        nfseStatus: notafiscal.nfseStatus,
                        cancelDate: notafiscal.cancelDate,
                        lastDate: notafiscal.cancelDate.substr(0, 10),
                        status_nfseStatus: "3",
                        upPDF: false
                    }).where({
                        ID: item.ID
                    });
                }else{
                    await tx.update('NotasFiscais').set({
                        nfseStatus: notafiscal.nfseStatus,
                        cancelDate: notafiscal.docDate,
                        lastDate: notafiscal.docDate.substr(0, 10),
                        status_nfseStatus: "3",
                        upPDF: false
                    }).where({
                        ID: item.ID
                    });
                }
                
                if (item.ID) { aNotasSaved.push(item.ID) };
                //await db.insertIntoNotasFiscaisLog(tx, service, item.ID, item.status_nfseStatus, 3);
                continue;
            }

            //Se nota estiver cancelada ou pendente de envio de cancelamento ou envio de cancelamento processado, não fazer nada
            if (item.status_nfseStatus == "3" || item.status_nfseStatus == "7" || item.status_nfseStatus == "9") {
                continue;
            }

            //Se ela estiver como processada, atualizar para pendente de envio cancelamento e atualizar log
            if (item.status_nfseStatus == "10") {
                if(notafiscal.cancelDate){
                    await tx.update('NotasFiscais').set({
                        nfseStatus: notafiscal.nfseStatus,
                        cancelDate: notafiscal.cancelDate,
                        lastDate: notafiscal.cancelDate.substr(0, 10),
                        status_nfseStatus: "7",
                        postDate: null,
                        upPDF: false
                    }).where({
                        ID: item.ID
                    });
                }else{
                    await tx.update('NotasFiscais').set({
                        nfseStatus: notafiscal.nfseStatus,
                        cancelDate: notafiscal.docDate,
                        lastDate: notafiscal.docDate.substr(0, 10),
                        status_nfseStatus: "7",
                        postDate: null,
                        upPDF: false
                    }).where({
                        ID: item.ID
                    });
                }
                
                if (item.ID) { aNotasSaved.push(item.ID) };
                //await db.insertIntoNotasFiscaisLog(tx, service, item.ID, item.status_nfseStatus, 7);
                continue;
            }
        }
    }else{
        //Caso a nota que esta sendo ubstituida ainda não esteja no sistema
        let cancelToApply = notafiscal.docDate

        for (nota of notaFiscalLista) {
            if(nota.nfseNo[0] === notasCancel[0]){
                nota.cancelDate[0] = cancelToApply
            }
        }
    }
}


async function save(tx, service, notafiscal, aNotasSaved) {
    try {

        //if ((notafiscal.srvPO && notafiscal.srvPOItem) || (notafiscal.srvCostCenter && notafiscal.srvAccount)) {
        if ((notafiscal.srvPO) || (notafiscal.srvAccount)) {
            notafiscal.status_nfseStatus = 6;

        } else {
            notafiscal.status_nfseStatus = 5;
        }
        if (notafiscal.cancelDate) {
            notafiscal.status_nfseStatus = 3;
            notafiscal.lastDate = notafiscal.cancelDate.substr(0, 10);
        } else {
            notafiscal.lastDate = notafiscal.docDate.substr(0, 10);
        }
        //Armazena a nota criada, para gravar o ID na array para chamar o serviço de PDF
        const notaSaved = await db.insertIntoNotasFiscais(tx, service, notafiscal);
        if (notaSaved.ID) {
            aNotasSaved.push(notaSaved.ID)
        }
    } catch (e) {
        throw (e);
    }
}

async function searchCityString(service, notaFiscal, tagCityName) {
    // caso o campo não existe na nota, sai da função
    if(!notaFiscal.hasOwnProperty(tagCityName)) return notaFiscal 

    const cityValue = (notaFiscal[tagCityName] + "").toLowerCase();

    if (/[a-z]/.exec(cityValue) !== null) {
        const city = await db.getCityByName(service, notaFiscal[tagCityName]);
        if(city) notaFiscal[tagCityName] = city.cityCode;
        else notaFiscal[tagCityName] = ''
    }

    return notaFiscal;
}

async function removeXMLNameTag(nfseListAsObj, prefecture) {
    try {
        if (nfseListAsObj.xmlRetorno.NotaFiscal) {
            let arrayNfse = nfseListAsObj.xmlRetorno.NotaFiscal

            //Remove o elemento '$' do objeto nfseXML se exsistir
            if (prefecture === 'Criciúma/SC') {
                if(nfseListAsObj.xmlRetorno.NotaFiscal[0].nfseXML[0].CompNfse[0].Nfse[0].$){
                    for (let idx = 0; idx < arrayNfse.length; idx++) {
                        delete nfseListAsObj.xmlRetorno.NotaFiscal[idx].nfseXML[0].CompNfse[0].Nfse[0].$
                    }
                }
                
            }
            if (prefecture === 'Imbituba/SC') {
                if(nfseListAsObj.xmlRetorno.NotaFiscal[0].nfseXML[0].CompNfse[0].Nfse[0].$){
                    for (let idx = 0; idx < arrayNfse.length; idx++) {
                        delete nfseListAsObj.xmlRetorno.NotaFiscal[idx].nfseXML[0].CompNfse[0].Nfse[0].$
                    }
                }
                
            }
            /*if(prefecture === 'Caxias do Sul/RS'){
                if(nfseListAsObj.xmlRetorno.NotaFiscal[0].nfseXML[0].NFS-e[0].$){
                    for (let idx = 0; idx < arrayNfse.length; idx++) {
                        delete nfseListAsObj.xmlRetorno.NotaFiscal[0].nfseXML[0].NFS-e[0].$
                    }
                }
            }*/
        }

        return nfseListAsObj;
    } catch (e) {
        throw e;
    }
}

module.exports = {
    removeXMLNameTag: removeXMLNameTag,
    treatSrvDescription: treatSrvDescription,
    isException: isException,
    isTextException: isTextException,
    checkSubstitute: checkSubstitute,
    save: save,
    searchCityString: searchCityString,
    existAndIsACancel: existAndIsACancel,
    calculcateAmounts: calculcateAmounts
}
