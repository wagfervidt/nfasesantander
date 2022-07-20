
using { 
    com.santander.nfse    as nfse 
} from '../../db/schema';



service NfseArchive  @( requires:'authenticated-user') {
//* Admin pode consultar e criar
  
    @odata.draft.enabled : true
    entity NotasFiscaisArchive @(restrict: [ 
            { grant: '*', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminview' }
    ]) as projection on nfse.NotasFiscaisArchive;

    @readonly
    entity NotasFiscaisArchiveLog @(restrict: [ 
            { grant: 'READ', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminview' }
    ])as projection on nfse.NotasFiscaisArchiveLog;
  
  
    @readonly
    entity NotaFiscalStatus @(restrict: [ 
            { grant: 'READ', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminview' }
    ])as projection on nfse.NotaFiscalStatus;

        
    @readonly
    entity ProcessingStatus @(restrict: [ 
            { grant: 'READ', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminview' }
    ])as projection on nfse.ProcessingStatus;
}
