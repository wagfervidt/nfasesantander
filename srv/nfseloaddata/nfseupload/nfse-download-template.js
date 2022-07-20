const xlsx = require('xlsx');
module.exports = {
    async handleDownloadTemplate(req) { 
        let oName    = req.data.Name,
            excel    = xlsx.readFileSync(__dirname+'/db/' + oName + '.xlsx'),
            ws       = excel.Sheets[excel.SheetNames[0]],
            range    = xlsx.utils.decode_range(ws["!ref"]).e.r,
            loadFile = xlsx.utils.sheet_to_json(ws, {
                header: "A",
                raw: false,
                range: `A1:ZZ${range+1}`,
                dateNF: "YYYY-MM-DD"
            });
            
        loadFile.shift();

        if (oName === "companies") {
            return {
                companies: {
                    CNPJ: loadFile[0].A,
                    nome: loadFile[0].B,
                    CCM: loadFile[0].C,
                    certificado: loadFile[0].D,
                    descricao: loadFile[0].E,
                    cidade: loadFile[0].F,
                    UF: loadFile[0].G
                }
            }

        }else if(oName === "scheduleLog"){
            let dateInit = new Date(loadFile[0].B).toISOString().substring(0, 10);

            return {
                schedule: {
                    CNPJ: loadFile[0].A,
                    DataInicio: `${dateInit.substring(8, 10)}/${dateInit.substring(5, 7)}/${dateInit.substring(0, 4)}`
                }
            }

        }else if(oName === "readexception") {
            return {
                exception: {
                    vendor: loadFile[0].A,
                    vendorExcName: loadFile[0].B,
                    ValidFrom: loadFile[0].C,
                    ValidTo:loadFile[0].D
                }
            }

        }else {
            return {
                vendor: {
                    CNPJ: loadFile[0].A,
                    nome: loadFile[0].B,
                    inscricao: loadFile[0].C,
                    cidade: loadFile[0].D,
                    UF: loadFile[0].E
                }
            }
        }
    }
}