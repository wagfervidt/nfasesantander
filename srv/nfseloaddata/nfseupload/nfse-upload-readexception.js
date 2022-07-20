const { getReadException, 
        getReadExceptionByVendor, 
        createReadException
      }              = require("./db/db-upload-readException");
const { getBundle }  = require('../../common/i18n');
const xlsx           = require('xlsx');
const { cpf, cnpj }  = require('cpf-cnpj-validator');

async function handleUploadNfseReadException(req, service) {

    let tx = service.tx();

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
            headerExpected = ['CNPJ Prestador', 'Nome Prestador', 'Válido desde', 'Válido até']
            
            /*[`${oBundle.getText('download_vendor')}`   , `${oBundle.getText('download_vendorName')}`,
                              `${oBundle.getText('download_validFrom')}`, `${oBundle.getText('download_validTo')}`       
                             ]*/,
            headerName     = ["A","B","C","D"];
        
        for(let i=0; i < headerName.length; i++){
            if(loadFileHeader[headerName[i]] != headerExpected[i]){
                return {
                    log: {
                        vendor: null,
                        vendorExcName: null,
                        message: "",
                    },
                    error: true,
                    errorMessage: oBundle.getText("ErrorExcel")
                }
            }
        }

        //Converte o Objeto em um array de CNPJs de fornecedores
        let newExceptions  = [],
            aNewVendors    = [],
            logsExceptions = [];


        for (let i = 0; i < loadFile.length; i++) {
            newExceptions[i] = {
                vendor: loadFile[i].A.toString(),
                vendorExcName: loadFile[i].B,
                validFrom: loadFile[i].C,
                validTo: loadFile[i].D,
            }
            aNewVendors[i] = loadFile[i].A.toString();
        }

        //Procura as ReadExceptions já existentes no sistema 
        let existingVendors = await getReadExceptionByVendor(service, aNewVendors);

        //Contadores para auxiliar
        let actualArrayPosition = 0
        let actualCommit = 0
        let countToCommit = 1
        
        //Percorre o exel para inserir no sistema
        for (let exception of newExceptions) {
            exception.validFrom  = new Date(exception.validFrom);
            exception.validTo    = new Date(exception.validTo);
            exception.createdBy  = req.user.id,
            exception.modifiedBy = req.user.id,
            

            exception.validFrom.setUTCHours(exception.validFrom.getHours() + 3);
            exception.validTo.setUTCHours(exception.validTo.getHours() +  3);
            
            actualArrayPosition = actualArrayPosition + 1
            
            let validationVendorCNPJ = ("00000" + exception.vendor).slice(-14);
            let validationVendorCPF  = ("00000" + exception.vendor).slice(-11);
            
            //Remove os zeros a esquerda do numero do vendor
            let vendorNumber = exception.vendor
            vendorNumber = Number(vendorNumber).toString();
            exception.vendor = vendorNumber

            if(cnpj.isValid(validationVendorCNPJ) || cpf.isValid(validationVendorCPF)){
                //Caso não tenha ReadExceptions no sitema já realiza o cadastro
                if(existingVendors === null){
                    let resultCreateException = await createReadException(service, tx, exception);

                    actualCommit = actualCommit + 1
                    
                    console.log("INSERINDO: " + exception.vendor)
                    console.log("NUMERO ATUAL DO ARRAY: " + actualArrayPosition)

                    if(resultCreateException){
                        if (actualCommit === countToCommit) {
                            if (actualCommit < newExceptions.length - 20 && newExceptions.length - 20 > 0) {
                                countToCommit = countToCommit + 20
                                console.log("ReadException criada com sucesso!");
                                await tx.commit();
                            } else {
                                countToCommit = countToCommit + 1
                                console.log("ReadException criada com sucesso!");
                                await tx.commit();
                            }
                        }  
                    }else{
                        logsExceptions.push({
                            log: {
                                vendor: exception.vendor,
                                vendorExcName: exception.vendorExcName,
                                message: oBundle.getText("ErrorFailedRegisterReadException"),
                            },
                            error: false,
                            errorMessage: ""
                        });
                        await tx.rollback(); 
                    }
                }else{
                    //Procura se a ReadException atual esta dentro do sistema
                    let newReadException = existingVendors.find(o => o.vendor == exception.vendor);

                    if(newReadException){
                        logsExceptions.push({
                            log: {
                                vendor: exception.vendor,
                                vendorExcName: exception.vendorExcName,
                                message: oBundle.getText("ErrorReadExceptionRegistered"),
                            },
                            error: false,
                            errorMessage: ""
                        });
                    }else{
                        //Caso a ReadException não exista no sistema inicia o create
                        let resultCreateException = await createReadException(service, tx, exception);

                        actualCommit = actualCommit + 1
                    
                        console.log("INSERINDO: " + exception.vendor)
                        console.log("NUMERO ATUAL DO ARRAY: " + actualArrayPosition)

                        if(resultCreateException){
                            if (actualCommit === countToCommit) {
                                if (actualCommit < newExceptions.length - 20 && newExceptions.length - 20 > 0) {
                                    countToCommit = countToCommit + 20
                                    console.log("ReadException criada com sucesso!");
                                    await tx.commit();
                                } else {
                                    countToCommit = countToCommit + 1
                                    console.log("ReadException criada com sucesso!");
                                    await tx.commit();
                                }
                            }
                        }else{
                            logsExceptions.push({
                                log:{
                                    vendor: exception.vendor,
                                    vendorExcName: exception.vendorExcName,
                                    message: oBundle.getText("ErrorFailedRegisterReadException"),
                                },
                                error: false,
                                errorMessage: ""   
                            });
                            await tx.rollback(); 
                        }
                    }
                }
            } else {
                logsExceptions.push({
                    log: {
                        vendor: exception.vendor,
                        vendorExcName: exception.vendorExcName,
                        message: oBundle.getText("ErrorInvalidCNPJ"),
                    },
                    error: false,
                    errorMessage: ""
                });
            }
        }

        return logsExceptions;
    } catch (e) {
        throw (e);
    }
}

module.exports.handleUploadNfseReadException = handleUploadNfseReadException;
