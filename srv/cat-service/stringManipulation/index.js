
function getDateW3CStringFromDate(date){
    if(typeof date == "string"){
        date = new Date(date);
    }
    if(typeof date == "undefined"){
        date = new Date();
    }
    let month = date.getMonth();
    month+=1;
    if(month<10){
        month = "0"+month;
    }
    let day = date.getDate();
    if(day<10){
        day = "0"+day;
    }
    return date.getFullYear()+"-"+month+"-"+day;
}

function getNumericDigitsOnly(stringWithAlphaNumericCharacters){
    return stringWithAlphaNumericCharacters.replace(/[^0-9]/g, "");
}

function getDateIsoStringFromDate(date){
    if(typeof date == "string"){
        date = new Date(date);
    }
    if(typeof date == "undefined"){
        date = new Date();
    }
    return date.toISOString();
}

function getTimeStringFromDate(date){
    if(typeof date == "string"){
        date = new Date(date);
    }
    if(typeof date == "undefined"){
        date = new Date();
    }
    return date.toTimeString().split(" ")[0];

}

function removeAccents(text){
    text = text.toUpperCase();
    text = text.replace(new RegExp('[ÁÀÂÃ]','gi'), 'A'); 
    text = text.replace(new RegExp('[ÉÈÊ]','gi'), 'E'); 
    text = text.replace(new RegExp('[ÍÌÎ]','gi'), 'I'); 
    text = text.replace(new RegExp('[ÓÒÔÕ]','gi'), 'O'); 
    text = text.replace(new RegExp('[ÚÙÛ]','gi'), 'U'); 
    text = text.replace(new RegExp('[Ç]','gi'), 'C');
    return text;
}

function convertNLtoCRLF(text){
    //added \r to regex to not duplicate \r
    return text.replace(/[\r]{0,1}\n/g, '\r\n');
}

function replaceMarkersWithObject(text, obj, prefix, maxDeep, howManyisDeep){
    if(howManyisDeep > maxDeep){
        return text;
    }
    for(var keyObj in obj){
        if(typeof obj[keyObj] === 'object' && obj[keyObj] !== null){
            // go deep
            var objPrefix = "";
            if(prefix){
                objPrefix = prefix+".";
            }
            objPrefix+=keyObj;
            text = replaceMarkersWithObject(text, obj[keyObj], objPrefix, maxDeep, howManyisDeep+1);

        }else if(Array.isArray(obj[keyObj])){

            var objPrefix = "";
            if(prefix){
                objPrefix = prefix+".";
            }

            for(var i=0;i<obj[keyObj].length;i++){
                let objPrefixPos = objPrefix+"["+i+"]";
                text = replaceMarkersWithObject(text, obj[keyObj], objPrefixPos, maxDeep, howManyisDeep+1);
            }

        }else{

            //check for simple markers
            let replaceMarker = "{";
            if(prefix){
                replaceMarker = "{"+prefix+".";
            }
            replaceMarker+=keyObj+"}";

            let replaceValue = obj[keyObj];
            if(replaceValue === null){
                replaceValue = "";
            }
            text = text.split(replaceMarker).join(replaceValue);

            //check for calculate markers
            replaceMarker = ""
            if(prefix){
                replaceMarker = prefix+".";
            }
            replaceMarker+=keyObj;
            let regex = new RegExp(`\{\#${replaceMarker}\;[a-zA-Z0-9]{1,};[a-z0-9A-Z\,\"\']{0,}\}`,'g');
            var matches = text.match(regex);
            if(matches !== null){
                if(matches.length > 0){
                    for(var m=0;m<matches.length;m++){
                        var marker = matches[m];
                        var markerForParams = marker.split("{#").join("").split("}").join("");
                        var markersParams = markerForParams.split(";");
                        if(markersParams.length == 3){
                            markersParams[0] //field
                            markersParams[1] //method
                            markersParams[2] //params
                            try{
                                let functionParams = markersParams[2].split(",");
                                replaceValue = replaceValue[markersParams[1]](...functionParams);
                                text = text.split(marker).join(replaceValue);
                            }catch(e){

                            }
                        }
                    }
                }
            }

        }
    }
    return text;
}

function replaceNonUsedMarkersWithEmptyString(text){

    let regex = new RegExp(`\{[a-zA-Z0-9\.\,\;\"\'\#]{1,}?\}`,'g');

    return text.replace(regex, "");

}

module.exports = {
    getDateW3CStringFromDate: getDateW3CStringFromDate,
    getDateIsoStringFromDate: getDateIsoStringFromDate,
    getTimeStringFromDate: getTimeStringFromDate,
    getNumericDigitsOnly: getNumericDigitsOnly,
    removeAccents: removeAccents,
    convertNLtoCRLF: convertNLtoCRLF,
    replaceMarkersWithObject: replaceMarkersWithObject,
    replaceNonUsedMarkersWithEmptyString: replaceNonUsedMarkersWithEmptyString
}