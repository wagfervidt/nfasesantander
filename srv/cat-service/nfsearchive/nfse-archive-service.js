const { getBundle } = require('../../common/i18n');
const { updateScheduleJob } = require("../jobscheduler");
async function handleNfseArchive(req, service, tx) {
    //Começa gerando as variaveis necessárias
    let bundle = getBundle(req.user.locale);
    let nfseArchivelogNoNfse = bundle.getText("mERROR_NO_NFSE_ARCHIVE");
    let nfseArchivelogSuccess = bundle.getText("mNFSE_ARCHIVE_SUCCESS");

    const jobId = req.headers["x-sap-job-id"];
    const scheduleId = req.headers["x-sap-job-schedule-id"];
    const runId = req.headers["x-sap-job-run-id"];
    const scheduleHost = req.headers["x-sap-scheduler-host"];



    await deleteNfseScheduleLog(req, service, tx);

    //Pega todos os dados de arquivamento das notas fiscais e inicia um processamento por registro
    let isEmpty = await processRegisterNfse(service, req);

    //Caso nao contenha nenhum registro para os criterios indicados grava-se no log de arquivamento o texto nfseArchivelogNoNfse com o status = 3
    if (isEmpty) {
        await service.create(service.entities.NotasFiscaisArchiveLogs).entries({
            status_status: 3,
            txtStatus: nfseArchivelogNoNfse
        });
        await updateScheduleJob(scheduleHost, jobId, scheduleId, runId, true, nfseArchivelogNoNfse);
        return {
            status: 3,
            txtStatus: nfseArchivelogNoNfse
        }

    } else {
        //Caso todos os registros para os criterios executaram com sucesso, grava-se o texto nfseArchivelogSuccess com o status = 3

        await service.create(service.entities.NotasFiscaisArchiveLogs).entries({
            status_status: 3,
            txtStatus: nfseArchivelogSuccess
        });
        await updateScheduleJob(scheduleHost, jobId, scheduleId, runId, true, nfseArchivelogSuccess);
        return {
            status: 3,
            txtStatus: nfseArchivelogSuccess
        }
    }
};

async function processRegisterNfse(service, req) {
    let date;
    let isEmpty = true;
    let nfItems;

    try {

        let arqItems = await service.read(service.entities.NotasFiscaisArchives);

        arqItems.forEach(async (arq) => {
            if (arq.lifeTime > 0) {
                //Gera a data que será usada para puxar as notas ficais que serão arquivadas
                date = new Date();
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(0);
                date.setMilliseconds(0);
                //pega a data atual menos o tempo restante(lifetime)
                date.setDate(date.getDate() - arq.lifeTime);
                //com a data, pega todas as notas com o status indicado e a data de modificação igual ou menor a que foi calculada  
                if (arq.status_nfseStatus === 3 || arq.status_nfseStatus === 9) {
                    nfItems = await service.read(service.entities.NotasFiscais).where({
                        status_nfseStatus: arq.status_nfseStatus,
                        cancelDate: { '<=': date.toISOString() }
                    });
                } else {
                    nfItems = await service.read(service.entities.NotasFiscais).where({
                        status_nfseStatus: arq.status_nfseStatus,
                        docDate: { '<=': date.toISOString() }
                    });
                }
                //caso nao contenha nenhum registro para os criterios indicados um false (isso é importante para a adição de log de sucesso mais para baixo no código)
                if (nfItems.length > 0) isEmpty = false;

                deleteNfseArchive(nfItems, req, service);
            }
        });
    } catch (e) {
        console.log(e);
        throw (e);
    }

    return isEmpty;
};

function deleteNfseArchive(nfItems, req, service) {
    //caso contenha registros, elimina todas as notas e todos os logs ligados à ela (NotasFiscaisLog, NotasFiscaisPostLog)
    nfItems.forEach(async item => {
        try {
            await service.delete(service.entities.NotasFiscais)
                .where({ ID: item.ID });
            try {
                await service.delete(service.entities.NotasFiscaisLog)
                    .where({ NotaFiscal_ID: item.ID });
                await service.delete(service.entities.NotasFiscaisPostLog)
                    .where({ notafiscal_ID: item.ID });
            } catch (e) {
                console.log(e);
            }
        } catch (err) {
            //caso aconteça um erro é necessário criar um log na tabela de log de arquivamento indicando o texto do erro e o com campo status = 1
            let errorText = err.toString() + " " + err.query;
            req.error(413, err);
            await service.create(service.entities.NotasFiscaisArchiveLogs).entries({
                status_status: 1,
                txtStatus: errorText
            });
            return {
                status: 1,
                txtStatus: errorText
            }
        }
    });
}


async function deleteNfseScheduleLog(req, service, tx) {

    let date = new Date();;
    date.setDate(date.getDate() - 3); //Menos 3 dias


    let deleteItems = [];

    try {


        //Elimina registros iguais para mesma data
        let itemsScheduleLog = await service.read(service.entities.NFSEScheduleLogDistinct)
            .where({
                createdAt: {
                    '<=': date.toISOString()
                }
            })


        if (itemsScheduleLog.length == 0) {
            return
        }

        for (let item of itemsScheduleLog) {
            let delrecords = await tx.delete(service.entities.NotasFiscaisScheduleLog)
                .where(
                    {
                        'ID': {
                            '<>': item.ID
                        },
                        'company_ID': item.company_ID,
                        'prefecture_ID': item.prefecture_ID,
                        'readDate': item.readDate,
                        'status.status': item.status
                    }
                );
            if (delrecords) {
                console.log(delrecords);
            }
        }
        tx.commit();
        //Elimina registros com mais de 5 dias sendo que no quinto dia está com sucesso
        date.setDate(date.getDate() - 2); //Menos 2 dias
        itemsScheduleLog = await service.read(service.entities.NFSEScheduleLogDistinct)
            .where({
                readDate: date.toISOString().substr(0, 10),
                status: '3'
            })

        for (let item of itemsScheduleLog) {
            let delrecords = await tx.delete(service.entities.NotasFiscaisScheduleLog)
                .where(
                    {
                        'company_ID': item.company_ID,
                        'prefecture_ID': item.prefecture_ID,
                        'readDate': {
                            '<': item.readDate,
                        }
                    }
                );
            if (delrecords) {
                console.log(delrecords);
            }
        }
        tx.commit();

        //Elimina registros com mais de 30 independente de erro ou sucesso
        date.setDate(date.getDate() - 25); //Menos 25 dias
        let delrecords = await tx.delete(service.entities.NotasFiscaisScheduleLog)
            .where(
                {
                    'readDate': {
                        '<': date.toISOString().substr(0, 10),
                    }
                }
            );
        tx.commit();
    } catch (error) {
        console.log(error);
        throw (error);
    }
}

module.exports.handleNfseArchive = handleNfseArchive;