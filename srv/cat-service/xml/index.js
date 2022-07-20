const fs = require("fs");

const config = require("./config/xml-sign.json");

const forge = require('node-forge');

const xml2js = require('xml2js');

let cacheFiles = {};

function readFile(filename){
    if(!(filename in cacheFiles)){
        cacheFiles[filename] = fs.readFileSync(fs.realpathSync(__dirname+"/./template_xml/"+filename))
            .toString()
            .replace('\n', '')
            .replace(/>\s+</g, '><')
            .trim();
    }
    return cacheFiles[filename]+""; //new string ref
}


function readXmlTemplate(type, bindings){
    let xmlTemplate = readFile(type+".xml");
    for(var key in bindings){
        xmlTemplate = xmlTemplate.replace("{"+key+"}", bindings[key]);
    }
    return xmlTemplate;
}

async function getPemFromPfx(pfx, passphrase){
    return new Promise((res,rej)=>{

        const pem = require("pem");
        pem.readPkcs12(pfx,{ p12Password: passphrase }, (err,cert)=>{
            res(cert.key)
        });
    });

    // // decode p12 from base64
    // var p12Der = forge.util.decode64(pfx);
    // // get p12 as ASN.1 object
    // var p12Asn1 = forge.asn1.fromDer(p12Der);

    // var p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, passphrase);

    // const { key } = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[
    //     forge.pki.oids.pkcs8ShroudedKeyBag
    // ][0];

    // const pem = forge.pki.privateKeyToPem(key);
    // const privateKey = forge.pki.decryptRsaPrivateKey(pem, passphrase);
    // return forge.pki.privateKeyToPem(privateKey);
    // // return pem;
}

async function getPublicX509FromPfx(pfx, passphrase){
    return new Promise((res,rej)=>{
        const pem = require("pem");
        pem.readPkcs12(pfx,{ p12Password: passphrase }, (err,cert)=>{
            res(cert.cert)
        });
    });
    // // decode p12 from base64
    // var p12Der = forge.util.decode64(pfx);
    // var p12Asn1 = forge.asn1.fromDer(p12Der);

    // var p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, passpharase);
    
    // let bag = p12.getBags({ bagType: forge.pki.oids.certBag })[
    //     forge.pki.oids.certBag
    // ][0];

    // let certPem = forge.pki.certificateToPem(bag.cert);
    // var cert = forge.pki.certificateFromPem(certPem);

    // var certAsn1 = forge.pki.certificateToAsn1(cert);
    // var derPkey = forge.asn1.toDer(certAsn1).getBytes();
    // return forge.util.encode64(derPkey);
}

async function signXmlNfse(xmlRaw, xmlTag, pfx, pfxPassword){


    const SignedXml = require('xml-crypto').SignedXml;

    const sig = new SignedXml();
    sig.canonicalizationAlgorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";
    sig.signatureAlgorithm = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
    sig.addReference(
      `/*[1]`,
      [
        "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
        "http://www.w3.org/TR/2001/REC-xml-c14n-20010315"
      ],
      "http://www.w3.org/2000/09/xmldsig#sha1",
      '',
      '',
      '',
      true
    );

    // let pem = await getPemFromPfx(pfx, pfxPassword);
    const privateKey = await getPemFromPfx(pfx, pfxPassword);
    let publicKey = await getPublicX509FromPfx(pfx, pfxPassword);

    publicKey = publicKey.split("-----END CERTIFICATE-----").join("");
    publicKey = publicKey.split("-----BEGIN CERTIFICATE-----").join("");
    publicKey = publicKey.split("\r").join("");
    publicKey = publicKey.split("\n").join("");

    sig.signingKey = privateKey;
    

    sig.keyInfoProvider = {
      getKeyInfo: () => {
        return `<X509Data><X509Certificate>${publicKey}</X509Certificate></X509Data>`;
      },
    };

    sig.computeSignature(xmlRaw);
    let xml = sig.getSignedXml();
    return xml;
}

async function parseXMLtoObject(xml){
    return new Promise((res,rej)=>{
        xml2js.parseString(xml, (err, obj)=>{
            if(err){
                rej(err);
                return;
            }
            res(obj);
        })
    });
}

async function parseObjectToXML(obj){
    return new Promise((res,rej)=>{
        var builder = new xml2js.Builder();
        var xml = builder.buildObject(obj);
        res(xml);
    });
}

module.exports = {
    readXmlTemplate: readXmlTemplate,
    signXmlNfse: signXmlNfse,
    getPublicX509FromPfx: getPublicX509FromPfx,
    getPemFromPfx: getPemFromPfx,
    parseXMLtoObject: parseXMLtoObject,
    parseObjectToXML: parseObjectToXML
}