module.exports = {
    async getPrefectureByName(service, prefectureName){
        try {
            let result = await service.read(service.entities.Prefectures,
                [
                    "ID", "prefectureName"
                ]).where({
                "PREFECTURENAME": prefectureName
            });

            return result[0];
        } catch (e) {
            throw (e);
        } 
    },

    async getCompanies(service){
        try {
            return await service.read(service.entities.Companies,
                [
                    "ID",
                    "CNPJ",
                    "companyName"
                ]
            );
        } catch (e) {
            throw (e);
        }
    },

    async getCompaniePrefectures(service){
        try {
            return await service.read(service.entities.CompaniesPrefectures);
        } catch (e) {
            throw (e);
        }
    },


    async createCompaniesPrefectures(service, sCompref) {
        try {
            return await service.create(service.entities.CompaniesPrefectures).entries(sCompref);
        } catch (e) {
            throw (e);
        }
    }
}