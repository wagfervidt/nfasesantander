 const cds = require ('@sap/cds');
const {getBundle} = require ('../common/i18n');


class Prefectures extends cds.ApplicationService {
 init(){
    
    
    
    //Prefectures CREATE
    this.before('CREATE', 'Prefectures', async (req) => {
        //Get transaction of the request
        const tx = cds.transaction(req);
        let bundle = getBundle(req.user.locale);
        //Check if there another prefecture with the same "name"
        let oPrefecture = await tx.read('com.santander.nfse.Prefectures').where({ prefectureName: req.data.prefectureName });

        if (oPrefecture.length > 0) {
            const txt = bundle.getText("mERROR_UNIQUE",[req.data.prefectureName, bundle.getText("mNAME")]);
            req.error(410, txt);
        }
        
    });
    
    //Prefectures UPDATE
    this.before('UPDATE', 'Prefectures', async  (req) => {
        //Get transaction of the request
        const tx = cds.transaction(req);
        let bundle = getBundle(req.user.locale);
        //Check if there another mapping with the same "name"
        let oMapping = await tx.read('com.santander.nfse.Prefectures') 
                                .where(
                                    {   
                                        ID: {
                                            '<>': req.data.ID
                                        },
                                        prefectureName: req.data.prefectureName 
                                    }
                                );
        if (oMapping.length > 0) {
            const txt = bundle.getText("mERROR_UNIQUE",[req.data.prefectureName, bundle.getText("mNAME")]);
            req.error(410, txt);
        }
    });
  return super.init();
}};


module.exports = { Prefectures };