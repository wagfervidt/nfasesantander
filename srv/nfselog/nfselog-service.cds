
using { 
    com.santander.nfse    as nfse 
} from '../../db/schema';



service NfseLog @( requires:'authenticated-user') {
//* Admin pode consultar e criar

    @readonly
    entity NfseLog @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.NotasFiscaisLog {
        *,
        null as oldLevel: Integer,
        null as newLevel: Integer
    };

    @readonly
    entity Companies  @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.Companies;

    @readonly
    entity Prefecture  @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.Prefectures;


    @readonly
    entity NotaFiscalStatus  @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.NotaFiscalStatus;

    @readonly
    entity NotasFiscais  @(restrict: [ 
            { grant: 'READ', to: 'nfse_log' }
    ]) as projection on nfse.NotasFiscais;
}