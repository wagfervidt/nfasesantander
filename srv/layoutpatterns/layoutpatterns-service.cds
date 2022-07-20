
using { 
    com.santander.nfse    as nfse 
} from '../../db/schema';



service LayoutPatterns @( requires:'authenticated-user') {
//* Admin pode consultar e criar
 
    @odata.draft.enabled : true
    entity LayoutPatterns @(restrict: [ 
            { grant: '*', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminview' }
    ]) as projection on nfse.LayoutPatterns;

}