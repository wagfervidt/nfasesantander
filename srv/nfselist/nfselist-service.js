
const cds = require('@sap/cds');
const { insertIntoNotasFiscaisLogSync } = require("./db");
const { getBundle } = require('../common/i18n');

class NfseList extends cds.ApplicationService {
    init() {


        this.after('GET', 'NotasFiscais', each => {
            if (each.status)
                switch (each.status.nfseStatus) {
                    case 1: //Read error
                        each.level = 1;
                        break;

                    case 2: //Transform error
                        each.level = 1;
                        break;

                    case 3: //Canceled
                        each.level = 3;
                        break;

                    case 4: //Excepted
                        each.level = 0;
                        break;

                    case 5: //Pending Info
                        each.level = 2;
                        break;

                    case 6: //Pending Send
                        each.level = 2;
                        break;

                    case 7: //Pending Send Cancel
                        each.level = 2;
                        break;

                    case 8:
                        each.level = 1;
                        break;

                    case 9:
                        each.level = 3;
                        break;

                    case 10:
                        each.level = 3;
                        break;

                    case 11:
                        each.level = 0;
                        break;

                    default:
                        break;
                };
        });

        this.on('isKeyUser', async (req) => {
           if  (!req.user._roles['nfse_adminkeyuser'])  return false;

           if (req.user._roles['nfse_adminkeyuser'] == 1) {
               return true;
           }else {
               return false;
           }
         

        });

        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // NOTASFISCAIS - UPDATE - Grava o log de atualização de nota fiscal                //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.before('UPDATE', 'NotasFiscais', async (req) => {

            const service = cds.services.CatalogService;

            let data = req.data;

            let oldNota = await service.read('com.santander.nfse.NotasFiscais')
                .where(
                    {
                        ID: req.data.ID
                    }
                );
            if (data.status_nfseStatus) {
                if (oldNota[0].status_nfseStatus != data.status_nfseStatus)
                    try {
                        

                    await insertIntoNotasFiscaisLogSync(service, data.ID, oldNota[0].status_nfseStatus, data.status_nfseStatus);
                } catch (error) {
                        
                }
            }
        });
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        // NOTASFISCAIS - UPDATE Status individual                                          //
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
        this.on('updateNotaFiscalStatusIndividual', async (req) => {
            const bundle = getBundle(req.user.locale);
            const tx       = cds.transaction(req);
            let oId        = req.data.ID,
                nfseStatus = req.data.status_nfseStatus,
                newStatus  = req.data.newStatus,
                nota       = {
                    ID: oId,
                    status_nfseStatus: nfseStatus
                };

            try {
                let oldNota = await tx.read('NotasFiscais', ['ID']).where(nota);

                if (oldNota.length > 0) {
                    await tx.update('NotasFiscais')
                        .set({
                            'status_nfseStatus': newStatus
                        })
                        .where(oldNota[0]);

                    if(newStatus != nota.status_nfseStatus) await insertIntoNotasFiscaisLogSync(tx, nota.ID, nota.status_nfseStatus, newStatus);

                }else {
                    const txt = bundle.getText("mSTATUS_NOT_FOUND");
                    return { 
                        errorStatus: true,
                        errorMessage: txt 
                    };
                }
            } catch (error) {
                return req.error(error);
            }

        }); 


        return super.init();
    }
};


module.exports = { NfseList };