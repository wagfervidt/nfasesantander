const { getBundle } = require('../../common/i18n');
const { servicePOST } = require("../services/destination-service")


const handleCallExtAPP = async (req, service) => {
    try {
        const bundle = getBundle(req.user.locale);
        const tx = service.tx();

        const response = await servicePOST(req.data.destination, req.data.path, null, req.data.body);

        return response;


    } catch (e) {

        throw (e);

    }
}


module.exports.handleCallExtAPP = handleCallExtAPP;
