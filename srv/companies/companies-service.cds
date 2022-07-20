
using { 
    com.santander.nfse    as nfse 
} from '../../db/schema';



service Companies  @( requires:'authenticated-user') {
//* Admin pode consultar e criar
 
    @odata.draft.enabled : true
    entity Companies @(restrict: [ 
            { grant: '*', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminkeyuser' },
            { grant: 'READ', to: 'nfse_adminview' }
    ])as projection on nfse.Companies;
    
 
    entity CompaniesPrefectures @(restrict: [ 
            { grant: '*', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminkeyuser' },
            { grant: 'READ', to: 'nfse_adminview' }
    ]) as projection on nfse.CompaniesPrefectures {
        * , companies : redirected to Companies, prefectures : redirected to Prefectures
    };
  
    @readonly : true 
    entity Prefectures @(restrict: [ 
            { grant: 'READ', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminkeyuser' },
            { grant: 'READ', to: 'nfse_adminview' }
    ])as projection on nfse.Prefectures;

  
}