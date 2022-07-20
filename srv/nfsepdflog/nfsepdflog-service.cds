
using { 
    com.santander.nfse    as nfse 
} from '../../db/schema';



service NfsePDFLog @( requires:'authenticated-user') {
//* Admin pode consultar e criar

    @readonly
    entity NotasFiscaisPDFLog  @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.NotasFiscaisPDFLog {
        *, notafiscal : redirected to NotasFiscais 
    };

    @readonly
    entity NotasFiscais @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.NotasFiscais;

   
    @readonly
    entity ProcessingStatus @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.ProcessingStatus;
}