const { getPrefectureByName, 
        getCompanies, 
        getCompaniePrefectures, 
        createCompaniesPrefectures
}                   = require("./db/db-load-companiesprefectures");
const { getBundle } = require('../../common/i18n');

module.exports = {
    async handleLoadCompanyPrefectures(req, service) {
        let oBundle        = getBundle(req.user.locale);
        let prefectureName = req.data.prefectureName;

        try {
            //Busca pra ver se a prefeitura existe no banco
            const aPrefecture = await getPrefectureByName(service, prefectureName);
            
            if (aPrefecture) {
                //Busca todas empresas cadastradas
                const aCompanies = await getCompanies(service);
                
                if(aCompanies.length != 0){
                    let compref             = [],
                        returnLog           = [];

                    let sCompanyPrefectures = await getCompaniePrefectures(service);

                    //Percorre todas empresas no sistema para validar se já existe em CompaniesPrefecures
                    for (company of aCompanies) {
                        let aCompanyPrefecture = sCompanyPrefectures.find(aCP => {
                            if(aCP.companies_ID === company.ID && aCP.prefectures_ID === aPrefecture.ID){ return aCP };
                        });

                        //Se não existe no sistema
                        if(!aCompanyPrefecture){
                            compref.push({
                                companies_ID: company.ID,
                                prefectures_ID: aPrefecture.ID,
                            });

                            //Preenche um array com o retorno de logs para o usuário
                            returnLog.push({
                                prefectureName: prefectureName,
                                companyName: company.companyName,
                                CNPJ: company.CNPJ,
                                message: "Prefeitura/Empresa cadastrada com sucesso!",
                                messageError: false
                            });
                        }
                    }

                    if(compref.length != 0){
                        //Faz o cadastro em CompaniesPrefectures
                        await createCompaniesPrefectures(service, compref);

                        return returnLog;
                    }else {
                        returnLog.push({
                            messageError: true
                        });

                        return returnLog;
                    }
                }
            }else {
                //Retorna erro se ela não existir
                const txt = oBundle.getText("mPREFECTURE_NOT_FOUND");
                return req.error(410, txt);
            }
        } catch (e) {
            throw (e)
        }
    }
}