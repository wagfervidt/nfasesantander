
const cds = require ('@sap/cds');
const {getBundle} = require ('../common/i18n');


class LayoutPatterns extends cds.ApplicationService {
 init(){
    
    
    //LayoutPatterns CREATE
    this.before('CREATE', 'LayoutPatterns', async (req) => {
        //Get transaction of the request
        const tx = cds.transaction(req);
        let bundle = getBundle(req.user.locale);
        
        //Check if there another prefecture with the same "name"
        let oLayout =   await tx.read('com.santander.nfse.LayoutPatterns')
                            .where(
                                { 
                                    layoutpatternName: req.data.layoutpatternName 
                                }
                            );
        if (oLayout.length > 0) {
            const txt = bundle.getText("mERROR_UNIQUE",[req.data.layoutpatternName, bundle.getText("mLAYOUTPATTERNNAME")]);
            req.error(410, txt);
        }
    });

    //LayoutPatterns UPDATE
    this.before('UPDATE', 'LayoutPatterns', async (req) => {
        //Get transaction of the request
        const tx = cds.transaction(req);
        let bundle = getBundle(req);
        
        //Check if there another prefecture with the same "name"
        let oLayout =   await tx.read('com.santander.nfse.LayoutPatterns')
                            .where(
                                {   
                                    ID: {
                                            '<>': req.data.ID
                                    },
                                    layoutpatternName: req.data.layoutpatternName 
                                }
                            );

        if (oLayout.length > 0) {
            const txt = bundle.getText("mERROR_UNIQUE",[req.data.layoutpatternName, bundle.getText("mLAYOUTPATTERNNAME")]);
            req.error(410, txt);
        }
    });
    /*
	this.on("CREATE", LayoutPatterns, async (context) => {
        const db = await cds.connect.to("db");
        const { LayoutPatterns } = srv.entities;
        console.log(context.data);
        console.log(context.user);
		const tx = db.tx(context);
		await tx.run(INSERT.into(LayoutPatterns).entries(context.data));
		return await tx.run(SELECT.one(LayoutPatterns).where({ ID: context.data.ID }));
    }); 
    */
  return super.init();
}};


module.exports = { LayoutPatterns };