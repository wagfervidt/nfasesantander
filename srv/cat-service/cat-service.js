//
const cds = require('@sap/cds');
const xsenv = require("@sap/xsenv");
const { getBundle } = require('../common/i18n');

const { handleNfseQueries, handleNfseQueriesParallel } = require('./nfsequeries/nfse-queries-service');
const { handleNfsePost, handleNfsePostParallel } = require('./nfsepost/nfse-post-service');
const { handleNfseArchive } = require('./nfsearchive/nfse-archive-service');
const { handleNfsePDF, getMultiPDF } = require('./nfsepdf/nfse-pdf-service');
const { getTodayDate, getLastDate } = require('./nfsequeries/nfse-queries-service');
const { BlobServiceClient, newPipeline, AnonymousCredential } = require("@azure/storage-blob");

const { RequestIDPolicyFactory, streamToHex } = require('./azurestorage/azurestorage');
const { insertIntoNotasFiscaisLogSync, 
        getCompPrefNotParallel, 
        getCompanyPrefectureRetries, 
        updateNotasFiscaisErrorLogJobRun, 
        getAllNotasFiscaisWithIdsPDF, } = require('./db/index')
const { servicePOST } = require("./services/destination-service")
const { updateScheduleJob } = require("./jobscheduler")


class CatalogService extends cds.ApplicationService {
    init() {

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // nfseQueries - Start de chamadas paralelas de Busca na prefeitura                 //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('nfseQueries', async (req) => {
            const bundle = getBundle(req.user.locale);
            const message = bundle.getText("mACCEPTED_ASYNC_JOB");
            req.res.status(202).send(JSON.stringify({ text: message }));
            try {
                //const service = cds.services.CatalogService;
                //await handleNfseQueries(req, service);
                const tx = cds.transaction(req);
                await handleNfseQueries(req, tx);

            } catch (e) {
                console.error('ERRO: ' + e)
            }
            req.res.end();
        });

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // nfseNotParallelPref - Leitura de notas fiscais na prefeitura sem parallel        //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('nfseNotParallelPref', async (req) => {
            const service = cds.services.CatalogService;
            const jobId = req.headers["x-sap-job-id"];
            const scheduleId = req.headers["x-sap-job-schedule-id"];
            const runId = req.headers["x-sap-job-run-id"];
            const scheduleHost = req.headers["x-sap-scheduler-host"];

            // Return success
            const bundle = getBundle(req.user.locale);
            const message = bundle.getText("mACCEPTED_ASYNC_JOB");
            req.res.status(202).send(JSON.stringify({ text: message }));

            try {
                // Get Companies from Prefectures with queryParallel set to false
                let companiesPrefecture = await getCompPrefNotParallel(service)

                for (let compPref of companiesPrefecture) {                    
                    const todayDate = getTodayDate()       //Obtém a data de hoje - utc 3 

                    //Obtém a para início do processamento
                    const lastDate = await getLastDate(compPref, service)

                    const loteBody = {
                        lastDate,
                        todayDate,
                        companyPrefectureID: compPref.ID
                    }

                    const response = await servicePOST('nfse', '/catalog/nfseQueriesParallel', null, JSON.stringify(loteBody))

                    if (response) {
                        console.log(response + ' ~NOTPARALLELPREF~ ' + compPref.ID);
                    } else {
                        //Chama a nota em paralelo externamente novamente
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        const response = await servicePOST('nfse', '/catalog/nfseQueriesParallel', null, JSON.stringify(loteBody));
                        console.log(response + ' ~NOTPARALLELPREF~ ' + compPref.ID);
                    }

                    await new Promise(resolve => setTimeout(resolve, 1000))
                }

                if (jobId && scheduleId && runId && scheduleHost) {
                    const message = bundle.getText("mFINISHED_PROCESSING")
                    await updateScheduleJob(scheduleHost, jobId, scheduleId, runId, true, message)
                }
            } catch (e) {
                console.error('ERRO: ' + e)
                await updateScheduleJob(scheduleHost, jobId, scheduleId, runId, false,  e.body || e.message || e.data || e.toString())
            }
            req.res.end();
        });

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // nfseQueries - Leitura de notas fiscais na prefeitura                             //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('nfseQueriesParallel', async (req) => {
            const bundle = getBundle(req.user.locale);
            const message = bundle.getText("mACCEPTED_ASYNC_JOB");
            req.res.status(202).send(JSON.stringify({ text: message }));

            try {
                const service = cds.services.CatalogService;
                await handleNfseQueriesParallel(req, service);
            } catch (e) {
                console.error('ERRO: ' + e)
            }

            req.res.end();
        });

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // nfseRetries - Leitura de notas fiscais nas prefeituras com erro                  //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('nfseQueriesRetries', async (req) => {
            const bundle = getBundle(req.user.locale);
            const message = bundle.getText("mACCEPTED_ASYNC_JOB");
            const jobId = req.headers["x-sap-job-id"];
            const scheduleId = req.headers["x-sap-job-schedule-id"];
            const runId = req.headers["x-sap-job-run-id"];
            const scheduleHost = req.headers["x-sap-scheduler-host"];
            req.res.status(202).send(JSON.stringify({ text: message }));

            try {
                const service = cds.services.CatalogService
                const companiesPrefectures = await getCompanyPrefectureRetries(service)

                for (let companyPrefecture of companiesPrefectures) {
                    const lastDate = new Date(companyPrefecture.lastDate + 'T00:00:00').toISOString()
                    const todayDate = new Date(companyPrefecture.todayDate + 'T23:59:59').toISOString()

                    const loteBody = {
                        lastDate,
                        todayDate,
                        companyPrefectureID: companyPrefecture.companyPrefecture_ID
                    }

                    const response = await servicePOST('nfse', '/catalog/nfseQueriesParallel', null, JSON.stringify(loteBody));

                    if (response) {
                        const tx = service.tx()
                        await updateNotasFiscaisErrorLogJobRun(service, tx, companyPrefecture.id)
                        await tx.commit();  
                    }
                }

                if (jobId && scheduleId && runId && scheduleHost) {
                    const message = bundle.getText("mFINISHED_PROCESSING")
                    await updateScheduleJob(scheduleHost, jobId, scheduleId, runId, true, message)
                }
            } catch (e) {
                console.error('ERRO: ' + e)
                await updateScheduleJob(scheduleHost, jobId, scheduleId, runId, false,  e.body || e.message || e.data || e.toString());
            }

            req.res.end();
        });

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // getMultiPDF - Arquivamento (leia-se eliminação) de notas fiscais                 //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('getMultiPDF', async (req) => {
            try {
                const bundle  = getBundle(req.user.locale)
                const errorTxt = bundle.getText("mNFSE_NOT_FOUND")
                const service = cds.services.CatalogService
                let notasID = req.data.notasID

                if(!notasID) return req.error(400, errorTxt)
                
                let notas = notasID.split(';')
                let notasWithPdf = await getAllNotasFiscaisWithIdsPDF(service, notas, true)

                if(notasWithPdf.length > 0) {
                    return await getMultiPDF(notasWithPdf)
                }

                return req.error(400, errorTxt)
            } catch (e) {
                console.error('ERRO: ' + e)
                return req.error(500, e)
            }
        });
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // nfseArchive - Arquivamento (leia-se eliminação) de notas fiscais                 //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('nfseArchive', async (req) => {
            
            try {
                let service = cds.services.CatalogService;
                const tx = cds.transaction(req);
                return await handleNfseArchive(req, service, tx);
            } catch (e) {
                console.error('ERRO: ' + e);
            }
        });
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // nfsePost - Envio de notas fiscais para o VIM                                     //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('nfsePost', async (req) => {
            const job = false;

            let ODataReq = req;
            let oReq = [];
            let notas = null;


            // Se vier com ID, significa que a execução é online feito pelo app, individualmente, 
            // então é obtido o ID, e mantido a constante JOB como false
            if ("data" in ODataReq && "ID" in ODataReq.data && ODataReq.data.ID !== null) {
                oReq = ODataReq.data.ID;

                //Se o ID estiver direto, o mesmo é colocado em um array
                if (!oReq.length == 0) {
                    if (!Array.isArray(oReq)) {
                        oReq = [oReq]; //unico item coloca em array
                    }
                }
                //Existe situações onde o ID virá numa lista    
            } else if ("req" in ODataReq && "query" in ODataReq.req && "items" in ODataReq.req.query) {
                oReq = ODataReq.req.query.items;
            };


            //Execução do envio de notas fiscais para o VIM
            try {

                const service = cds.services.CatalogService;
                const result = await handleNfsePost(job, req, service, oReq);

                if (job) {
                    req.res.end()
                } else {
                    return result;
                }

            } catch (e) {
                console.error('ERRO: ' + e)
            }
        });


        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // nfsePostParallel - Envio para o VIM paralelo                                     //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('nfsePostParallel', async (req) => {
            const bundle = getBundle(req.user.locale);
            const message = bundle.getText("mACCEPTED_ASYNC_JOB");
            req.res.status(202).send(JSON.stringify({ text: message }));
            try {
                const service = cds.services.CatalogService;
                await handleNfsePostParallel(req, service);

            } catch (e) {
                console.error('ERRO: ' + e)
            }
            req.res.end();
        });

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // nfsePDF - Captura de PDF na prefeitura                                           //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('nfsePDF', async (req) => {

            const job = false;
            let ODataReq = req;
            let oReq = [];
            let notas = null;

            // Se vier com ID, significa que a execução é online feito pelo app, individualmente, 
            // então é obtido o ID, e mantido a constante JOB como false
            if ("data" in ODataReq && "ID" in ODataReq.data && ODataReq.data.ID !== null) {
                oReq = ODataReq.data.ID;

                //Se o ID estiver direto, o mesmo é colocado em um array
                if (!(oReq.length === 0)) {
                    if (!Array.isArray(oReq)) {
                        oReq = [oReq]; //unico item coloca em array
                    }
                }
                //Existe situações onde o ID virá numa lista    
            } else if ("req" in ODataReq && "query" in ODataReq.req && "items" in ODataReq.req.query) {
                oReq = ODataReq.req.query.items;
            }

            //Execução do envio de notas fiscais para o VIM
            try {
                const service = cds.services.CatalogService;
                const result = await handleNfsePDF(job, req, service, oReq);

                if(!job) return result
            } catch (e) {
                console.error('ERRO: ' + e)
            }
        });

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // NOTASFISCAIS - GET PDF - Obtem o PDF de uma nota fiscal específica               //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('getPDF', 'NotasFiscais', async (req) => {
            //Obtém bundle de textos
            let bundle = getBundle(req.user.locale);
            let NotaID = null;
            if (req.data.ID) {
                //Obtém id da nota através de chamada dentro do CAP 
                NotaID = req.data.ID;
                //Se nota não foi encontrada retorna erro
                if (NotaID.length == 0) {
                    const txt = bundle.getText("mNFSE_NOT_FOUND");
                    req.error(410, txt);
                    return;
                }
            } else if (req.params[0].id) {
                //Obtém id da nota através de chamada dentro do CAP 
                NotaID = req.params[0].id
                //Se nota não foi encontrada retorna erro
                if (NotaID.length == 0) {
                    const txt = bundle.getText("mNFSE_NOT_FOUND");
                    req.error(410, txt);
                    return;
                }
                
            } else {
                //Obtém dados da nota fiscal em questão buscando via query (chamada front end)
                try {
                    let oNotaFiscal = await cds.run(req.query);

                    //Se PDF não foi carregado, retorna erro
                    if (!oNotaFiscal[0].upPDF) {
                        const txt = bundle.getText("mPDF_NOT_LOADED");
                        req.error(410, txt);
                        return;
                    }

                    //Tirando da Matriz
                    NotaID = oNotaFiscal[0].ID;

                } catch (error) {
                    const txt = bundle.getText("mNFSE_NOT_FOUND");
                    req.error(410, txt);
                    return;
                }
            }
            try {

                //Pega o process env
                xsenv.loadEnv();
                const binding = xsenv.readServices()['nfse-objectstore-service'];
                const objAccount = binding.credentials.account_name;
                const objToken = binding.credentials.sas_token;
                const objContName = binding.credentials.container_name;

                //Monta pipeline para azure
                const pipeline = newPipeline(new AnonymousCredential());

                // Inject customized factory into default pipeline
                pipeline.factories.unshift(new RequestIDPolicyFactory("Prefix"));


                //Cria o client do serviço de storage
                const blobServiceClient = new BlobServiceClient(
                    `https://${objAccount}.blob.core.windows.net?${objToken}`,
                    pipeline
                );

                //Cria o client para o container
                const containerClient = blobServiceClient.getContainerClient(objContName);

                //Cria o client para o Blob a partir do client do container
                const blockBlobClient = containerClient.getBlockBlobClient(NotaID.toString());

                //Obtém o Response do Blob
                try {
                    const downloadBlockBlobResponse = await blockBlobClient.download(0);
                    //Recupera o file via stream
                    if (req.res) {
                        req.res.status(200);
                    }
                    return await streamToHex(downloadBlockBlobResponse.readableStreamBody);


                } catch (e) {
                    const txt = bundle.getText("mPDF_NOT_FOUND");
                    req.error(410, txt);
                    return;
                }
            } catch (e) {
                req.error(410, e.toString());
                return;
            }
        });

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // NOTASFISCAIS - POST PDF - Grava o PDF de uma nota fiscal específica              //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('postPDF', 'NotasFiscais', async (req) => {

            //Pega o bundle de texto
            let bundle = getBundle(req.user.locale);

            //Obtém dados da nota fiscal em questão
            let oNotaFiscal = await cds.run(req.query);

            //Instancia objeto para atualizar nota fiscal
            const service = cds.services.CatalogService;

            //Se nota não foi encontrada retorna erro
            if (oNotaFiscal.length == 0) {
                const txt = bundle.getText("mNFSE_NOT_FOUND");
                req.error(410, txt);
                return;
            }
            /* ------------------------ commentar pra testar - inicio ------------------------*/
            //Se PDF já foi carregado, retorna erro
            if (oNotaFiscal[0].upPDF) {
                const txt = bundle.getText("mPDF_LOADED");
                req.error(410, txt);
                return;
            }

            //Verificando se existe dados pra gravar no blob
            if (!req.data.blobPDF) {
                const txt = bundle.getText("mPDF_BLOB_EMPTY");
                req.error(410, txt);
                return;
            }
            /* commentar pra testar - fim */

            //Tirando da Matriz
            oNotaFiscal = oNotaFiscal[0];


            //Pega o process env
            xsenv.loadEnv();
            const binding = xsenv.readServices()['nfse-objectstore-service'];
            const objAccount = binding.credentials.account_name;
            const objToken = binding.credentials.sas_token;
            const objContName = binding.credentials.container_name;

            ///Monta o header para o client o azure - início
            const pipeline = newPipeline(new AnonymousCredential());

            // Inject customized factory into default pipeline
            pipeline.factories.unshift(new RequestIDPolicyFactory("Prefix"));

            //Cria o client do serviço de storage
            const blobServiceClient = new BlobServiceClient(
                `https://${objAccount}.blob.core.windows.net?${objToken}`,
                pipeline
            );

            //Cria o client para o container
            const containerClient = blobServiceClient.getContainerClient(objContName);

            //Cria o client para o Blob a partir do client do container
            const blockBlobClient = containerClient.getBlockBlobClient(oNotaFiscal.ID.toString());

            /* ------------------------ descomentar pra testar - início ------------------------ 
            try {
                //Faz upload do blob do arquivo teste  
                let PDFBuffer = (fs.readFileSync(fs.realpathSync(__dirname + "/./azurestorage/teste.pdf")));
                req.data.blobPDF = PDFBuffer.buffer;

            } catch (e) {
                throw (e)
            }
            /* descomentar pra testar - fim */

            try {


                const uploadBlobResponse = await blockBlobClient.upload(req.data.blobPDF, Buffer.byteLength(req.data.blobPDF));
                //Caso esteja vazio retorna erro
                if (uploadBlobResponse._response.status == 201) {
                    //Em caso de sucesso, grava o up.pdf  
                    const txt = bundle.getText("mPDF_LOAD_SUCCESS");

                    await service.update('NotasFiscais').set({
                        upPDF: true,
                        upPDFDate: new Date().getTime(),
                        upPDFStatus: 3,
                        upPDFStatusMsg: txt

                    }).where({
                        ID: oNotaFiscal.ID
                    });

                    req.res.status(uploadBlobResponse._response.status, txt);
                    return;
                } else {
                    const txt = bundle.getText("mPDF_ERROR_LOADING");
                    await service.update('NotasFiscais').set({
                        upPDF: false,
                        upPDFDate: new Date().getTime(),
                        upPDFStatus: 1,
                        upPDFStatusMsg: txt

                    }).where({
                        ID: oNotaFiscal.ID
                    });
                    req.error(uploadBlobResponse._response.status, txt);
                    return;
                };
            } catch (error) {
                //Em caso de erro
                const txt = `${bundle.getText("mPDF_ERROR_LOADING")}: ${error.message}`;
                await service.update('NotasFiscais').set({
                    upPDF: false,
                    upPDFDate: new Date().getTime(),
                    upPDFStatus: 1,
                    upPDFStatusMsg: txt

                }).where({
                    ID: oNotaFiscal.ID
                });
                req.error(410, txt);
                return;
            }

        });

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // NOTASFISCAIS - UPDATE - Grava o log de atualização de nota fiscal                //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.before('UPDATE', 'NotasFiscais', async (req) => {

            //const service = cds.services.CatalogService;
            const tx = cds.transaction(req);
            const service = cds.services.CatalogService;

            let data = req.data;

            let oldNota = await service.read('com.santander.nfse.NotasFiscais')
                .where(
                    {
                        ID: req.data.ID
                    }
                );
            if (data.status_nfseStatus) {
                if (oldNota[0].status_nfseStatus != data.status_nfseStatus)
                    try {


                        await insertIntoNotasFiscaisLogSync(tx, data.ID, oldNota[0].status_nfseStatus, data.status_nfseStatus);
                    } catch (error) {

                    }
            }

        });

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // NOTASFISCAIS - UPDATE Status massivamente                                        //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('updateNotaFiscalStatus', async (req) => {
            const tx = cds.transaction(req);
            let aNotas = req.data.Notas.split(';');
            let status = req.data.Status;
            let oldNota = [];
            try {
                for (let nota of aNotas) {
                    let aNota = JSON.parse(nota);

                    oldNota = await tx.read(cds.services.CatalogService.entities.NotasFiscais, ['ID']).where(aNota);

                    if (oldNota.length > 0) {
                        await tx.update(cds.services.CatalogService.entities.NotasFiscais)
                            .set({
                                'status_nfseStatus': status
                            })
                            .where(oldNota[0]);

                        if (status != aNota.status_nfseStatus) await insertIntoNotasFiscaisLogSync(tx, aNota.ID, aNota.status_nfseStatus, status);
                    }
                }
            } catch (error) {
                return req.error(error);
            }
        });

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // NOTASFISCAIS - UPDATE Status individual                                          //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('updateNotaFiscalStatusIndividual', async (req) => {
            const bundle = getBundle(req.user.locale);
            const tx = cds.transaction(req);
            let oId = req.data.ID,
                nfseStatus = req.data.status_nfseStatus,
                newStatus = req.data.newStatus,
                nota = {
                    ID: oId,
                    status_nfseStatus: nfseStatus
                };

            try {
                let oldNota = await tx.read(cds.services.CatalogService.entities.NotasFiscais, ['ID']).where(nota);

                if (oldNota.length > 0) {
                    await tx.update(cds.services.CatalogService.entities.NotasFiscais)
                        .set({
                            'status_nfseStatus': newStatus
                        })
                        .where(oldNota[0]);

                    if (newStatus != nota.status_nfseStatus) await insertIntoNotasFiscaisLogSync(tx, nota.ID, nota.status_nfseStatus, newStatus);

                } else {
                    const txt = bundle.getText("mSTATUS_NOT_FOUND");
                    return {
                        errorStatus: true,
                        errorMessage: txt
                    };
                }
            } catch (error) {
                return req.error(error);
            }

        });

        return super.init();
    }
};


module.exports = { CatalogService };
