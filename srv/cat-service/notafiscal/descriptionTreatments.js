function searchForCharacters(text, tests, searchQtd, min, max, fillWithleadingZeros, contentRegex){
    for(let keyTest in tests){
        let test = tests[keyTest];
        let position = text.indexOf(test, 0);
        if(position >= 0){
            var subtext = text.substr(position+test.length, searchQtd);
            let minQtyRegex = new RegExp(contentRegex+"{"+min+",}","gi");
            let regexRes = subtext.match(minQtyRegex);
            if(regexRes !== null && regexRes.length > 0){
                let initialPositionOfContent = subtext.indexOf(regexRes[0]);
                let completed = false;
                let indexTest = initialPositionOfContent;
                let content = "";
                let contentReg =  new RegExp(contentRegex);
                while(!completed){
                    let possibleContent = text.substr(position+test.length+indexTest,1);
                    let isContent = possibleContent.match(contentReg);
                    if(isContent !== null && isContent.length){
                        content += possibleContent;
                        if(content.length >= max){
                            completed = true;
                        }
                    }else{
                        completed = true;
                    }
                    indexTest+=1;
                }
                if(content.length < max && fillWithleadingZeros){
                    while(content.length < max){
                        content = "0"+content;
                    }
                }
                return content;
            }
        }
    }
    return null;
}

function isPedido(line){
    return (/PED|PEDIDO/g).test(line);
}

function isItem(line){
    return (/ITEM|ITM/g).test(line);
}

function isConta(line){
    return (/CTA|CONTA|PADRAO CONTABIL SAP|PADRAO CONTABIL|CONTABIL/g).test(line);
}

function isUniorg(line){
    return (/UNIORG|UNIDADE/g).test(line);
}

function isVencimento(line){
    return (/VENCIMENTO|VCTO|VENC/g).test(line);
}
function isBanco(line){
    return (/BANCO|BCO/g).test(line);
}

function isAgencia(line){
    return (/AGENCIA|AG.|AG-|AG|AG:/g).test(line);
}
function isCC(line){
    return (/CC|C\/C|C.C|CORRENTE|CORRENTE:/g).test(line);
}
function isContato(line){
    return (/CONTATO|CTO|CNTO|CNT:/g).test(line);
}
function isArea(line){
    return (/AREA:|AREA/g).test(line);
}


function treatPedido(line, notafiscal){
    let val = searchForCharacters(line, ["PEDIDO SAP:","PEDIDO SAP", "PEDIDO FINANCEIRO:", "PEDIDO FINANCEIRO","PEDIDO:", "PED", "PEDIDO"], 12, 5, 10, true, "[0-9]");
    if(val == null){
        return notafiscal;
    }
    notafiscal.srvPO = val;
    return notafiscal;
}

function treatItem(line, notafiscal){
    let val = searchForCharacters(line, ["ITEM:", "ITEM", "ITM"], 6, 2, 5, true, "[0-9]");
    if(val == null){
        return notafiscal;
    }
    notafiscal.srvPOItem = val;
    return notafiscal;
}

function treatConta(line, notafiscal){
    if(notafiscal.srvAccount) return notafiscal
    let val = searchForCharacters(line, ["CONTABIL SAP:", "CONTABIL SAP", "CONTA SAP:", "CONTA SAP", "CONTABIL", "CONTABIL:", "CONTA:", "CTA", "CONTA", "PADRAO CONTABIL SAP", "PADRAO CONTABIL"], 17, 7, 10, true, "[0-9\-\/]");
    if(val == null){
        return notafiscal;
    }
    notafiscal.srvAccount = val;
    return notafiscal;
}

function treatUniorg(line, notafiscal){
    let val = searchForCharacters(line, ["UNIDADE:", "UNIORG:", "UNIORG", "UNIDADE"], 10, 7, 10, true, "[a-zA-Z0-9\-]");
    if(val == null){
        return notafiscal;
    }
    notafiscal.srvCostCenter = val;
    return notafiscal;
}

function treatVencimento(line, notafiscal){
    let val = searchForCharacters(line, ["DATA DE VENCIMENTO:", "DATA DE VENCIMENTO", "VENCIMENTO:", "VENCIMENTO", "VECTO", "VENC"], 20, 2, 10, false, "[0-9-/\\\\\.\-]");
    let moment = require('moment');

    if(val == null){
        return notafiscal;
    }
    val = val.trim();

    val = val.split(/[^0-9]+/g).join("/");

    var dateArr = val.split("/");

    if(dateArr.length == 3 && dateArr[0].length == 2 && dateArr[1].length == 2 && (dateArr[2].length == 2 || dateArr[2].length == 4)){

        var year = parseInt(dateArr[2])+"";
        var month = parseInt(dateArr[1])+"";
        var day = parseInt(dateArr[0])+"";

        
        if(month > 12){
            return notafiscal;
        }
        if(month <= 0){
            return notafiscal;
        }

        if(day > 31 || (month == 2 && day > 29)){
            return notafiscal;
        }

        if(day <= 0){
            return notafiscal;
        }

        if(year.length == 2){
            year = "20"+year;
        }

        if(month.length == 1){
            month = "0"+month;
        }
        
        if(day.length == 1){
            day = "0"+day;
        }

        let dueDate = year+"-"+month+"-"+day;
        let m = moment(dueDate, 'YYYY-MM-DD');

        if(m.isValid()){
            notafiscal.srvDueDate = dueDate
        }else{
            return notafiscal;
        }
     
    }
    
    return notafiscal;
}

function treatBanco(line, notafiscal){
    let val = searchForCharacters(line, ["BANCO:","BANCO", "BCO"], 20, 2, 3, true, "[0-9]");
    if(val == null){
        return notafiscal;
    }
    notafiscal.srvBank = val;
    return notafiscal;
}

function treatAgencia(line, notafiscal){
    let val = searchForCharacters(line, ["AGENCIA:", "AGENCIA", "AG.", "AG-", "AG:", "AG"], 7, 2, 5, true, "[0-9\-]");
    if(val == null){
        return notafiscal;
    }
    notafiscal.srvBankAgency = val;
    return notafiscal;
}

function treatCC(line, notafiscal){
    let val = searchForCharacters(line, ["CORRENTE:", "CC:", "C C", "C.C", "CC", "C/C:", "C/C", "CORRENTE"], 27, 7, 10, true, "[0-9\-]");
    if(val == null){
        return notafiscal;
    }
    notafiscal.srvBankAccount = val;
    return notafiscal;
}

function treatContato(line, notafiscal){
    let val = searchForCharacters(line, ["TELEFONE:", "TELEFONE", "CONTATO:", "CONTATO", "CTO", "CNTO", "CNT"], 25, 8, 20, false, "[ 0-9\-\.\+\(\)]");
    if(val == null){
        return notafiscal;
    }
    notafiscal.srvContact = val.trim();
    return notafiscal;
}

function treatArea(line, notafiscal){
    let val = searchForCharacters(line, ["AREA RESPONSAVEL:", "AREA RESPONSAVEL", "AREA:", "AREA"], 25, 4, 25, false, "[ 0-9a-zA-Z]");
    if(val == null){
        return notafiscal;
    }
    notafiscal.srvArea = val.trim();
    return notafiscal;
}

async function isTxtException(line, textException){
    let testeString = new RegExp(textException)
    let result = testeString.test(line);

    return result
}

module.exports = {
    isTxtException:isTxtException,
    isPedido: isPedido,
    treatPedido: treatPedido,
    isItem: isItem,
    treatItem: treatItem,
    isConta: isConta,
    treatConta:treatConta,
    isUniorg: isUniorg,
    treatUniorg: treatUniorg,
    isVencimento: isVencimento,
    treatVencimento: treatVencimento,
    isBanco: isBanco,
    treatBanco: treatBanco,
    isAgencia: isAgencia,
    treatAgencia: treatAgencia,
    isCC: isCC,
    treatCC: treatCC,
    isContato: isContato,
    treatContato: treatContato,
    isArea: isArea,
    treatArea: treatArea,
    searchForCharacters: searchForCharacters
}