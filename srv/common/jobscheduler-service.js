
//JOB SCHEDULER
const xsenv = require("@sap/xsenv");
const jobsc = require("@sap/jobs-client");


//JOBSCHEDULER 

const jobScheduler = async (aJobs) => {
    for (let oJob of aJobs) {
        try {
            await createJob(oJob);
        } catch (error) {

            console.warn(`Erro ao definir job ${oJob.process}`);
            console.warn(error.stack);
        }
    }
}// jobScheduler

const createJob = async (oJob) => {
    xsenv.loadEnv();

    const jobOptions = xsenv.getServices({
        jobs: {
            tag: 'jobscheduler'
        }
    });
    const schedulerOptions = {
        baseURL: jobOptions.jobs.url,
        user: jobOptions.jobs.user,
        password: jobOptions.jobs.password,
        timeout: 15000
    };
    const scheduler = new jobsc.Scheduler(schedulerOptions);
    const thisApp = JSON.parse(process.env.VCAP_APPLICATION);
    const thisAppURI = thisApp.application_uris[0];
    const jobCockpit = {
        job: {
            'name': oJob.process,
            'description': 'Consultas Notas Fiscais',
            'action': 'https://' + thisAppURI + '/catalog/' + oJob.process,
            'active': true,
            'httpMethod': 'POST',
            'schedules': [{
                'description': `Every ${oJob.time}`,
                'repeatInterval': oJob.time,
                'data': {},
                'active': true
            }]
        }
    };
    return new Promise((resolve, reject) => {
        scheduler.createJob(jobCockpit, function (err, body) {
            if (err) {
                //reply.type('application/json').code(500);
                if (err.message === 'Error while creating job: Job Already Exists')
                    resolve();
                else
                    reject(err);
            } else {
                // reply.type('application/json').code(201);
                resolve(body);
            }
        }

        );
    }).catch((err) => {
        throw (err);
    });
}

module.exports = jobScheduler;