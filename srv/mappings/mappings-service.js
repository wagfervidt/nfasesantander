const cds = require ('@sap/cds');
const {getBundle} = require ('../common/i18n');
const fs = require("fs");
const tmp = require('tmp');
const cmd = require('node-cmd');



class Mappings extends cds.ApplicationService {
 init(){
    
    
    
    //Mappings CREATE
    this.before('CREATE', 'Mappings', async  (req) => {
        //Get transaction of the request
        const tx = cds.transaction(req);
        let bundle = getBundle(req.user.locale);
        //Check if there another Mapping with the same "name"
        let oMapping = await tx.read('com.santander.nfse.Mappings')
                            .where({
                                mappingName: req.data.mappingName
                            });

        if (oMapping.length > 0) {
            const txt = bundle.getText("mERROR_UNIQUE",[req.data.mappingName, bundle.getText("mMAPPINGNAME")]);
            req.error(410, txt);
        }
        //
        //Convert XSLT to SEF to use in SAXON
        //
        let fileTemp = tmp.fileSync();
        let fileTempSef = tmp.fileSync();
        if(req.data.requestXSLT){
            fs.writeFileSync(fileTemp.name, req.data.requestXSLT);
            cmd.runSync(`npx xslt3 -xsl:${fileTemp.name} -export:${fileTempSef.name} -nogo`);
            req.data.requestXSLTSEF = fs.readFileSync(fileTempSef.name, {encoding: "utf8"});
            fs.unlinkSync(fileTemp.name);
            fs.unlinkSync(fileTempSef.name);
        }
        if(req.data.responseXSLT){
            let fsname = fileTemp.name + '2'
            let fsnameSef = fileTempSef.name + '2'

            fs.writeFileSync(fsname, req.data.responseXSLT);
            cmd.runSync(`npx xslt3 -xsl:${fsname} -export:${fsnameSef} -nogo`);
            req.data.responseXSLTSEF = fs.readFileSync(fsnameSef, {encoding: "utf8"});
            fs.unlinkSync(fsname);
            fs.unlinkSync(fsnameSef);
        }
    });

    //Mappings UPDATE
    this.before('UPDATE', 'Mappings', async  (req) => {
        //Get transaction of the request
        const tx = cds.transaction(req);
        let bundle = getBundle(req.user.locale);
        //Check if there another mapping with the same "name"
        let oMapping =  await tx.read('com.santander.nfse.Mappings') 
                            .where(
                                {   
                                    ID: {
                                            '<>': req.data.ID
                                    },
                                    mappingName: req.data.mappingName 
                                }
                            );
        if (oMapping.length > 0) {
            const txt = bundle.getText("mERROR_UNIQUE",[req.data.mappingName, bundle.getText("mMAPPINGNAME")]);
            req.error(410, txt);
        }
        //
        //Convert XSLT to SEF to use in SAXON
        //
        let fileTemp = tmp.fileSync();
        let fileTempSef = tmp.fileSync();
        if(req.data.requestXSLT){
            fs.writeFileSync(fileTemp.name, req.data.requestXSLT);
            cmd.runSync(`npx xslt3 -xsl:${fileTemp.name} -export:${fileTempSef.name} -nogo`);
            req.data.requestXSLTSEF = fs.readFileSync(fileTempSef.name, {encoding: "utf8"});
            fs.unlinkSync(fileTemp.name);
            fs.unlinkSync(fileTempSef.name);
        }
        if(req.data.responseXSLT){
            fs.writeFileSync(fileTemp.name, req.data.responseXSLT);
            cmd.runSync(`npx xslt3 -xsl:${fileTemp.name} -export:${fileTempSef.name} -nogo`);
            req.data.responseXSLTSEF = fs.readFileSync(fileTempSef.name, {encoding: "utf8"});
            fs.unlinkSync(fileTemp.name);
            fs.unlinkSync(fileTempSef.name);
        }
    });

  return super.init();
}};


module.exports = { Mappings };
