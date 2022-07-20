const cds = require ('@sap/cds');
const {getBundle} = require ('../common/i18n');


class Companies extends cds.ApplicationService {
 init(){
    //Companies CREATE
    this.before('CREATE', 'Companies', async (req) => {
        let bundle = getBundle(req.user.locale);
        let aPrefectures= req.data.prefectures
        for(let i= 0; i<aPrefectures.length; i++){
            if(aPrefectures[i].prefectures_ID == null){
                const txt = bundle.getText("mERROR_VALIDATION",[aPrefectures[i].prefectures_ID, bundle.getText("mPREFECTURE")]);
                req.error(410, txt);
            }
            if(aPrefectures[i].CCMPrefecture == null){
                aPrefectures[i].CCMPrefecture == "";
            }
            for(let j= i+1; j <aPrefectures.length; j++){
                if(aPrefectures[i].prefectures_ID === aPrefectures[j].prefectures_ID && aPrefectures[i].CCMPrefecture === aPrefectures[j].CCMPrefecture){
                    const txt = bundle.getText("mERROR_UNIQUE",[aPrefectures[i].prefectures_ID, bundle.getText("mPREFECTURE")]);
                    req.error(410, txt);
                }
            }
        }
        
        const tx = cds.transaction(req);

        let cnpj = req.data.CNPJ.replace(" ","");
        
        let oCompany =  await tx.read('com.santander.nfse.Companies')
                            .where(
                                { 
                                    CNPJ: cnpj
                                }
                            );

        if (oCompany.length > 0) {
            const txt = bundle.getText("mERROR_UNIQUE",[req.data.CNPJ, bundle.getText("mCNPJ")]);
            req.error(410, txt);
        }
    });


    //Companies UPDATE
    this.before('UPDATE', 'Companies', async (req) => {
        let bundle = getBundle(req.user.locale);
    
        //CCMPrefecture
        let aPrefectures= req.data.prefectures
        for(let i= 0; i<aPrefectures.length; i++){
            if(aPrefectures[i].prefectures_ID == null){
                const txt = bundle.getText("mERROR_VALIDATION",[aPrefectures[i].prefectures_ID, bundle.getText("mPREFECTURE")]);
                req.error(410, txt);
            }
            if(aPrefectures[i].CCMPrefecture == null){
                aPrefectures[i].CCMPrefecture == "";
            }
            for(let j= i+1; j <aPrefectures.length; j++){
                if(aPrefectures[i].prefectures_ID === aPrefectures[j].prefectures_ID && aPrefectures[i].CCMPrefecture === aPrefectures[j].CCMPrefecture){
                    const txt = bundle.getText("mERROR_UNIQUE",[aPrefectures[i].prefectures_ID, bundle.getText("mPREFECTURE")]);
                    req.error(410, txt);
                }
            }
        }
        
        const tx = cds.transaction(req);

        let cnpj = req.data.CNPJ.replace(" ","");
        
        let oCompany =  await tx.read('com.santander.nfse.Companies')
                            .where(
                                { 
                                    ID: {
                                        '<>': req.data.ID
                                    },
                                    CNPJ: cnpj
                                }
                            );

        if (oCompany.length > 0) {
            const txt = bundle.getText("mERROR_UNIQUE",[req.data.CNPJ, bundle.getText("mCNPJ")]);
            req.error(410, txt);
        }
    });    

    //CompaniesPrefectures CREATE
    /*
    this.before('CREATE', 'CompaniesPrefectures',  async (req) => {

        let bundle = getBundle(req.user.locale);
        
        console.log("CREATE CompaniesPrefectures");

        //Get transaction of the request
        const tx = cds.transaction(req);
        //Check if there another prefecture with the same "name"
        let oCompPref = await tx.read('com.santander.nfse.CompaniesPrefectures')
                            .where(
                                { 
                                    companies:   req.data.companies ,
                                    prefectures: req.data.prefectures
                                }
                            );

        if (oCompPref.length > 0) {
            const txt = bundle.getText("mERROR_UNIQUE",[req.data.name, bundle.getText("mNAME")]);
            req.error(410, txt);
        }
    });    
    */

    //CompaniesPrefectures UPDATE
    /*
    this.before('UPDATE', 'CompaniesPrefectures',  async (req) => {
        let bundle = getBundle(req.user.locale);
        console.log("UPDATE CompaniesPrefectures");
        //Get transaction of the request
        const tx = cds.transaction(req);
        //Check if there another prefecture with the same "name"
        let oCompPref = await tx.read('com.santander.nfse.CompaniesPrefectures')
                            .where(
                                { 
                                    ID: {
                                        '<>': req.data.ID
                                    },
                                    companies:   req.data.companies ,
                                    prefectures: req.data.prefectures
                                }
                                );

        if (oCompPref.length > 0) {
            const txt = bundle.getText("mERROR_UNIQUE",[req.data.companyName, bundle.getText("mNAME")]);
            req.error(410, txt);
        }
    });    
    */

  return super.init();
}};


module.exports = { Companies };