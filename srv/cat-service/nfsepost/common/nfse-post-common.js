const { insertIntoNotasFiscaisPostLog, getNotasFiscasPostParameter } = require("../../db");
const convert = require('xml-js');
//     Função para recolher todas notas fiscais com parametros corretos de envio
async function getAllNFPostParameters(service, job, bundle, tx, scheduleHost, jobId, scheduleId, runId) {

    let serviceAddress, serviceMethod, serviceCertificate, serviceXML;

    try {
        for (var i = 1; i <= 4; i++) {
            let errorLoop = false
            let mService = ""
            switch (i) {
                case 1:
                    serviceAddress = await getNotasFiscasPostParameter(service, "1");
                    if (serviceAddress == null) {
                        errorLoop = true;
                        mService = "mServiceAddress"
                    }
                    break;
                case 2:
                    serviceMethod = await getNotasFiscasPostParameter(service, "2");
                    if (serviceMethod == null) {
                        errorLoop = true;
                        mService = "mServiceMethod"
                    }
                    break;
                case 3:
                    serviceCertificate = await getNotasFiscasPostParameter(service, "3");
                    if (serviceCertificate == null) {
                        errorLoop = true;
                        mService = "mServiceCertificate"
                    }
                    break;
                case 4:
                    serviceXML = await getNotasFiscasPostParameter(service, "4");
                    if (serviceXML == null) {
                        errorLoop = true;
                        mService = "mServiceXml"
                    }
                    break;
            }
            if (errorLoop == true) {
                const txt = bundle.getText("mPARAM_NOT_FOUND", [bundle.getText(mService)]);
                var items = await insertIntoNotasFiscaisPostLog(tx, service,  null, 1, txt);
                await tx.commit();
                if (job) { await updateScheduleJob(scheduleHost, jobId, scheduleId, runId, false, txt) };
                return req.error(410, txt);
            }
        }
        return { serviceAddress, serviceMethod, serviceCertificate, serviceXML }
    } catch (e) {
        throw (e);
    }
}

//     Função para obter o PDF, transformar em base64 e insere no XML de envio
async function insertIntoXmlPDF(service, convertOptions, nota, xmlToSend) {

    try {
        //Busca o PDF que será enviado junto no XML
        const PDFHex = await service.getPDF('NotasFiscais', {id: nota.ID});
        const PDFHexSize = PDFHex.length;

        //Monta arrays com 1000 caracteres cada, para fazer o POST particionado
        const size = 1000;
        const aPDFHex = [];

        for (let i = 0; i < PDFHex.length; i += size) {
            aPDFHex.push(PDFHex.slice(i, i + size));
        }

        //Monta o padrão do PDF necessário
        let oPDF = {
            Attachment: {
                Filename: nota.ID.toString() + '.pdf',
                ContentLength: PDFHexSize,
                Attachment_Content: {
                    Content: aPDFHex,
                }
            }
        };

        const xmlPDF = convert.js2xml(oPDF, convertOptions);

        xmlToSend = xmlToSend.split('{pdfHEX}').join(xmlPDF);
    } catch (e) {
        throw (e)
    }
    return xmlToSend;
}

module.exports = {insertIntoXmlPDF, getAllNFPostParameters};