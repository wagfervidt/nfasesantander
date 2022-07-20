//
const cds = require('@sap/cds');
const xsenv = require("@sap/xsenv");
const { getBundle } = require('../common/i18n');

const SapCfMailer = require('sap-cf-mailer').default;
const { handleCallExtAPP } = require('./callextapp/callextapp-service');
const { handleNfsePDF } = require('../cat-service/nfsepdf/nfse-pdf-service'); 


const { BlobServiceClient, newPipeline, AnonymousCredential } = require("@azure/storage-blob");
const { RequestIDPolicyFactory,streamToString, streamToBinary, streamToHex } = require('../cat-service/azurestorage/azurestorage');

const fs = require("fs");


class Testing extends cds.ApplicationService {
    init() {


        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // CALL EXTERNAL SERVICE                                                            //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('callExtApp', async (req) => {
            //Execução do envio de notas fiscais para o VIM
            try {
                const service = cds.services.CatalogService;
                const result = await handleCallExtAPP(req, service);
                return result;


            } catch (e) {
                return req.error(410, e.toString());
            }
        });

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // nfseMail - Envio de emails                                                       //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('nfseMail', async (req) => {
            const transporter = new SapCfMailer("NFSE-MAIL");

            const result = await transporter.sendMail({
                to: 'someoneimportant@sap.com',
                subject: `This is the mail subject`,
                text: `body of the email`

            });

            return;
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
        return super.init();
    }
};


module.exports = { Testing };
