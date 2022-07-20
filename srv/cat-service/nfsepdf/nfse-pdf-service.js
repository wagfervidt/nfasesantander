const { getBundle } = require('../../common/i18n');
const { updateScheduleJob } = require("../jobscheduler");
const {
    getAllNotasFiscaisWithStatusToPostPDF,
    getAllNotasFiscaisWithIdsPDF,
    insertIntoNotasFiscaisPDFLog,
    updateNotaFiscalPDFStatus,
    insertIntoNotasFiscaisPostLog
} = require("../db");
const { servicePOST } = require("../services/destination-service")
const xsenv = require("@sap/xsenv");
const { BlobServiceClient, newPipeline, AnonymousCredential } = require("@azure/storage-blob");
const { RequestIDPolicyFactory, streamToBuffer } = require('../azurestorage/azurestorage');
const fs = require('fs');
const archiver = require('archiver');

const getMultiPDF = async (notas) => {

    try {
        // Get process env
        xsenv.loadEnv()
        const binding = xsenv.readServices()['nfse-objectstore-service']
        const objAccount = binding.credentials.account_name
        const objToken = binding.credentials.sas_token
        const objContName = binding.credentials.container_name

        // Build pipeline and access the correct container to collect PDFs
        const pipeline = newPipeline(new AnonymousCredential())
        pipeline.factories.unshift(new RequestIDPolicyFactory("Prefix"))
        const blobServiceClient = new BlobServiceClient(
            `https://${objAccount}.blob.core.windows.net?${objToken}`,
            pipeline
        )
        const containerClient = blobServiceClient.getContainerClient(objContName)

        const pdfs = []
        const errors = []
        for (const nota of notas) {
            // Collect PDF from container 
            const blockBlobClient = containerClient.getBlockBlobClient(nota.ID.toString())
            let downloadBlockBlobResponse
            try {
                downloadBlockBlobResponse = await blockBlobClient.download(0)
            } catch (error) {
                errors.push(`Nr. NFS-e: ${nota.nfseNo}`)
                continue
            }

            // Convert container response to Buffer
            const buffer = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
            const base64 = buffer.toString('base64')

            pdfs.push({ objectID: nota.ID, base64 })
        }

        return {
            pdfs,
            errors
        }
    } catch (e) {
        throw(e)
    }
}

const handleNfsePDF = async (job, req, service, oReq) => {
    try {
        const bundle = getBundle(req.user.locale);
        const tx = service.tx();

        //Obtem os dados do job para posterior envio assincrono do retorno

        const jobId = req.headers["x-sap-job-id"];
        const scheduleId = req.headers["x-sap-job-schedule-id"];
        const runId = req.headers["x-sap-job-run-id"];
        const scheduleHost = req.headers["x-sap-scheduler-host"];

        //Caso obtenha os dados, define execução em job
        if (jobId && scheduleId && runId && scheduleHost) {
            job = true;
            // Caso não venha com ID, significa que veio do job, ou é pra executar
            // o envio de todas as pendentes de envio para o VIM de forma assincrona,
            // por isso é enviado 202
            const message = bundle.getText("mACCEPTED_ASYNC_JOB");
            req.res.status(202).send(JSON.stringify({ text: message }));
        }

        try {
            let notas
            //Caso seja em ID, busca todas as notas para enviar
            if (oReq.length == 0) {
                notas = await getAllNotasFiscaisWithStatusToPostPDF(service);
            } else {
                //Caso seja com ID, busca a nota com o ID 
                notas = await getAllNotasFiscaisWithIdsPDF(service, oReq, false);
                //select based on req.data
            }

            //Caso não encontre notas, grava no NOTASFISCAISPOSTLOG que não foi encontrado a nota fiscal
            if (notas.length == 0 || (!notas.length)) {
                const txt = bundle.getText("mERROR_NOT_FOUND_NFSE");
                await insertIntoNotasFiscaisPostLog(tx, service, null, 1, txt);
                await tx.commit();
                if (job) await updateScheduleJob(scheduleHost, jobId, scheduleId, runId, true, txt)
                // return req.error(409, txt);
                return req.res.status(204)
            }

            //Obtem JSON de chamada e Matriz com todos os IDs da chamada em lotes de 100 registros
            const { aNotas, aBody } = buildPostPDFDockerRequest(notas);


            //Faz a chamada em lotes de 100:

            for (let i = 0; i < aNotas.length; i += 1) {
                const loteNotas = aNotas[i];
                const loteBody = aBody[i];
                const dateNow = new Date().toISOString();
                try {
                    //Chamada
                    const response = await servicePOST('nfse-docker', '/pdf', null, JSON.stringify(loteBody));

                    if (response === 'Recebido') {

                        //Altera o campo PDFStatus na Nota fiscal para 0 = Enviado
                        await updateNotaFiscalPDFStatus(tx, service, loteNotas, 0, dateNow, response.toString());
                        //Insere um registro no campo PDFLOG com status 3 = Enviado com sucesso
                        await insertIntoNotasFiscaisPDFLog(tx, service, loteNotas, 3, response.toString());
                    } else {
                        //Altera o campo PDFStatus da Nota fiscal para 2 = Envio Cancelado
                        await updateNotaFiscalPDFStatus(tx, service, loteNotas, 2, dateNow, response.toString());
                        //Insere um registro no campo PDFLOG com status 2 = Envio Cancelado (pois não foi aceito)
                        await insertIntoNotasFiscaisPDFLog(tx, service, loteNotas, 2, response.toString());
                    }


                } catch (e) {

                    console.error(e);
                    const message = e.stack + "\n\n" + e.toString();
                    if (job) {
                        await updateScheduleJob(
                            scheduleHost,
                            jobId,
                            scheduleId,
                            runId,
                            false,
                            message
                        );
                    }
                    //Altera o campo PDFStatus da Nota fiscal para 2 = Envio Cancelado
                    await updateNotaFiscalPDFStatus(tx, service, loteNotas.ID, 2, dateNow, message);
                    //Insere um registro no campo PDFLOG com status 1 = Erro no envio (exceção)
                    await insertIntoNotasFiscaisPDFLog(tx, service, loteNotas.ID, 1, null, message);
                }
            }

            await tx.commit();
            //Em caso de sucesso e for job, atualiza status
            if (job) {
                const txt = bundle.getText("mSUCCESS");
                await updateScheduleJob(
                    scheduleHost,
                    jobId,
                    scheduleId,
                    runId,
                    true,
                    txt
                );
            }
        } catch (e) {
            console.error(e);
            const message = e.stack + "\n\n" + e.toString();
            if (job) {
                await updateScheduleJob(
                    scheduleHost,
                    jobId,
                    scheduleId,
                    runId,
                    false,
                    message
                );
            }
            await insertIntoNotasFiscaisPDFLog(tx, service, 1, null, message);
            await tx.commit();
            throw e;
        }
    } catch (e) {
        throw e;
    }
};

const buildPostPDFDockerRequest = (notas) => {
    const aNotasFull = [];
    const aBodyFull = [];
    // Monta as arrays completas de ID (aNotasFull) e de request (oBodyFull)
    for (let nota of notas) {
        aNotasFull.push(nota.ID);

        aBodyFull.push(
            {
                ID: nota.ID,
                methodPDF: nota.methodPDF,
                nfseNo: nota.nfseNo,
                vendor: nota.vendor,
                vendorCCM: nota.vendorCCM,
                veriCode: nota.veriCode,
                companyCNPJ: nota.CNPJ,
                totalAmount: nota.totalAmount
            }
        )
    }

    //Monta array de arrays com 100 registros cada, para fazer o POST particionado
    const size = 100;
    const aNotas = [];
    const aBody = [];
    for (let i = 0; i < aNotasFull.length; i += size) {
        aNotas.push(aNotasFull.slice(i, i + size));
        aBody.push(aBodyFull.slice(i, i + size));
    }
    return { aNotas, aBody };
}

module.exports = {
    handleNfsePDF: handleNfsePDF,
    getMultiPDF: getMultiPDF
}
