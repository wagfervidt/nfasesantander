
const cds = require ('@sap/cds');


class NfseScheduleLog extends cds.ApplicationService {
 init(){
    
    
     //NotasFiscaisReadException CREATE
    this.before('CREATE', 'NfseScheduleLog', async (req) => {
    /*
        //Get transaction of the request
        const tx = cds.transaction(req);
        //Check if there another prefecture with the same "name"
        let oCompany =  await tx.read('com.santander.nfse.NfseMonitor')
                            .where(
                                { 
                                    ID: req.data.vendor
                                }
                            );

        if (oCompany.length > 0) {
             req.error(410, 'mERROR_UNIQUE', [req.data.vendor, 'mNAME']);
        }
    */
    });


    //Companies UPDATE
    this.before('UPDATE', 'NfseScheduleLog', async (req) => {
    /*
        //Get transaction of the request
        const tx = cds.transaction(req);
        //Check if there another prefecture with the same "name"
        let oCompany =  await tx.read('com.santander.nfse.NfseMonitor')
                            .where(
                                {   
                                    ID: {
                                        '<>': req.data.ID
                                    },
                                    vendor: req.data.vendor
                                }
                            );

        if (oCompany.length > 0) {
             req.error(410, 'mERROR_UNIQUE', [req.data.xxxxx, 'mNAME']);
        } 
    */ 
    });    
    
  
  return super.init();
}};


module.exports = { NfseScheduleLog };