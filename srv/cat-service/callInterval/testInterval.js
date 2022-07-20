async function testInterval(prefecture) {
    try {
        //Se a prefeitura for Aracaju precisa esperar 1 segundo entre as chamadas
        if (prefecture === 'Aracaju/SE') {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    } catch (e) {
        throw e;
    }
}

async function testIntervalCompany(prefecture){
    try{
        //Se a prefeitura necessitar espera 5 minutos entre as requisições de tomador
        if(prefecture === 'São José/SC'){
            console.log('WAITING 5 MINUTES...')
            await new Promise(resolve => setTimeout(resolve, 300000));
        }
        if(prefecture === 'Criciúma/SC'){
            console.log('WAITING 5 MINUTES...')
            await new Promise(resolve => setTimeout(resolve, 300000));
        }
        if(prefecture === 'Imbituba/SC'){
            console.log('WAITING 5 MINUTES...')
            await new Promise(resolve => setTimeout(resolve, 300000));
        }
        if(prefecture === 'Lages/SC'){
            console.log('WAITING 5 MINUTES...')
            await new Promise(resolve => setTimeout(resolve, 300000));
        }
        if(prefecture === 'Joaçaba/SC'){
            console.log('WAITING 5 MINUTES...')
            await new Promise(resolve => setTimeout(resolve, 300000));
        }
    }catch(e){
        throw e
    }
}

module.exports = {
    testInterval,
    testIntervalCompany
}