async function getExceptionByText(text, service) {
    let result;

    try {
        result = await service.read(service.entities.NotasFiscaisTextException)
            .where({
                txtException: text
            });

        if (!result) {
            return null;
        } else {
            return result[0];
        }
    } catch (e) {
        throw (e);
    }
}

async function getExceptionByTextID(textID, text, service) {
    let result;

    try {
        result = await service.read(service.entities.NotasFiscaisTextException)
            .where({
                txtException: text,
                ID: {
                    '<>': textID
                }
            });

        if (!result) {
            return null;
        } else {
            return result[0];
        }
    } catch (e) {
        throw (e);
    }
}


async function getExceptionByID(textID, service) {
    let result;

    try {
        result = await service.read(service.entities.NotasFiscaisTextException)
            .where({
                ID:  textID         
            });

        if (!result) {
            return null;
        } else {
            return result[0];
        }
    } catch (e) {
        throw (e);
    }
}

module.exports = {
    getExceptionByText: getExceptionByText,
    getExceptionByTextID: getExceptionByTextID,
    getExceptionByID: getExceptionByID
}