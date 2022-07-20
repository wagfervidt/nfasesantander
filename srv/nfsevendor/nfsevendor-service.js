
const cds = require ('@sap/cds');
const {getBundle} = require ('../common/i18n');

class NfseVendor extends cds.ApplicationService {
 init(){
    
    
    
    this.before('CREATE', 'NotasFiscaisVendor', async (req) => {
        //Get transaction of the request
        const tx = cds.transaction(req);
        let bundle = getBundle(req.user.locale);
        //Check if there another vendor with the same "CNPJ"
        let oVendor = await tx.read('com.santander.nfse.NotasFiscaisVendor')
                            .where({
                                vendor: req.data.vendor
                            });

        if (oVendor.length > 0) {
            const txt = bundle.getText("mERROR_UNIQUE",[req.data.vendor, bundle.getText("mVENDOR")]);
            req.error(410, txt);
        }

        let ccmVendor = req.data.vendorCCM

        ccmVendor = ccmVendor.replace(/[^0-9]/g,'');

        req.data.vendorCCM = ccmVendor


    });


    
    this.before('UPDATE', 'NotasFiscaisVendor', async (req) => {
        //Get transaction of the request
        const tx = cds.transaction(req);
        let bundle = getBundle(req.user.locale);
        //Check if there another vendor with the same "CNPJ"
        let oMapping =  await tx.read('com.santander.nfse.NotasFiscaisVendor') 
                            .where(
                                {   
                                    ID: {
                                            '<>': req.data.ID
                                    },
                                    vendor: req.data.vendor 
                                }
                            );
        if (oMapping.length > 0) {
            const txt = bundle.getText("mERROR_UNIQUE",[req.data.mappingName, bundle.getText("mVENDOR")]);
            req.error(410, txt);
        }
    });    

   
  
  return super.init();
}};


module.exports = { NfseVendor };