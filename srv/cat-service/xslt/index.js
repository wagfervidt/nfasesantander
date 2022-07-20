
const SaxonJS = require('saxon-js');
const fs = require("fs");
const tmp = require('tmp');
const cmd = require('node-cmd');


async function XslTransformBySources(xmlSource, xsltSource){
    /*
    var fileTemp = tmp.fileSync();
    var fileTempSef = tmp.fileSync();
    
    fs.writeFileSync(fileTemp.name, xsltSource);

    cmd.runSync(`npx xslt3 -xsl:${fileTemp.name} -export:${fileTempSef.name} -nogo`);

    var xsltSef = fs.readFileSync(fileTempSef.name, {encoding: "utf8"});
    */
    try{
        var result = await SaxonJS.transform({
            stylesheetText: xsltSource,
            sourceText: xmlSource,
            destination: "serialized"
        }, "async");

        return result.principalResult;

    }catch(e){
        console.log(e);
    }
    
}

module.exports = {
    XslTransformBySources: XslTransformBySources,
};