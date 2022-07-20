const fetch = require('node-fetch');
const xsenv = require('@sap/xsenv');

async function servicePOST(name, path, headers, body) {
  xsenv.loadEnv();
  const serviceUrl = await getDestinationUrl(name);
  const jwtToken = await getJWTToken('nfse-xsuaa-service');
  if (!headers) {
    headers = new fetch.Headers({
      'Content-Type': 'application/json'
    });
  }
  let basicAuthorization = `Bearer ${jwtToken}`;
  headers.set("Authorization", basicAuthorization);
  const response = await fetch(serviceUrl + path, { method: 'POST', headers: headers, body })
  return await response.text();
}

async function serviceGET(name, path) {
  xsenv.loadEnv();
  const serviceUrl = await getDestinationUrl(name);
  const response = await fetch(serviceUrl + path, { method: 'GET' })
  return await response.text();
}

async function getJWTToken(serviceName) {
  const service = xsenv.readServices()[serviceName];
  const credentials = service.credentials;
  const clientId = credentials.clientid;
  const secret = credentials.clientsecret;
  const authUrl = credentials.url;
  const headers = new fetch.Headers();
  let authorization = `Basic ${Buffer.from(clientId + ':' + secret).toString("base64")}`;
  headers.set("Authorization", authorization);
  let url = authUrl + '/oauth/token?grant_type=client_credentials&response_type=token';
  const result = await fetch(url, { method: 'GET', headers: headers }).then((res)=>{
    return res.json()
  });
  return result.access_token;
}

async function getDestinationUrl(service) {
  const destinationServiceName = 'nfse-destination-service'
  var jwt = await getJWTToken(destinationServiceName);
  const host = xsenv.getServices({ tag: destinationServiceName }).tag.uri
  const headers = new fetch.Headers();
  let basicAuthorization = `Bearer ${jwt}`;
  headers.set("Authorization", basicAuthorization);
  const url = host + '/destination-configuration/v1/destinations/' + service
  const response = await fetch(url, { method: 'GET', headers: headers })
  const data = await response.json();
  return data.destinationConfiguration.URL;
}

module.exports = {
  serviceGET : serviceGET,
  servicePOST : servicePOST,
  getJWTToken : getJWTToken,
  getDestinationUrl : getDestinationUrl
}
