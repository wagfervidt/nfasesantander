/*
-  Nfse-exception:
        Criar validações
            Data inicio não pode ser menor que data de hoje,
            Data de fim não pode ser maior que data atual,
            Data de fim não pode menor que data de hoje
            Não pode ter mais de uma empresa para o mesmo registro
*/
const cds = require('@sap/cds');
const { getBundle } = require('../common/i18n');
const { searchForWords, checkValidDate, checkValidDateUpdate, throwErrorValidation } = require('./common/service-validation')
const { getExceptionByText, getExceptionByTextID, getExceptionByID } = require('./db/nfse-exceptiondb')


class NfseExceptions extends cds.ApplicationService {
    init() {
        //NotasFiscaisReadException CREATE
        this.before('CREATE', 'NotasFiscaisReadException', async (req) => {
            let bundle = getBundle(req);
            var aux = new Date();
            var dtToday = new Date(aux.getFullYear(), aux.getMonth(), aux.getDate(), 0, 0, 0, 0);
            let msToday = dtToday.getTime();
            let msFrom = new Date(req.data.validFrom).getTime();
            let msTo = new Date(req.data.validTo).getTime();

            //Remove os zeros que podem vir antes do numero do vendor
            let vendorNumber = req.data.vendor
            vendorNumber = Number(vendorNumber).toString();
            req.data.vendor = vendorNumber

            if ((msFrom - msToday) <= 0) {
                const txt = bundle.getText("mERROR_VALIDATION", [req.data.validFrom, bundle.getText("mDATE")]);
                req.error(410, txt);
            }
            if ((msTo - msToday) <= 0) {
                const txt = bundle.getText("mERROR_VALIDATION", [req.data.validTo, bundle.getText("mDATE")]);
                req.error(410, txt);
            }

            if (msTo <= msFrom) {
                const txt = bundle.getText("mERROR_VALIDATION", [req.data.validTo, bundle.getText("mDATE")]);
                req.error(410, txt);
            }

            let aCompanies = req.data.companies
            for (let i = 0; i < aCompanies.length; i++) {
                if (aCompanies[i].company_ID == "") {
                    const txt = bundle.getText("mERROR_UNIQUE", [aCompanies[i].company_ID, bundle.getText("mCOMPANIES")]);
                    req.error(410, txt);
                }
                for (let j = i + 1; j < aCompanies.length; j++) {
                    if (aCompanies[i].company_ID === aCompanies[j].company_ID) {
                        const txt = bundle.getText("mERROR_UNIQUE", [aCompanies[i].company_ID, bundle.getText("mCOMPANIES")]);
                        req.error(410, txt);
                    }
                }
            }
        });

        this.before('UPDATE', 'NotasFiscaisReadException', async (req) => {

            const service = cds.services.CatalogService;

            let oldExcep = await service.read('com.santander.nfse.NotasFiscaisReadException')
                .where(
                    {
                        ID: req.data.ID
                    }
                );

            var aux = new Date(oldExcep[0].createdAt);
            var dtToday = new Date(aux.getFullYear(), aux.getMonth(), aux.getDate(), 0, 0, 0, 0);
            let msToday = dtToday.getTime();
            let msFrom = new Date(req.data.validFrom).getTime();
            let msTo = new Date(req.data.validTo).getTime();
            let bundle = getBundle(req);
            
            //Remove os zeros que podem vir antes do numero do vendor
            let vendorNumber = req.data.vendor
            vendorNumber = Number(vendorNumber).toString();
            req.data.vendor = vendorNumber

            if ((msFrom - msToday) <= 0) {
                const txt = bundle.getText("mERROR_VALIDATION", [req.data.validFrom, bundle.getText("mDATE")]);
                req.error(410, txt);
            }
            if ((msTo - msToday) <= 0) {
                const txt = bundle.getText("mERROR_VALIDATION", [req.data.validTo, bundle.getText("mDATE")]);
                req.error(410, txt);
            }

            if (msTo <= msFrom) {
                const txt = bundle.getText("mERROR_VALIDATION", [req.data.validTo, bundle.getText("mDATE")]);
                req.error(410, txt);
            }

            let aCompanies = req.data.companies
            for (let i = 0; i < aCompanies.length; i++) {
                if (aCompanies[i].company_ID == null) {
                    const txt = bundle.getText("mERROR_VALIDATION", [aCompanies[i].company_ID, bundle.getText("mCOMPANIES")]);
                    req.error(410, txt);
                }
                for (let j = i + 1; j < aCompanies.length; j++) {
                    if (aCompanies[i].company_ID === aCompanies[j].company_ID) {
                        const txt = bundle.getText("mERROR_VALIDATION", [aCompanies[i].company_ID, bundle.getText("mCOMPANIES")]);
                        req.error(410, txt);
                    }
                }
            }
        });

        //CompaniesPrefectures CREATE
        this.before('CREATE', 'NotasFiscaisReadExceptCompanies', async (req) => {
            console.log("UPDATE NotasFiscaisReadExceptCompanies");
            /*
                //Get transaction of the request
                const tx = cds.transaction(req);
                //Check if there another prefecture with the same "name"
                let oCompPref = await tx.read('com.santander.nfse.NotasFiscaisReadExceptCompanies')
                                    .where(
                                        { 
                                            nfseException: req.data.NfseExceptions,
                                            company:       req.data.Companies 
                                            
                                        }
                                    );
        
                if (oCompPref.length > 0) {
                    req.error(410, 'mERROR_UNIQUE', [req.data.name, 'mNAME']);
                }
            */
        });

        //CompaniesPrefectures UPDATE
        this.before('UPDATE', 'NotasFiscaisReadExceptCompanies', async (req) => {
            console.log("UPDATE NotasFiscaisReadExceptCompanies");
            /*
                //Get transaction of the request
                const tx = cds.transaction(req);
                //Check if there another prefecture with the same "name"
                let oCompPref = await tx.read('com.santander.nfse.NotasFiscaisReadExceptCompanies')
                                    .where(
                                        { 
                                            ID: {
                                                '<>': req.data.ID
                                            },
                                            nfseException: req.data.NfseExceptions,
                                            company:       req.data.Companies 
                                        }
                                        );
        
                if (oCompPref.length > 0) {
                    req.error(410, 'mERROR_UNIQUE', [req.data.name, 'mNAME']);
                }
            */

        });

        //NotasFiscaisReadException CREATE
        this.before('CREATE', 'NotasFiscaisTextException', async (req) => {
            const service = cds.services.CatalogService;
            //const tx = service.tx()

            try {
                let bundle = getBundle(req);
                let msFrom = new Date(req.data.validFrom).getTime();
                let msTo = new Date(req.data.validTo).getTime();

                //Se a data inserida for valida
                let validDate = await checkValidDate(msTo, msFrom)
                if (validDate === false) {
                    return await throwErrorValidation(1, bundle, req)  
                }

                //Se foi inserido um texto para criar e exception
                let textToCheck = req.data.txtException

                if (textToCheck) {
                    let getText;
                    //Procura se o text já existe no banco
                    if (req.data.ID) {
                       getText = await getExceptionByTextID(req.data.ID, textToCheck, service)
                    } else {
                       getText = await getExceptionByText(textToCheck, service)
                    }
                    if(getText){
                        //Erro ExceptionText já existe 
                        return await throwErrorValidation(2, bundle, req)  
                    }

                    //Procura se tem mais de 3 palavras
                    let result = await searchForWords(textToCheck, "[0-9a-zA-Z\u00C0-\u00FF\-\.\+\(\)\@\$\!\#\_\&\/]")

                    if (result) {
                        return;
                    } else{
                        return await throwErrorValidation(3, bundle, req);
                    }
                   
                } else {
                    //Erro sem palavra digitada
                    return await throwErrorValidation(4, bundle, req)                   
                }
            } catch (e) {
                throw e
            }      
        });

        this.before('UPDATE', 'NotasFiscaisTextException', async (req) => {
            const service = cds.services.CatalogService;
            //const tx = service.tx()

            try {
                let bundle = getBundle(req);
                let msFrom = new Date(req.data.validFrom).getTime();
                let msTo = new Date(req.data.validTo).getTime();

               
                //Se foi inserido um texto para criar e exception
                let textToCheck = req.data.txtException

                if (textToCheck) {

                    //Procura se o text já existe no banco
                    let getTextOld = await getExceptionByTextID(req.data.ID, textToCheck, service);
                    
                    if(getTextOld) return await throwErrorValidation(2, bundle, req);
                    

                     //Se a data inserida for valida
                    getTextOld = await getExceptionByID(req.data.ID, service);
                    let validDate = await checkValidDateUpdate(msTo, msFrom, getTextOld.validFrom);
                    if (validDate === false) return await throwErrorValidation(1, bundle, req);
                


                    //Procura se tem mais de 3 palavras
                    let result = await searchForWords(textToCheck, "[0-9a-zA-Z\u00C0-\u00FF\-\.\+\(\)\@\$\!\#\_\&\/]")
                    if (result) {
                        return;
                    } else{
                        return await throwErrorValidation(3, bundle, req);
                    }
                   
                } else {
                    //Erro sem palavra digitada
                    return await throwErrorValidation(4, bundle, req)                   
                }
            } catch (e) {
                throw e
            }      
        });
        return super.init();
    }
};


module.exports = { NfseExceptions };