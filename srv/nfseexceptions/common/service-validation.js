async function searchForWords(text, contentRegex) {
    try {
        if (text.length <= 5) {
            return false;
        } else {

            //Identifica como palavra válida acima de 2 caracteres
            let minQtyRegex = new RegExp(contentRegex + "{" + 2 + ",}", "gi");
            let regexRes = text.match(minQtyRegex);

            //Se não encontrou palavras válidas com erro, retorna erro
            if (!regexRes) return false;

            //Se não encontrou ao menos 2 palavras, retorna erro
            if (regexRes.length <  2) return false;

            //Se tem pelo menos 3 palavras, está ok 
            if (regexRes.length >= 3) return true;

            //Se tem 2 palavras, verifica se existe algum caractere especial
            if (regexRes.length ===  2) {

                //Procura por caracteres especiais em menos de 3 palavras
                let resultSpecialChar = await searchForSpecialChar(text, 1, "[@!#$%^&*()\/]")

                if (resultSpecialChar) {
                    return true;
                } else {
                    //Erro sem caracteres especiais 
                    return false;
                }
            }

        }
    } catch (e) {
        throw e
    }
}


async function checkValidDate(msTo, msFrom) {
    try {
        var aux = new Date();
        var dtToday = new Date(aux.getFullYear(), aux.getMonth(), aux.getDate(), 0, 0, 0, 0);
        let msToday = dtToday.getTime();

        if ((msFrom - msToday) < 0) {
            return false;
        }
        if ((msTo - msToday) <= 0) {
            return false;
        }

        if (msTo <= msFrom) {
            return false;
        }

        return true;
    } catch (e) {
        throw e
    }
}

async function checkValidDateUpdate(msTo, msFrom, dtFromOld) {
    try {
        var aux = new Date();
        var dtToday = new Date(aux.getFullYear(), aux.getMonth(), aux.getDate(), 0, 0, 0, 0);
        let msToday = dtToday.getTime();
        let msFromOld = new Date(dtFromOld);
        msFromOld = msFromOld.getTime();

        if ((msFrom - msFromOld) < 0) {
            return false;
        }
        if ((msTo - msToday) < 0) {
            return false;
        }

        if (msTo <= msFrom) {
            return false;
        }

        return true;
    } catch (e) {
        throw e
    }
}
async function searchForSpecialChar(text, min, contentRegex) {
    try {
        let minQtyRegex = new RegExp(contentRegex + "{" + min + ",}", "gi");
        let regexRes = text.match(minQtyRegex);

        if (regexRes !== null && regexRes[0] !== "") {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        throw e
    }
}

async function throwErrorValidation(errorValidation, bundle, req) {
    let txt = ""
    switch (errorValidation) {
        case 1:
            txt = bundle.getText("mERROR_DATE");
            return req.error(410, txt);

        case 2:
            txt = bundle.getText("mERROR_EXISTING");
            return req.error(410, txt);

        case 3:
            txt = bundle.getText("mERROR_SPECIALCHAR");
            return req.error(410, txt);

        case 4:
            let txtException = bundle.getText("nfse_txtexception");
            txt = bundle.getText("mERROR_EMPTYTEXT", txtException);
            return req.error(410, txt);
    }
}

module.exports = {
    searchForWords: searchForWords,
    searchForSpecialChar: searchForSpecialChar,
    checkValidDate: checkValidDate,
    checkValidDateUpdate: checkValidDateUpdate,
    throwErrorValidation: throwErrorValidation
}