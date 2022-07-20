
using { 
    com.santander.nfse    as nfse 
} from '../../db/schema';



service Mappings @( 
    requires :'authenticated-user') {
//* Admin pode consultar e criar
    @odata.draft.enabled : true
    entity Mappings @(restrict: [ 
            { grant: '*', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminview' }
    ]) as projection on nfse.Mappings;

}
