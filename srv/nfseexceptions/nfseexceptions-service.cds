
using { 
    com.santander.nfse    as nfse 
} from '../../db/schema';



service NfseExceptions @( requires:'authenticated-user') {
//* Admin pode consultar e criar

    @odata.draft.enabled : true
    entity NotasFiscaisReadException @(restrict: [ 
            { grant: '*', to: 'nfse_admin' },
            { grant: '*', to: 'nfse_adminkeyuser' },
            { grant: 'READ', to: 'nfse_adminview' }
    ]) as projection on nfse.NotasFiscaisReadException; 

    entity NotasFiscaisReadExceptCompanies @(restrict: [ 
            { grant: '*', to: 'nfse_admin' },
            { grant: '*', to: 'nfse_adminkeyuser' },
            { grant: 'READ', to: 'nfse_adminview' }
    ]) as projection on nfse.NotasFiscaisReadExceptCompanies {
        * , company : redirected to Companies, nfseException : redirected to  NotasFiscaisReadException
    };

    @readonly: true
    entity Companies @(restrict: [ 
            { grant: 'READ', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminkeyuser' },
            { grant: 'READ', to: 'nfse_adminview' }
    ]) as projection on nfse.Companies;


    @odata.draft.enabled : true
    entity NotasFiscaisTextException @(restrict: [ 
            { grant: '*', to: 'nfse_admin' },
            { grant: '*', to: 'nfse_adminkeyuser' },
            { grant: 'READ', to: 'nfse_adminview' }
    ]) as projection on nfse.NotasFiscaisTextException; 
}