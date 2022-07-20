//
const cds = require('@sap/cds');

const { handleUploadCompanies }         = require('./nfseupload/nfse-upload-companies');
const { handleUploadNfseScheduleLog }   = require('./nfseupload/nfse-upload-schedulelog');
const { handleUploadNfseReadException } = require('./nfseupload/nfse-upload-readexception');
const { handleUploadNfseVendor }        = require('./nfseupload/nfse-upload-vendor');
const { handleLoadCompanyPrefectures }  = require('./nfseupload/nfse-load-companiesprefectures');
const { handleDownloadTemplate }        = require('./nfseupload/nfse-download-template');

class NfseLoadData extends cds.ApplicationService {

    init(){

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Action de Carregamento de Empresas                                               //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('uploadCompanies', async (req, res) => {
            
            //const message = "SUCESSO"
            //req.res.status(202).send(JSON.stringify({ text: message }));

            try {
                const service = cds.services.NfseLoadData;
                return await handleUploadCompanies(req, service);
            } catch (e) {
                console.error('ERRO: ' + e)
            }
            //req.res.end();
        });
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Action de Carregamento de Schedule Log                                           //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('uploadScheduleLog', async (req, res) => {
            try {
                const service = cds.services.NfseLoadData;
                return await handleUploadNfseScheduleLog(req, service);
            } catch (e) {
                console.error('ERRO: ' + e)
                throw(e);
            }
   
        });    
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Action de Carregamento de Exceções (NotasFiscaisReadException)                   //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('uploadReadException', async (req, res) => {
            //const message = "SUCESSO"
            //req.res.status(202).send(JSON.stringify({ text: message }));

            try {
                const service = cds.services.NfseLoadData;
                await handleUploadNfseReadException(req, service);
            } catch (e) {
                console.error('ERRO: ' + e)
            }
            //req.res.end();
        });    
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Action de Carregamento de Prestadores (NotasFiscaisVendor)                   //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('uploadVendor', async (req, res) => {
            try {
                const service = cds.services.NfseLoadData;
                return await handleUploadNfseVendor(req, service);
            } catch (e) {
                console.error('ERRO: ' + e)
                throw(e);
            }
        }); 
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Action de Carregamento de CompaniesPrefectures a partir do nome da Prefeitura    //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('loadCompanyPrefectures', async (req, res) => {
            try {
                const service = cds.services.NfseLoadData;
                return await handleLoadCompanyPrefectures(req, service);
            } catch (e) {
                console.error('ERRO: ' + e)
                throw(e);
            }
   
        });     
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // Action de Downlod de Template de carga                                         //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('downloadTemplate', async (req, res) => {
            try {
                return await handleDownloadTemplate(req);
            } catch (e) {
                console.error('ERRO: ' + e)
                throw(e);
            }
        });
        
    return super.init();
    } 
};


module.exports = { NfseLoadData };
