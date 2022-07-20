const { getCompanyPrefectures, 
        getScheduleLogCompPrefec, 
        createNotesScheduleLog  
      }              = require("./db/db-upload-schedulelog");
const { getBundle }  = require('../../common/i18n');
const xlsx           = require('xlsx');

async function handleUploadNfseScheduleLog(req, service) {

    const tx = service.tx();

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

        //Retira/Obtem o header do arquivo
        let loadFileHeader = loadFile.shift(),
            headerExpected = [`${oBundle.getText('download_schedule_CNPJ')}`,`${oBundle.getText('download_readDate')}`],
            headerName     = ["A","B"];
        
        for(let i=0; i < headerName.length; i++){
            if(loadFileHeader[headerName[i]] != headerExpected[i]){
                return {
                    log: {
                        CNPJ: null,
                        readDate: null,
                        message: "",
                    },
                    error: true,
                    errorMessage: oBundle.getText("ErrorExcel")
                }
            }
        }

        //Converte o Objeto em um array de CNPJs
        let newCompanies   = [],
            aCompaniesCNPJ = [],
            logsCompanies  = [];


        for (let i = 0; i < loadFile.length; i++) {
            newCompanies[i] = {
                CNPJ: loadFile[i].A,
                readDate: loadFile[i].B
            };
            aCompaniesCNPJ.push(loadFile[i].A);
        }

        //Pega todos registros de empresa/prefeitura relacionada a prefeitura que estão no arquivo
        const aGetCompanyPrefectures = await getCompanyPrefectures(service, aCompaniesCNPJ)

        //Percorre as empresas cadastradas no sistema 
        for (let companyPrefecture of aGetCompanyPrefectures) {
            //Pega todos registros do NotasFiscaisScheduleLog a partir da empresa/prefeitura encontradas na seleção
            let scheduleLogCompPrefec = await getScheduleLogCompPrefec(service, companyPrefecture);
            let newCompany            = newCompanies.find(o => o.CNPJ == companyPrefecture.companyCNPJ);

            if (scheduleLogCompPrefec.length == 0) {
                //Se não tem o registro no NotasFiscaisScheduleLog com o ID da empresa eprefeitura atual
                //E a prefeitura esta como inactive = 'false'
                let newDate = new Date(newCompany.readDate).toISOString().substring(0, 10);
            
                await createNotesScheduleLog(
                    tx, 
                    service, 
                    companyPrefecture.companyID, 
                    companyPrefecture.prefectureID, 
                    newDate,
                    companyPrefecture.companyCCM,
                    req
                );

                //await tx.commit();
            } else {
                let dateInit = new Date(newCompany.readDate).toISOString().substring(0, 10);

                let oLogCompany = logsCompanies.find(sLog => {
                    if(sLog.CNPJ === newCompanies.CNPJ) return sLog;
                });

                if(oLogCompany === undefined){
                    logsCompanies.push({
                        log: {
                            CNPJ: newCompany.CNPJ,
                            readDate: `${dateInit.substring(8, 10)}/${dateInit.substring(5, 7)}/${dateInit.substring(0, 4)}`,
                            message: oBundle.getText("ErrorCompanyPrefecturesRegistered"),
                        },
                        error: false,
                        errorMessage: ""
                    });
                }
            }
        }

        await tx.commit();

        return logsCompanies;
    } catch (e) {
        throw (e)
    }
}

module.exports.handleUploadNfseScheduleLog = handleUploadNfseScheduleLog;
