
using { 
    com.santander.nfse    as nfse 
} from '../../db/schema';



service NfsePost @( requires:'authenticated-user') {
//* Admin pode consultar e criar

    @odata.draft.enabled
    entity NotasFiscaisPostParameters @(restrict: [ 
            { grant: '*', to: 'nfse_admin' },
            { grant: 'READ', to: 'nfse_adminview' }
    ]) as projection on nfse.NotasFiscaisPostParameters;

    @readonly
    entity NotasFiscaisPostLog  @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.NotasFiscaisPostLog {
        *, notafiscal : redirected to NotasFiscais 
    };

    @readonly
    entity NotasFiscais @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.NotasFiscais {
        * , Log : redirected to NotasFiscaisLog
    };

    @readonly
    entity NotasFiscaisLog @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.NotasFiscaisLog;

    @readonly
    entity NotaFiscalStatus @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.NotaFiscalStatus

    @readonly
    entity PostParameters @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.PostParameters;

  
    @readonly
    entity ProcessingStatus @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.ProcessingStatus;
}