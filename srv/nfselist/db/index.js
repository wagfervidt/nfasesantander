


async function insertIntoNotasFiscaisLogSync(service, notaID, oldStatus, newStatus) {

    await
        service.create(service.entities.NotasFiscaisLog)
            .entries({
                "NOTAFISCAL_ID": notaID,
                "oldStatus_nfseStatus": oldStatus,
                "newStatus_nfseStatus": newStatus
            });

}

module.exports.insertIntoNotasFiscaisLogSync = insertIntoNotasFiscaisLogSync;
  