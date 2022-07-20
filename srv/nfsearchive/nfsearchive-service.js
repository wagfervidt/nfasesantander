
const cds = require('@sap/cds');
const {getBundle} = require ('../common/i18n');


class NfseArchive extends cds.ApplicationService {
    init() {

        //Companies CREATE
        this.before('CREATE', 'NotasFiscaisArchive', async (req) => {

            //Get transaction of the request
            const tx = cds.transaction(req);
            let bundle = getBundle(req.user.locale);
            //Check if there another prefecture with the same "name"
            
            let oArchive = await tx.read('com.santander.nfse.NotasFiscaisArchive')
                .where(
                    {
                        status_nfseStatus: req.data.status_nfseStatus
                    }
                );

            if (oArchive.length > 0) {
                const txt = bundle.getText("mERROR_UNIQUE",[req.data.status_nfseStatus, bundle.getText("mNFSESTATUS")]);
                req.error(410, txt);
            }
        });


        //Companies UPDATE
        this.before('UPDATE', 'NotasFiscaisArchive', async (req) => {

            //Get transaction of the request
            const tx = cds.transaction(req);
            let bundle = getBundle(req.user.locale);
            //Check if there another prefecture with the same "name"
            let oArchive = await tx.read('com.santander.nfse.NotasFiscaisArchive')
                .where(
                    {
                        ID: {
                            '<>': req.data.ID
                        },
                        status_nfseStatus: req.data.status_nfseStatus
                    }
                );

            if (oArchive.length > 0) {
                const txt = bundle.getText("mERROR_UNIQUE",[req.data.status_nfseStatus, bundle.getText("mNFSESTATUS")]);
                req.error(410, txt);
            }
        });
        return super.init();
    }
};


module.exports = { NfseArchive };