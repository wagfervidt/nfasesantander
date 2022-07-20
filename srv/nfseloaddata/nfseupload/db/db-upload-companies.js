async function updateCompany(service, ID, CCM) {
    let result;
    try {
        result = await service.update(service.entities.Companies).set({
            "CCM": CCM
        }).where({
            ID: ID
        });
    } catch (e) {
        throw (e)
    }
    if (!result) {
        return null;
    } else {
        return result;
    }
}

async function getCompaniesForCNPJ(service, companyCNPJ) {
    let companies;
    try {
        companies = await service.read(service.entities.Companies)
            .where({
                CNPJ: companyCNPJ
            });

        if (companies.length === 0) {
            return null;
        } else {
            return companies[0];
        };
    } catch (e) {
        console.log(e)
        throw (e)
    }
}

async function getEmptyCCMPrefec(service) {
    let prefectures;

    try {
        prefectures = await service.read(service.entities.Prefectures)
            .where({
                requireCCM: 'false'
            });
    } catch (e) {
        console.log(e)
        throw (e)
    }
    if (prefectures.length === 0) {
        return null;
    } else {
        return prefectures;
    }
}

async function insertIntoCompanies(tx, service, Company) {
    return await tx.create(service.entities.Companies).entries({
        "companyName": Company.name,
        "CNPJ": Company.CNPJ,
        "CCM": Company.CCM,
        "homePrefecture_ID": Company.homeprefecture_id,
        "certificate": Company.certificate,
        "description": Company.description,
        "inactive": false
    });

}

async function insertIntoCompaniesPrefectures(tx, service, aCompaniesPrefectures) {
    let result;

    try {
        result = await
            tx.create(service.entities.CompaniesPrefectures).entries(aCompaniesPrefectures);
    } catch (e) {
        throw (e);
    }
    if (result.length === 0) {
        return null;
    } else {
        return result;
    }
}

module.exports = {
    updateCompany: updateCompany,
    getCompaniesForCNPJ: getCompaniesForCNPJ,
    getEmptyCCMPrefec: getEmptyCCMPrefec,
    insertIntoCompanies: insertIntoCompanies,
    insertIntoCompaniesPrefectures: insertIntoCompaniesPrefectures

}