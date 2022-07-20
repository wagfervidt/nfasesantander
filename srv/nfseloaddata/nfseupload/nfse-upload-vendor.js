const {  }          = require("./db/db-upload-readException");
const { getBundle } = require('../../common/i18n');
const xlsx          = require('xlsx');
const { cpf, cnpj } = require('cpf-cnpj-validator');
const { create } = require("@sap/cds");

module.exports = {
    async handleUploadNfseVendor(req, service) {
        try {
            let oBundle   = getBundle(req.user.locale);
            let excelXlsx = xlsx.read(req.data.File);
            let ws        = excelXlsx.Sheets[excelXlsx.SheetNames[0]];
            let range     = xlsx.utils.decode_range(ws["!ref"]).e.r;

            let loadFile  = xlsx.utils.sheet_to_json(ws, {
                header: "A",
                raw: false,
                range: `A1:ZZ${range+1}`,
                dateNF: "YYYY-MM-DD"
            });

            let loadFileHeader = loadFile.shift(),
                headerExpected = [`${oBundle.getText('download_vendor')}`      , `${oBundle.getText('download_name')}`,
                                  `${oBundle.getText('download_registration')}`, `${oBundle.getText('download_cityName')}`,
                                  `${oBundle.getText('download_UF')}`        
                                 ],
                headerName     = ["A","B","C","D"];
            
            for(let i=0; i < headerName.length; i++){
                if(loadFileHeader[headerName[i]] != headerExpected[i]){
                    return {
                        log: {
                            CNPJ: "",
                            name: "",
                            registration: "",
                            message: ""
                        },
                        error: true,
                        errorMessage: oBundle.getText("ErrorExcel")
                    }
                }
            }

            let sNewVendors   = [],
                sVendorsCNPJ  = [],
                logsVendors   = [],
                createVendors = [];


            for (let i = 0; i < loadFile.length; i++) {
                sNewVendors[i] = {
                    CNPJ: loadFile[i].A.toString(),
                    name: loadFile[i].B,
                    registration: loadFile[i].C,
                    city: loadFile[i].D,
                    state: loadFile[i].E
                };

                sVendorsCNPJ[i] = loadFile[i].A.toString();
            }

            let existingVendors = await service.read(service.entities.NotasFiscaisVendor).where({ vendor: sVendorsCNPJ });
            let sPrefectures    = await service.read(service.entities.Prefectures).where({ searchVendor: true });

            if(sPrefectures.length === 0){
                return {
                    error: true,
                    errorMessage: oBundle.getText("ErrorPrefeituraNotExist")
                }
            }

            for(aNewVendor of sNewVendors){

                
                let validationCNPJ = ("00000" + aNewVendor.CNPJ).slice(-14);

               /* //Remove os zeros a esquerda do numero do vendor
                let vendorNumber = aNewVendor.CNPJ
                vendorNumber = Number(vendorNumber).toString();
                aNewVendor.CNPJ = vendorNumber*/

                //Remove caracteres não numericos do CCM do vendor
                let vendorCCM = aNewVendor.registration
                vendorCCM = vendorCCM.replace(/[^0-9]/g,'');
                aNewVendor.registration = vendorCCM


                if(cnpj.isValid(validationCNPJ)){
                    let exist = existingVendors.find(exist => { if(exist.vendor === aNewVendor.CNPJ) return exist });

                    if(exist === undefined){
                        let aPrefecture = sPrefectures.find(aPref => { if(aPref.prefectureName.toUpperCase() === `${aNewVendor.city}/${aNewVendor.state}`)  return aPref });

                        if(aPrefecture != undefined){
                            createVendors.push({
                                vendor: aNewVendor.CNPJ,
                                vendorCCM: aNewVendor.registration,
                                vendorName: aNewVendor.name,
                                prefecture_ID: aPrefecture.ID,
                                createdBy: req.user.id,
                                modifiedBy: req.user.id
                            });
                        }else {
                            logsVendors.push({
                                log: {
                                    CNPJ: aNewVendor.CNPJ,
                                    name: aNewVendor.name,
                                    registration: aNewVendor.registration,
                                    message: oBundle.getText("ErrorPrefeituraNotRegistered"),
                                },
                                error: false,
                                errorMessage: ""
                            });
                        }
                    }else {
                        logsVendors.push({
                            log: {
                                CNPJ: aNewVendor.CNPJ,
                                name: aNewVendor.name,
                                registration: aNewVendor.registration,
                                message: oBundle.getText("ErrorVendorRegistered"),
                            },
                            error: false,
                            errorMessage: ""
                        });
                    }
                }else {
                    logsVendors.push({
                        log: {
                            CNPJ: aNewVendor.CNPJ,
                            name: aNewVendor.name,
                            registration: aNewVendor.registration,
                            message: oBundle.getText("ErrorInvalidCNPJ"),
                        },
                        error: false,
                        errorMessage: ""
                    });
                }
            }

            if(createVendors.length != 0){
                await service.create(service.entities.NotasFiscaisVendor).entries(createVendors);

                return logsVendors;
            }else {
                return logsVendors;
            }
        } catch (e) {
            throw (e);
        }
    }
}