"use strict";

const cds = require("@sap/cds");
const proxy = require("@sap/cds-odata-v2-adapter-proxy");

const jobScheduler = require("./common/jobscheduler-service");
const cds_swagger = require ('cds-swagger-ui-express');

cds.on("bootstrap", async app => {
    
    const jobs = [
        { 
            process: "nfseQueries",
            time: "8 hours"
        }, 
        { 
            process: "nfsePDF",
            time: "3 hours"
        },         
        { 
            process: "nfsePost", 
             time: "1 hours"
        },      
        { 
            process: "nfseArchive",
            time: "24 hours"
        },
        {
            process: "nfseNotParallel",
            time: "6 hours"
        },
        {
            process: "nfseQueryRetries",
            time: "12 hours"
        }
    ]
    
    app.use(
        [
            cds_swagger(
                {
                    "basePath": "/swagger",
                    "diagram": "true"
                }
            ),
            proxy()
        ]
    );
  
    //proxy(/*{ isoDate: true }*/)
    
    // job scheduler - Descomentar quando for fazer o build
    return jobScheduler(jobs);
});

module.exports = cds.server;

