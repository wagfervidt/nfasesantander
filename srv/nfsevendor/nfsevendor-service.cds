
using { 
    com.santander.nfse    as nfse 
} from '../../db/schema';



service NfseVendor @( requires:'authenticated-user') {
//* Admin pode consultar e criar

    @odata.draft.enabled : true
    entity NotasFiscaisVendor @(restrict: [ 
            { grant: '*', to: 'nfse_admin' },
            { grant: '*', to: 'nfse_adminkeyuser' },
            { grant: 'READ', to: 'nfse_adminview' }
    ]) as projection on nfse.NotasFiscaisVendor; 

    @readonly
    entity Prefectures @(restrict: [ 
            { grant: 'READ', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminkeyuser' },
            { grant: 'READ', to: 'nfse_adminview' }
    ])  as projection on nfse.Prefectures;
    
 
}


        
