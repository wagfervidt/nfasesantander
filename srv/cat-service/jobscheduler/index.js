const fetch = require('node-fetch');
const xsenv = require("@sap/xsenv");

async function getJWTToken(endpoint, clientId, clientSecret){

    const headers = new fetch.Headers();
    let basicAuthorization = `Basic ${Buffer.from(clientId + ':' + clientSecret).toString("base64")}`;
    headers.set("Authorization", basicAuthorization);
    var method = "GET";


    let url = endpoint+'/oauth/token?grant_type=client_credentials&response_type=token';
    const result = await fetch(url, { method: method, headers: headers }).then((res)=>{
        return res.json()
    });


    const jwtToken = result.access_token;

    return jwtToken;
}

async function updateScheduleJob(scheduleHost, jobId, scheduleId, runId, success, message){
    
    if(typeof scheduleHost === "undefined"){
        return null;
    }
    
    xsenv.loadEnv();
    const binding = xsenv.getServices({ jobscheduler: { tag: 'jobscheduler' } }).jobscheduler;

    const UAA = binding.uaa
    const OA_CLIENTID = UAA.clientid; 
    const OA_SECRET = UAA.clientsecret;
    const OA_ENDPOINT = UAA.url;

    var jwtToken = await getJWTToken(OA_ENDPOINT, OA_CLIENTID, OA_SECRET);

    var url = scheduleHost+`/scheduler/jobs/${jobId}/schedules/${scheduleId}/runs/${runId}`;

    var method = "PUT";

    const body = JSON.stringify({success: success, message: message});

    const headers = new fetch.Headers();
    headers.set("Authorization", 'Bearer ' + jwtToken);
    headers.set("Content-Type", 'application/json');
    headers.set("Content-Length", body.length);


    const result = await fetch(url, { method:method, headers:headers, body:body }).then((res)=>{
        return res.json()
    });;

    return result;

}


module.exports.updateScheduleJob = updateScheduleJob

