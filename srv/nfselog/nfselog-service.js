
const cds = require ('@sap/cds');


class NfseLog extends cds.ApplicationService {
 init(){


    /*this.after('GET', 'NfseLog', each => {
        
        if(each.newStatus && each.oldStatus){
            switch (each.oldStatus.nfseStatus) {
                case 1:
                    each.oldLevel = 1;
                    break;

                case 2:
                    each.oldLevel = 1;
                    break;
            
                case 3:
                    each.oldLevel = 3;
                    break;
            
                case 4:
                    each.oldLevel = 0;
                    break;
            
                case 5:
                    each.oldLevel = 2;
                    break;

                case 6:
                    each.oldLevel = 2;
                    break;
            
                case 7:
                    each.oldLevel = 2;
                    break;
            
                case 8:
                    each.oldLevel = 1;
                    break;
            
                case 9:
                    each.oldLevel = 3;
                    break;
            
                case 10:
                    each.oldLevel = 3;
                    break;
            
                default:
                    break;
            };
            switch (each.newStatus.nfseStatus) {
                case 1:
                    each.newLevel = 1;
                    break;

                case 2:
                    each.newLevel = 1;
                    break;
            
                case 3:
                    each.newLevel = 3;
                    break;
            
                case 4:
                    each.newLevel = 0;
                    break;
            
                case 5:
                    each.newLevel = 2;
                    break;

                case 6:
                    each.newLevel = 2;
                    break;
            
                case 7:
                    each.newLevel = 2;
                    break;
            
                case 8:
                    each.newLevel = 1;
                    break;
            
                case 9:
                    each.newLevel = 3;
                    break;
            
                case 10:
                    each.newLevel = 3;
                    break;
            
                default:
                    break;
            }
        }
    
    });*/
    
     //NotasFiscaisReadException CREATE
    this.before('CREATE', 'NfseLog', async (req) => {
    /*
        //Get transaction of the request
        const tx = cds.transaction(req);
        //Check if there another prefecture with the same "name"
        let oCompany =  await tx.read('com.santander.nfse.NotasFiscaisReadException')
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
    this.before('UPDATE', 'NfseLog', async (req) => {
    /*
        //Get transaction of the request
        const tx = cds.transaction(req);
        //Check if there another prefecture with the same "name"
        let oCompany =  await tx.read('com.santander.nfse.NfseLog')
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

    //CompaniesPrefectures CREATE
    this.before('CREATE', 'NfseLog',  async (req) => {
    /*
        //Get transaction of the request
        const tx = cds.transaction(req);
        //Check if there another prefecture with the same "name"
        let oCompPref = await tx.read('com.santander.nfse.NfseLog')
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
    
  
  return super.init();
}};


module.exports = { NfseLog };