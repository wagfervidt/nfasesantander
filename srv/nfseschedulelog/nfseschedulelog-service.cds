
using { 
    com.santander.nfse    as nfse 
} from '../../db/schema';



service NfseScheduleLog @( requires:'authenticated-user') {
//* Admin pode consultar e criar
    @readonly: true
    entity NotasFiscaisScheduleLog  @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.NotasFiscaisScheduleLog;

    @readonly
    entity NotaFiscalStatus  @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.NotaFiscalStatus;

    @readonly
    entity Companies  @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.Companies;

    @readonly
    entity Prefectures  @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.Prefectures;
        
    @readonly
    entity ProcessingStatus  @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.ProcessingStatus;
}