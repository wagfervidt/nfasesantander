
using { 
    com.santander.nfse    as nfse 
} from '../../db/schema';



service Prefectures @( requires:'authenticated-user') {
//* Admin pode consultar e criar
 
    @odata.draft.enabled : true
    entity Prefectures @(restrict: [ 
            { grant: '*', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminview' }
    ]) as projection on nfse.Prefectures;

    entity CompaniesPrefectures  @(restrict: [ 
            { grant: '*', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminview' }
    ]) as projection on nfse.CompaniesPrefectures {
        * , companies : redirected to Companies, prefectures :  redirected to Prefectures
    };

    @readonly: true
    entity Companies @(restrict: [ 
            { grant: 'READ', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminview' }
    ]) as projection on nfse.Companies;

    @readonly: true
    entity Mappings @(restrict: [ 
            { grant: 'READ', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminview' }
    ])  as projection on nfse.Mappings;

    @readonly: true
    entity LayoutPatterns @(restrict: [ 
            { grant: 'READ', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminview' }
    ])  as projection on nfse.LayoutPatterns;


}