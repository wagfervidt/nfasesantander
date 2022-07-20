
using { 
    com.santander.nfse    as nfse 
} from '../../db/schema';



service Cities @( requires:'authenticated-user') {
//* Admin pode consultar e criar
        @readonly
        entity Cities  @(restrict: [ 
            { grant: '*', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminview' }
        ]) as projection on nfse.Cities   
};

