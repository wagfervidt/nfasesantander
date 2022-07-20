const { insertIntoCompanies,
    getCompaniesForCNPJ,
    getEmptyCCMPrefec,
    updateCompany,
    insertIntoCompaniesPrefectures
} = require("./db/db-upload-companies");
const { getBundle } = require('../../common/i18n');
const xlsx = require('xlsx');
const { cpf, cnpj } = require('cpf-cnpj-validator');

async function handleUploadCompanies(req, service) {
    const tx = service.tx();

    try {
        let oBundle = getBundle(req.user.locale);
        let excelXlsx = xlsx.read(req.data.File);
        let ws = excelXlsx.Sheets[excelXlsx.SheetNames[0]];
        let range = xlsx.utils.decode_range(ws["!ref"]).e.r;

        let loadFile = xlsx.utils.sheet_to_json(ws, {
            header: "A",
            raw: false,
            range: `A1:ZZ${range + 1}`,
            dateNF: "YYYY-MM-DD"
        });

        //Retira/Obtem o header do arquivo
        let loadFileHeader = loadFile.shift(),
            headerExpected = [`${oBundle.getText('download_CNPJ')}`, `${oBundle.getText('download_name')}`,
            `${oBundle.getText('download_CCM')}`, `${oBundle.getText('download_certificate')}`,
            `${oBundle.getText('download_description')}`, `${oBundle.getText('download_cityName')}`,
            `${oBundle.getText('download_UF')}`
            ],
            headerName = ["A", "B", "C", "D", "E", "F", "G"];

        for (let i = 0; i < headerName.length; i++) {
            if (loadFileHeader[headerName[i]] != headerExpected[i]) {
                return {
                    log: {
                        CNPJ: null,
                        name: null,
                        message: "",
                    },
                    error: true,
                    errorMessage: oBundle.getText("ErrorExcel")
                }
            }
        }

        //Converte o Objeto em um array de CNPJs
        let newCompanies = [],
            logsCompanies = [];

        for (let i = 0; i < loadFile.length; i++) {
            newCompanies[i] = {
                CNPJ: loadFile[i].A,
                name: loadFile[i].B,
                CCM: loadFile[i].C,
                certificate: loadFile[i].D,
                description: loadFile[i].E,
                city: loadFile[i].F,
                state: loadFile[i].G,
                homeprefecture_id: null
            }
        }

        //Pega todas prefeituras com CCM false
        let aPrefectures = await getEmptyCCMPrefec(service);

        //Empresas inseridas durante a execução
        let arrayInsertedCompanies = [];

        //Contadores que percorrem o array
        let actualArrayPosition = 0
        let actualCommit = 0
        let countToCommit = 1

        //Let que verifica se a empresa esta no sistema
        let companyInSystem

        for (let newCompany of newCompanies) {

            //Adiciona +1 ao contador que é mostrado no console.log
            console.log("POSIÇÃO ARRAY: " + actualArrayPosition + " CIDADE: " + newCompany.city)
            actualArrayPosition = actualArrayPosition + 1

            //Remove os espaços em branco no CNPJ
            let parseCNPJ = parseInt(newCompany.CNPJ)
            newCompany.CNPJ = parseCNPJ + ''

            let validationCNPJ = ("00000" + newCompany.CNPJ).slice(-14);

            //Remove os zeros a esquerda do numero do vendor
            let vendorNumber = newCompany.CNPJ
            vendorNumber = Number(vendorNumber).toString();
            newCompany.CNPJ = vendorNumber

            if (cnpj.isValid(validationCNPJ)) {
                //Busca o CNPJ dentro das empresas ja cadastradas
                companyInSystem = await getCompaniesForCNPJ(service, newCompany.CNPJ);

                //Se o cnpj esta dentro da array de CNPJs entao realizar o update
                if (companyInSystem) {
                    companyInSystem = false
                    //Se p CNPJ já existe no sistema    
                    logsCompanies.push({
                        log: {
                            CNPJ: newCompany.CNPJ,
                            name: newCompany.name,
                            message: oBundle.getText("ErrorCompanyRegistered")
                        },
                        error: false,
                        errorMessage: ''
                    });
                } else {
                    let concatCity,
                        companyInserted;

                    //Cria novo cadastro de empresa dentro do sistema
                    //Concatena o nome da cidade atual do exel sendo percorrido
                    concatCity = newCompany.city + "/" + newCompany.state;

                    if (concatCity === 'SÃO PAULO/SP') {
                        //Buscar id da prefeitura e inserir no homeprefecture_id
                        for (let index = 0; index < aPrefectures.length; index++) {
                            if (aPrefectures[index].prefectureName === 'São Paulo/SP') {
                                newCompany.homeprefecture_id = aPrefectures[index].ID;
                                break;
                            }
                        }
                    }

                    //Faz o Insert no sistema
                    try {
                        //Mostra os dados de inserção
                        console.log("ISERIDO NO SISTEMA CNPJ: " + newCompany.CNPJ + "  CIDADE: " + concatCity)
                        console.log("NUMERO A SER INSERIDO: " + newCompanies.length)
                        console.log("NUMERO DO ARRAY ATUAL: " + actualArrayPosition)
                        console.log("a==================***==================a")

                        companyInserted = await insertIntoCompanies(tx, service, newCompany);


                        if (companyInserted) {
                            arrayInsertedCompanies.push(companyInserted.CNPJ);

                            //Contador que define se vai dar commit no sistema
                            actualCommit = actualCommit + 1
                        } else {
                            logsCompanies.push({
                                log: {
                                    CNPJ: newCompany.CNPJ,
                                    name: newCompany.name,
                                    message: oBundle.getText("ErrorFailedRegisterCompany"),
                                },
                                error: false,
                                errorMessage: ""
                            });
                        }
                    } catch (e) {
                        logsCompanies.push({
                            log: {
                                CNPJ: newCompany.CNPJ,
                                name: newCompany.name,
                                message: oBundle.getText("ErrorFailedRegisterCompany"),
                            },
                            error: false,
                            errorMessage: ""
                        });
                        throw (e)
                    }

                    let aCompaniesPrefectures = [];

                    //Faz o Insert do CompaniesPrefectures
                    for (let prefecture of aPrefectures) {
                        aCompaniesPrefectures.push({
                            "companies_ID": companyInserted.ID,
                            "prefectures_ID": prefecture.ID,
                            "createdBy": req.user.id,
                            "modifiedBy": req.user.id,
                        });
                    }

                    try {
                        await insertIntoCompaniesPrefectures(tx, service, aCompaniesPrefectures);
                    } catch (e) {
                        throw (e)
                    }
                }
            } else {
                logsCompanies.push({
                    log: {
                        CNPJ: newCompany.CNPJ,
                        name: newCompany.name,
                        message: oBundle.getText("ErrorInvalidCNPJ"),
                    },
                    error: false,
                    errorMessage: ""
                });
            }


        }

        await tx.commit();

        return logsCompanies;
    } catch (e) {
        throw (e)
    }
}

module.exports.handleUploadCompanies = handleUploadCompanies;
