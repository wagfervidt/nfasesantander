module.exports = {
    async createNotesScheduleLog(tx, service, existingCompanyID, existingPrefectureID, data, CCMPrefecture, req) {
        let result;
        try {
            result = await tx.create(service.entities.NotasFiscaisScheduleLog).entries({
                "COMPANY_ID": existingCompanyID,
                "PREFECTURE_ID": existingPrefectureID,
                "READDATE": data,
                "CCMPrefecture": CCMPrefecture,
                "STATUS.status": 3,
                "TXTSTATUS": 'Uploaded by admin',
                "createdBy": req.user.id,
                "modifiedBy": req.user.id

            });
        } catch (e) {
            throw (e);
        }
        if (!result) {
            return null;
        } else {
            return result;
        }

    },

    async getCompanyPrefectures(service, aCompaniesCNPJ) {
        let result;
        let aCompaniesID = [];

        try {
            result = await service.read(service.entities.Companies, [
                "ID"
            ]).where({
                CNPJ: aCompaniesCNPJ,
                inactive: false
            })

            if (!result.length == 0) {
                for (let resultID of result) {
                    aCompaniesID.push(resultID.ID);
                }


                result = await service.read(service.entities.CompaniesPrefectures,
                    [
                        "companies.ID as companyID",
                        "companies.CNPJ as companyCNPJ",
                        "companies.CCM as companyCCM",
                        "prefectures.ID as prefectureID",
                        "prefectures.requireCCM as prefectureReqCCM",
                        "prefectures.inactive as prefectureInactive"
                    ]
                ).where({
                    "companies.ID": aCompaniesID
                });
            }
        } catch (e) {
            throw (e);
        }
        if (!result) {
            return null;
        } else {
            return result;
        }
    },


    async getScheduleLogCompPrefec(service, companyPrefectures) {
        let result;

        try {
            //Aqui vc tem que ler com todas as empresas e prefeituras que estão no schedulelog
            result = await service.read(service.entities.NotasFiscaisScheduleLog).where({
                "COMPANY_ID": companyPrefectures.companyID,
                "PREFECTURE_ID": companyPrefectures.prefectureID
            }).limit(1);
        } catch (e) {
            throw (e);
        }
        if (!result) {
            return null;
        } else {
            return result;
        }
    }
};
