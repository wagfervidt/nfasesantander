
const convert = require('xml-js');

async function getCompaniesToQueryNfse(service) {

    return await service.read(service.entities.CompaniesPrefectures,
        [
            "companies_ID",
            "prefectures_ID",
            "CCMPrefecture",
            "ID",
            "prefectures.prefectureName",
            "prefectures.queryParallel"
        ])
        .where(
            `companies.inactive = false and prefectures.inactive = false and prefectures.queryParallel = true`
        )
        .orderBy({
            companies_id: 'asc'
        })
        /* Inserir aqui o '*' e barra para testar  
        .where(`companies_id = 'd42bcf3f-4eeb-4fa6-a74a-2725b5e672f6' and
                prefectures_id = '73d08bfe-8e38-4900-8620-48f3a5437833'`
        )
        /*                                         */
        ;
}

async function getCompPrefNotParallel(service) {

    return await service.read(service.entities.CompaniesPrefectures,
        [
            "companies_ID",
            "prefectures_ID",
            "CCMPrefecture",
            "ID",
            "prefectures.prefectureName",
            "prefectures.queryParallel"
        ])
        .where( // Selecionar apenas uma prefeitura que usa o Webservice Betha e aquela que tem o maior número de empresas ligada a ela
            `companies.inactive = false AND prefectures.inactive = false AND prefectures.queryParallel = false 
             AND prefectures.prefectureName IN ((SELECT prefectureName FROM (
                SELECT COUNT(cp.id), p.prefectureName
                FROM COM_SANTANDER_NFSE_COMPANIESPREFECTURES AS cp
                JOIN COM_SANTANDER_NFSE_PREFECTURES AS p ON p.id = cp.prefectures_ID
                WHERE p.WSBetha = true and p.inactive = false
                GROUP BY p.prefectureName
                ORDER BY COUNT(cp.id) desc
                LIMIT 1) AS prefectureName), 'Barueri/SP')`
        )
        .orderBy({
            companies_id: 'asc'
        })
}

async function getBethaCities(service) {
    const cityCodes = await service.read(service.entities.Cities, [
        'cityCode',
        'cityName'
    ])
    .where(
        `cityName IN ((
            SELECT SUBSTRING(p.prefectureName, 0, LENGTH(p.prefectureName) - 3) 
            FROM com.santander.nfse.Prefectures AS p 
            WHERE p.WSBetha = true AND p.inactive = false))`
    )

    const prefectures = await service.read(service.entities.Prefectures, [
        'ID',
        'prefectureName'
    ])
    .where({ wsBetha: true })

    for (let prefecture of prefectures) {
        let city = cityCodes.find(c => c.cityName === prefecture.prefectureName.slice(0, -3))
        city.prefectureID = prefecture.ID
    }

    return cityCodes
}

async function getCompaniesPrefecturesDetail(service, companyPrefectureID) {
    let result;
    try {
        result = await service.read(service.entities.CompaniesPrefectures,
            [
                "CCMPrefecture",
                "companies.ID as companyID",
                "companies.CNPJ as companyCNPJ",
                "companies.CCM as companyCCM",
                "companies.HOMEPREFECTURE_ID as companyHomePrefectureID",
                "companies.certificate as companyCertificate",
                "companies.companyName",
                "prefectures.ID as prefectureID",
                "prefectures.prefectureName",
                "prefectures.altWSDL as prefectureAltWSDL",
                "prefectures.onePage as prefectureSingleQueryWithAllResults",
                "prefectures.searchD1 as prefectureSearchD1",
                "prefectures.searchVendor as prefectureSearchVendor",
                "prefectures.mapping.requestXSLTSEF as prefectureMappingRequestXSLT",
                "prefectures.mapping.responseXSLTSEF as prefectureMappingResponseXSLT",
                "prefectures.mapping.transfXMLReq as prefectureMappingTransXMLReq",
                "prefectures.mapping.transfXMLResp as prefectureMappingTransXMLResp",
                "prefectures.mapping.responseTag as prefectureMappingResponseTag",
                "prefectures.mapping.errorAttr as prefectureMappingErrorAttr",
                "prefectures.mapping.signatureField as prefectureMappingSignatureField",
                "prefectures.mapping.requestWrapper as prefectureMappingRequestWrapper",
                "prefectures.serviceAddress as prefectureServiceAddress",
                "prefectures.serviceMethod as prefectureServiceMethod",
                "prefectures.methodPDF as prefectureMethodPDF",
                "prefectures.securityOption as prefectureSecurityOption",
                "prefectures.referenceLength as prefectureReferenceLength",
                "prefectures.queryParallel as prefectureParallel",
                "prefectures.WSBetha"
            ]).where({
                ID: companyPrefectureID
            });
        if (!result) {
            return null;
        } else {
            return result[0];
        }
    } catch (e) {
        throw (e)
    }


}

async function getVendorSearchList(service, company) {

    try {
        return await service.read(service.entities.NotasFiscaisVendor,
            [
                "vendor as CNPJ",
                "vendorCCM as CCM"
            ]).where({
                prefecture_ID: company.prefectureID
            });
    } catch (e) {
        throw (e)
    }


}

async function getNotasFiscaisScheduleLogByCompanyAndPrefectureWithSuccess(service, companyID, prefectureID, prefectureCCM) {
    const aPrefectureCCM = [];
    if (prefectureCCM == '' || prefectureCCM == null) {
        aPrefectureCCM.push('');
        aPrefectureCCM.push(null);
    } else {
        aPrefectureCCM.push(prefectureCCM);
    }


    let items = await service
        .read(service.entities.NotasFiscaisScheduleLog)
        .where({
            'company_ID': companyID,
            'prefecture_ID': prefectureID,
            'status_STATUS': 3,
            'CCMPrefecture': aPrefectureCCM

        })
        .orderBy({
            readDate: 'desc'
        })
        .limit(1);

    if (items.length === 0) {
        return null;
    } else {
        return items[0];
    }
}



async function getFirstNotasFiscaisScheduleLogByCompanyAndPrefecture(service, companyID, prefectureID, prefectureCCM) {
    const aPrefectureCCM = [];
    if (prefectureCCM == '' || prefectureCCM == null) {
        aPrefectureCCM.push('');
        aPrefectureCCM.push(null);
    } else {
        aPrefectureCCM.push(prefectureCCM);
    }



    let items = await service.read(service.entities.NotasFiscaisScheduleLog).where({
        "company_ID": companyID,
        "prefecture_ID": prefectureID,
        'CCMPrefecture': aPrefectureCCM
    }).orderBy({
        "readDate": 'asc'
    }).limit(1);

    if (items.length === 0) {
        return null;
    } else {
        return items[0];
    }
}

async function insertIntoNotasFiscaisPostLog(tx, service, nfseID, status, txtStatus) {
    return await
        tx.create(service.entities.NotasFiscaisPostLog).entries({
            "notafiscal_ID": nfseID,
            "status_status": status,
            "txtStatus": txtStatus
        });

}

async function insertIntoNotasFiscaisPDFLog(tx, service, loteNotas, status, txtStatus) {
    aEntries = [];
    for (let Nota of loteNotas) {
        aEntries.push({
            "notafiscal_ID": Nota,
            "status_status": status,
            "txtStatus": txtStatus
        })
    }
    return await
        tx.create(service.entities.NotasFiscaisPDFLog).entries(aEntries);
}

async function insertIntoNotasFiscaisScheduleLog(tx, service, companyID, prefectureID, prefectureCCM, readDate, status, textStatus) {

    await
        tx.create(service.entities.NotasFiscaisScheduleLog).entries({
            "company_ID": companyID,
            "prefecture_ID": prefectureID,
            "readDate": readDate,
            "CCMPrefecture": prefectureCCM,
            "status_status": status,
            "txtStatus": textStatus
        });

}

async function insertIntoNotasFiscaisLog(tx, service, notaID, oldStatus, newStatus) {

    await tx.create(service.entities.NotasFiscaisLog)
        .entries({
            "NotaFiscal_ID": notaID,
             "oldStatus_nfseStatus": oldStatus,
             "newStatus_nfseStatus": newStatus
        });
}

async function insertIntoNotasFiscaisErrorLog(tx, service, companyPrefectureID, lastDate, todayDate, message) {
    try {
        await tx.create(service.entities.NotasFiscaisErrorLog)
        .entries({
            'companyPrefecture_ID': companyPrefectureID,
            'lastDate': lastDate,
            'todayDate': todayDate,
            'message': message
        })
    } catch ( e ) {
        console.log(e)
    }
}

async function insertIntoNotasFiscaisLogSync(service, notaID, oldStatus, newStatus) {

    await
        service.create(service.entities.NotasFiscaisLog)
            .entries({
                "NotaFiscal_ID": notaID,
                "oldStatus_nfseStatus": oldStatus,
                "newStatus_nfseStatus": newStatus
            });

}

function getDecimalValue(val) {
    if (typeof val == "undefined") {
        return null;
    }
    if (typeof val == "string") {
        val = val.trim();
        if (val == "") {
            return null;
        }
    }
    return (parseInt((parseFloat(val) * 100).toFixed(0)) / 100).toFixed(2);
}

async function insertIntoNotasFiscais(tx, service, notaFiscal) {

    let notaToSave = {};

    notaToSave["company_ID"] = notaFiscal["company.ID"];
    notaToSave["prefecture_ID"] = notaFiscal["prefecture.ID"]
    notaToSave["city_cityCode"] = notaFiscal["city"];
    notaToSave["companyCity_cityCode"] = notaFiscal["companyCity"];
    notaToSave["currency_code"] = notaFiscal["currency"];
    notaToSave["vendor"] = notaFiscal["vendor"];
    notaToSave["vendorCCM"] = notaFiscal["vendorCCM"];
    notaToSave["nfseNo"] = notaFiscal["nfseNo"];
    notaToSave["docDate"] = notaFiscal["docDate"];
    notaToSave["cancelDate"] = notaFiscal["cancelDate"];
    notaToSave["nfseSubst"] = notaFiscal["nfseSubst"];
    notaToSave["veriCode"] = notaFiscal["veriCode"];
    notaToSave["signature"] = notaFiscal["signature"];
    notaToSave["vendorName"] = notaFiscal["vendorName"];
    notaToSave["barcode"] = notaFiscal["barcode"];
    notaToSave["reference"] = notaFiscal["reference"];
    notaToSave["simpleTax"] = notaFiscal["simpleTax"];
    notaToSave["serviceCode"] = notaFiscal["serviceCode"];
    notaToSave["serviceDescription"] = notaFiscal["serviceDescription"];
    notaToSave["totalAmount"] = getDecimalValue(notaFiscal["totalAmount"]); //amount
    notaToSave["totalDeductions"] = getDecimalValue(notaFiscal["totalDeductions"]);
    notaToSave["netAmount"] = getDecimalValue(notaFiscal["netAmount"]); //amount
    notaToSave["totalPIS"] = getDecimalValue(notaFiscal["totalPIS"]); //amount
    notaToSave["totalCOFINS"] = getDecimalValue(notaFiscal["totalCOFINS"]); //amount
    notaToSave["totalINSS"] = getDecimalValue(notaFiscal["totalINSS"]); //amount
    notaToSave["totalIR"] = getDecimalValue(notaFiscal["totalIR"]); //amount
    notaToSave["totalCSLL"] = getDecimalValue(notaFiscal["totalCSLL"]); //amount
    notaToSave["totalISS"] = getDecimalValue(notaFiscal["totalISS"]); //amount
    notaToSave["retISS"] = notaFiscal["retISS"];
    notaToSave["totalOtherRet"] = getDecimalValue(notaFiscal["totalOtherRet"]); //amount
    notaToSave["totalCredit"] = getDecimalValue(notaFiscal["totalCredit"]); //amount
    notaToSave["rateTax"] = getDecimalValue(notaFiscal["rateTax"]);
    notaToSave["totalTax"] = getDecimalValue(notaFiscal["totalTax"]); //amount
    notaToSave["percentTax"] = getDecimalValue(notaFiscal["percentTax"]); //amount
    notaToSave["descUnconditioned"] = getDecimalValue(notaFiscal["descUnconditioned"]); //amount
    notaToSave["descConditioned"] = getDecimalValue(notaFiscal["descConditioned"]); //amount
    notaToSave["artCode"] = notaFiscal["artCode"];
    notaToSave["ceiCode"] = notaFiscal["ceiCode"];
    notaToSave["constructionID"] = notaFiscal["constructionID"];
    notaToSave["totalReceipt"] = getDecimalValue(notaFiscal["totalReceipt"]); //amount
    notaToSave["broker"] = notaFiscal["broker"];
    notaToSave["brokerISS"] = getDecimalValue(notaFiscal["brokerISS"]);
    notaToSave["srvAmount"] = getDecimalValue(notaFiscal["srvAmount"]);//amount
    notaToSave["srvAccount"] = notaFiscal["srvAccount"];
    notaToSave["srvCostCenter"] = notaFiscal["srvCostCenter"];
    notaToSave["srvPO"] = notaFiscal["srvPO"];
    notaToSave["srvPOItem"] = notaFiscal["srvPOItem"];
    notaToSave["srvDueDate"] = notaFiscal["srvDueDate"];
    notaToSave["srvDate"] = notaFiscal["srvDate"];
    notaToSave["srvBank"] = notaFiscal["srvBank"];
    notaToSave["srvBankAgency"] = notaFiscal["srvBankAgency"];
    notaToSave["srvBankAccount"] = notaFiscal["srvBankAccount"];
    notaToSave["srvContact"] = notaFiscal["srvContact"];
    notaToSave["srvArea"] = notaFiscal["srvArea"];
    notaToSave["srvDelivery"] = notaFiscal["srvDelivery"];
    notaToSave["srvMatDoc"] = notaFiscal["srvMatDoc"];
    notaToSave["srvMatDocItem"] = notaFiscal["srvMatDocItem"];
    notaToSave["srvCity_cityCode"] = notaFiscal["srvCity"];
    notaToSave["nfseStatus"] = notaFiscal["nfseStatus"];



    if (typeof notaFiscal["nfseXML"] === 'object' && notaFiscal["nfseXML"] !== null) {
        var options = { compact: true, ignoreComment: true, spaces: 0 };
        var result = convert.json2xml(notaFiscal["nfseXML"], options);
        notaToSave["nfseXML"] = result;
    }

    notaToSave["status_nfseStatus"] = notaFiscal["status_nfseStatus"];


    for (var ntKey in notaToSave) {
        if (notaToSave[ntKey] == "" || typeof notaToSave[ntKey] == "undefined") {
            notaToSave[ntKey] = null;
        }
    }

    if (notaToSave["cancelDate"] !== null) {
        if (notaToSave["cancelDate"] instanceof Date) {
            notaToSave["cancelDate"] = notaToSave["cancelDate"].toISOString();
        }
    }
    if (notaToSave["docDate"] !== null) {
        if (notaToSave["docDate"] instanceof Date) {
            notaToSave["docDate"] = notaToSave["docDate"].toISOString();
        }
    }

    
    notaToSave["cancelDate"] = normalizeToDate(notaToSave["cancelDate"], 3);
    notaToSave["docDate"] = normalizeToDate(notaToSave["docDate"], 3);
    //notaToSave["srvDueDate"] = normalizeToDate(notaToSave["srvDueDate"], 3);
    notaToSave["srvDate"] = normalizeToDate(notaToSave["srvDate"], 0);

    notaToSave["lastDate"] = notaFiscal["lastDate"];

    return await tx.create(service.entities.NotasFiscais).entries(notaToSave);
}

function normalizeToDate(entry, fuseDif) {

    if (entry !== null) {
        if (!(entry instanceof Date)) {
            entry = new Date(entry);
        }
        entry.setHours(entry.getHours() + fuseDif); //3 based on -3 from brazillian notasfiscais
        return entry;
    }

    return entry;
}

async function getAllNotasFiscaisWithStatusToPost(service) {
    try {

        var result = await service.read('NotasFiscais', ['ID'])
            .where(`
                upPDF = true AND
                ((status_nfseStatus = 6) OR (status_nfseStatus = 7) OR (status_nfseStatus = 8))
            `);

        return result;

    } catch (e) {
        throw (e);
    }
}

function getAllNotasFiscaisWithStatusToPostPDF(service) {
    try {
        let searchDate = getTodayDate();
        searchDate.setHours(searchDate.getHours() - 8);
        return service.read('NotasFiscais', [
            "ID",
            "vendor",
            "vendorCCM",
            "veriCode",
            "nfseNo",
            "totalAmount",
            "company.CNPJ as CNPJ",
            "prefecture.methodPDF as methodPDF",
            "upPDF",
            "upPDFDate",
            "upPDFDateCall",
            "upPDFStatus",
            "upPDFStatusMsg"]
        ).where(`
            upPDF = false AND (upPDFDateCall <= '${searchDate.toISOString()}' OR upPDFDateCall = null)
        `)
        //NOTAS ENVIADAS E NÃO RETORNADAS COM MAIS DE 8 HORAS
    } catch (e) {
        throw (e)
    }
}

function getTodayDate() {
    const todayDate = new Date();
    //Faz ajuste GMT -3 pra Brasil
    todayDate.setHours(todayDate.getUTCHours() - 3);//gmt -3 for brazillian
    return todayDate;
}

async function getCityByName(service, name) {

    name = name.toLowerCase();
    var arrName = name.split(" ");
    for (var i = 0; i < arrName.length; i++) {
        var name = arrName[i].trim();
        arrName[i] = name.charAt(0).toUpperCase() + name.slice(1);
    }

    name = arrName.join(" ");

    let items = await service.read(service.entities.Cities).where({ cityName: name, or: {cityNameNoAccents: name}});
    if (items.length > 0) {
        return items[0];
    } else {
        return null;
    }
}

async function getAllNotasFiscaisWithIds(service, ids) {

    if (ids.length == 0) {
        return [];
    }
    try {
        var result = await service.read('NotasFiscais',
            nt => {
                nt("*");
                nt.city(
                    (c) => {
                        c("*")
                    }
                );
                nt.srvCity(
                    (sc) => {
                        sc("*")
                    }
                );
                nt.company(
                    (co) => {
                        co("*");
                    }
                );
                nt.companyCity(
                    (cc) => {
                        cc("*");
                    }
                );
                nt.prefecture(
                    (p) => {
                        p("*");
                    }
                );
            }
        )
            .where({
                ID: ids,
                upPDF: true,
                status_nfseStatus: ['5', '6', '7', '8']

            });//.forUpdate();

        return result;

    } catch (e) {
        throw (e);
    }
}


async function getNotaFiscalWithIdForUpdate(service, ids) {

    if (ids.length == 0) {
        return [];
    }
    try {
        var result = await service.read('NotasFiscais',
            nt => {
                nt("*");
                nt.city(
                    (c) => {
                        c("*")
                    }
                );
                nt.srvCity(
                    (sc) => {
                        sc("*")
                    }
                );
                nt.companyCity(
                    (cc) => {
                        cc("*")
                    }
                );
                nt.company(
                    (co) => {
                        co("*");
                    }
                );
                nt.prefecture(
                    (p) => {
                        p("*");
                    }
                );
            }
        )
            .where({
                ID: ids,
                upPDF: true,
                status_nfseStatus: ['5', '6', '7', '8']

            })//.forUpdate()
            ;

        return result[0];

    } catch (e) {
        throw (e);
    }
}

async function getAllNotasFiscaisWithIdsPDF(service, ids, upPDF = false) {

    if (ids.length == 0) {
        return [];
    }
    try {
        let result = await service.read('NotasFiscais', [
            "ID",
            "vendor",
            "vendorCCM",
            "veriCode",
            "nfseNo",
            "totalAmount",
            "company.CNPJ as CNPJ",
            "prefecture.methodPDF as methodPDF",
            "upPDF",
            "upPDFDate",
            "upPDFDateCall",
            "upPDFStatus",
            "upPDFStatusMsg"]
        ).where({
            ID: ids,
            upPDF

        });

        return result;

    } catch (e) {
        throw (e);
    }
}

async function getNotasFiscasPostParameter(service, id) {

    if (!id) {
        return [];
    }

    let items = await service.read(
        service.entities.NotasFiscaisPostParameters
    )
        .where(`
        (PARAMCODE_PARAM = '${id}')
    `);

    if (items.length > 0) {
        return items[0];
    } else {
        return null;
    }
}

async function updateNotaFiscalStatus(tx, service, id, status) {
    const todayDate = new Date();
    return await tx.update(service.entities.NotasFiscais).set({
        status_nfseStatus: status,
    }).where({
        ID: id
    });

}
async function updateNotaFiscalStatusPostDate(tx, service, id, status) {
    const todayDate = new Date();
    return await tx.update(service.entities.NotasFiscais).set({
        status_nfseStatus: status,
        postDate: todayDate.toISOString()
    }).where({
        ID: id
    });

}

async function updateNotaFiscalPDFStatus(tx, service, aID, status, dateCall, statusMsg) {

    return await tx.update(service.entities.NotasFiscais).set({
        upPDFDateCall: dateCall,
        upPDFStatus: status,
        upPDFStatusMsg: statusMsg
    }).where({
        ID: aID
    });

}

async function updateCompany(tx, service, Company) {
    let result;
    try {
        result = await tx.update(service.entities.Companies).set({
            "companyName": Company.nome,
            "CNPJ": Company.cnpj,
            "CCM": Company.ccm,
            "homePrefecture_ID": Company.homeprefecture_id,
            "certificate": Company.certificado,
            "description": Company.descricao,
            "inactive": false
        }).where({
            CNPJ: Company.cnpj
        });
    } catch (e) {
        throw (e)
    }
    if (!result) {
        return null;
    } else {
        return result;
    }
}

async function getCompaniesForCNPJ(service, companyCNPJ) {
    let companies;
    try {
        companies = await service.read(service.entities.Companies)
            .where({
                CNPJ: companyCNPJ
            });
    } catch (e) {
        console.log(e)
        throw (e)
    }
    if (companies.length === 0) {
        return null;
    } else {
        return company[0];
    }
}

async function getEmptyCCMPrefec(service) {
    let prefectures;

    try {
        prefectures = await service.read(service.entities.Prefectures)
            .where({
                requireCCM: 'false'
            });
    } catch (e) {
        console.log(e)
        throw (e)
    }
    if (prefectures.length === 0) {
        return null;
    } else {
        return prefectures;
    }
}

async function insertIntoCompanies(tx, service, Company) {
    return await tx.create(service.entities.Companies).entries({
        "companyName": Company.name,
        "CNPJ": Company.CNPJ,
        "CCM": Company.CCM,
        "homePrefecture_ID": Company.homeprefecture_id,
        "certificate": Company.certificate,
        "description": Company.description,
        "inactive": false
    });

}

async function insertIntoCompaniesPrefectures(tx, service, companyID, prefectureID) {
    let result;
    try {
        result = await
            tx.create(service.entities.CompaniesPrefectures).entries({
                "companies_ID": companyID,
                "prefectures_ID": prefectureID,
            });
    } catch (e) {
        throw (e);
    }
    if (result.length === 0) {
        return null;
    } else {
        return result;
    }
}

async function getCompanyPrefectureRetries(service) {
    try {
        return await service.read(service.entities.NotasFiscaisErrorLog, 
            [
                'id',
                'companyPrefecture_ID',
                'todayDate',
                'lastDate',
            ]).where('jobHasRun = false')
    } catch (e) {
        throw(e)
    }
}

async function updateNotasFiscaisErrorLogJobRun(service, tx, id) {
    try {
        return await tx.update(service.entities.NotasFiscaisErrorLog).set({
            'jobHasRun': true
        }).where({
            id
        })
    } catch (e) {
        throw(e)
    }
}

async function getTextExceptions(service, dateString) {
    let result;

    try {
        result = await service.read(service.entities.NotasFiscaisTextException,
            [
                "txtException"
            ]
        )
            .where(
                `'${dateString}' >= validFrom AND '${dateString}' <= validTo`
            );
    } catch (e) {
        throw (e);
    }
    if (!result) {
        return null;
    } else {
        return result;
    }
}

module.exports = {
    getCompPrefNotParallel: getCompPrefNotParallel,
    getTextExceptions: getTextExceptions,
    insertIntoCompaniesPrefectures: insertIntoCompaniesPrefectures,
    updateCompany: updateCompany,
    getEmptyCCMPrefec: getEmptyCCMPrefec,
    getCompaniesForCNPJ: getCompaniesForCNPJ,
    insertIntoCompanies: insertIntoCompanies,
    getCompaniesToQueryNfse: getCompaniesToQueryNfse,
    getCompaniesPrefecturesDetail: getCompaniesPrefecturesDetail,
    getVendorSearchList: getVendorSearchList,
    getNotasFiscaisScheduleLogByCompanyAndPrefectureWithSuccess: getNotasFiscaisScheduleLogByCompanyAndPrefectureWithSuccess,
    getFirstNotasFiscaisScheduleLogByCompanyAndPrefecture: getFirstNotasFiscaisScheduleLogByCompanyAndPrefecture,
    insertIntoNotasFiscaisScheduleLog: insertIntoNotasFiscaisScheduleLog,
    getAllNotasFiscaisWithStatusToPost: getAllNotasFiscaisWithStatusToPost,
    getAllNotasFiscaisWithStatusToPostPDF: getAllNotasFiscaisWithStatusToPostPDF,
    getAllNotasFiscaisWithIds: getAllNotasFiscaisWithIds,
    getNotaFiscalWithIdForUpdate: getNotaFiscalWithIdForUpdate,
    getAllNotasFiscaisWithIdsPDF: getAllNotasFiscaisWithIdsPDF,
    insertIntoNotasFiscaisPostLog: insertIntoNotasFiscaisPostLog,
    insertIntoNotasFiscaisPDFLog: insertIntoNotasFiscaisPDFLog,
    getNotasFiscasPostParameter: getNotasFiscasPostParameter,
    updateNotaFiscalStatus: updateNotaFiscalStatus,
    updateNotaFiscalStatusPostDate: updateNotaFiscalStatusPostDate,
    updateNotaFiscalPDFStatus: updateNotaFiscalPDFStatus,
    insertIntoNotasFiscaisLog: insertIntoNotasFiscaisLog,
    insertIntoNotasFiscaisLogSync: insertIntoNotasFiscaisLogSync,
    insertIntoNotasFiscais: insertIntoNotasFiscais,
    getCityByName: getCityByName,
    normalizeToDate: normalizeToDate,
    insertIntoNotasFiscaisErrorLog,
    getCompanyPrefectureRetries,
    updateNotasFiscaisErrorLogJobRun,
    getBethaCities
}
