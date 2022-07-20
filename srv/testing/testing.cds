
using { 
    com.santander.nfse as nfse
} from '../../db/schema';



service Testing   @(requires: ['nfse_admin','nfse_foreigncall'])
{ 
    action callExtApp ( destination: String,
                        path: String,
                        body: LargeString ) returns String;
    
    //email test
    action nfseMail () returns {};
    entity NotasFiscais                    as projection on nfse.NotasFiscais  actions {
        function getPDF() returns LargeString;

    };

} 
