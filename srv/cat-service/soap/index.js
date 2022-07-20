
const soap = require("soap");

// FAZ ALTERAÇÃO AQUI****************************
async function createClientWithRetries(address, options, retries){
    var soapClient = null;
    var exception = null;
    while(retries-- > 0){
        try{
            soapClient = await soap.createClientAsync(address, options);
            retries = 0;
        }catch(e){
            exception = e;
            await timeout(3000);
        }
    }
    if(soapClient == null){
        throw exception;
    }
    return soapClient;
}

async function callsMethodWithRetries(soapClient, method, requestXml, retries){
    var response = null;
    var exception = null;
    while(retries-- > 0){
        try{
            response = await soapClient[method+"Async"]({
                _xml: ""
            }, {
                postProcess: (xml)=>{
                    return requestXml
                }
            });
            retries = 0;
        }catch(e){
            exception = e;
            await timeout(3000);
        }
    }
    if(response == null){
        throw exception;
    }
    return response;
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


module.exports = {
    createClientWithRetries: createClientWithRetries,
    callsMethodWithRetries: callsMethodWithRetries
}