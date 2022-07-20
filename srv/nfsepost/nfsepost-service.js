
const cds = require ('@sap/cds');
const {getBundle} = require ('../common/i18n');


class NfsePost extends cds.ApplicationService {
 init(){
    
    
     //NotasFiscaisReadException CREATE
    this.before('CREATE', 'NotasFiscaisPostParameters', async (req) => {
        //Get transaction of the request
        const tx = cds.transaction(req);
        let bundle = getBundle(req.user.locale);
        //Check if there another prefecture with the same "name"
        let oParameter =  await tx.read('com.santander.nfse.NotasFiscaisPostParameters')
                            .where(
                                { 
                                    paramCode_param: req.data.paramCode_param
                                }
                            );

        if (oParameter.length > 0) {
            const txt = bundle.getText("mERROR_UNIQUE",[req.data.paramCode_param, bundle.getText("mPARAMETER")]);
            req.error(410, txt);
        }

    });

    //Companies UPDATE
    this.before('UPDATE', 'NotasFiscaisPostParameters', async (req) => {
        //Get transaction of the request
        const tx = cds.transaction(req);
        let bundle = getBundle(req.user.locale);
        //Check if there another prefecture with the same "name"
        let oParameter =  await tx.read('com.santander.nfse.NotasFiscaisPostParameters')
                            .where(
                                {   
                                    ID: {
                                        '<>': req.data.ID
                                    },
                                    paramCode_param: req.data.paramCode_param
                                }
                            );

        if (oParameter.length > 0) {
            const txt = bundle.getText("mERROR_UNIQUE",[req.data.paramCode_param, bundle.getText("mPARAMETER")]);
            req.error(410, txt);
        } 

    });    
    
  
  return super.init();
}};


module.exports = { NfsePost };