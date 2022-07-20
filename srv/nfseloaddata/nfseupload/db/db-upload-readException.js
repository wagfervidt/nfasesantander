async function getReadException(service, exception){
    let result;

    try {
        result = await service.read(service.entities.NotasFiscaisReadException
        ).where({
            vendor: exception.vendor,
            vendorExcName: exception.vendorExcName
        });
            
    } catch (e) {
        console.log(e)
        throw (e)
    }
    if (result.length === 0) {
        return null;
    } else {
        return result;
    }
}

async function createReadException(service, tx, exception) {
    let result;
    try {
        result = await tx.create(service.entities.NotasFiscaisReadException).entries({
            vendor: exception.vendor,
            vendorExcName: exception.vendorExcName,
            validFrom: exception.validFrom,
            validTo: exception.validTo,
            CREATEDBY: exception.CREATEDBY,
            MODIFIEDBY: exception.MODIFIEDBY
        });
    } catch (e) {
        throw (e);
    }
    if (!result) {
        return null;
    } else {
        return result;
    }

}

async function getReadExceptionByVendor(service, aNewVendors){
    let result;

    try {
        result = await service.read(service.entities.NotasFiscaisReadException,[
            "vendor",
            "vendorExcName",
            "validFrom",
            "validTo"
        ]
        ).where({
            vendor: aNewVendors
        });
            
    } catch (e) {
        console.log(e)
        throw (e)
    }
    if (result.length === 0) {
        return null;
    } else {
        return result;
    }
}

module.exports = {
    getReadException: getReadException,
    createReadException: createReadException,
    getReadExceptionByVendor: getReadExceptionByVendor
}