
using { 
    com.santander.nfse    as nfse 
} from '../../db/schema';



service NfseList @( requires:'authenticated-user') {
//* Admin pode consultar e criar

    @readonly
    entity NotasFiscaisLog @(restrict: [ 
            { grant: 'READ', to: 'nfse_display' },
            { grant: 'READ', to: 'nfse_monitor' }
    ]) as projection on nfse.NotasFiscaisLog  { 
        *,
        oldStatus.txtStatus as oldTxtStatus,
        newStatus.txtStatus as newTxtStatus
    };

   /* @readonly
    entity NotasFiscaisLogDetail @(restrict: [ 
            { grant: 'READ', to: 'nfse_display' },
            { grant: 'READ', to: 'nfse_monitor' }
    ]) as projection on NfseList.NotasFiscaisLog { 
        *,
        oldStatus.txtStatus as oldTxtStatus,
        newStatus.txtStatus as newTxtStatus
    };*/
    
    @readonly
    entity NotasFiscaisPostLog @(restrict: [ 
            { grant: 'READ', to: 'nfse_display' },
            { grant: 'READ', to: 'nfse_monitor' }
    ])  as projection on nfse.NotasFiscaisPostLog {
            *,
            status.txtStatus as logTxtStatus
    };

    @readonly
    entity ProcessingStatus @(restrict: [ 
            { grant: 'READ', to: 'nfse_display' },
            { grant: '*'   , to: 'nfse_monitor' }
    ])  as projection on nfse.ProcessingStatus;

    @readonly
    entity NotaFiscalStatus @(restrict: [ 
            { grant: 'READ', to: 'nfse_display' },
            { grant: 'READ', to: 'nfse_monitor' }
    ])  as projection on nfse.NotaFiscalStatus

    @readonly
    entity Companies @(restrict: [ 
            { grant: 'READ', to: 'nfse_display' },
            { grant: 'READ', to: 'nfse_monitor' }
    ])  as projection on nfse.Companies;

    @readonly
    entity Prefectures @(restrict: [ 
            { grant: 'READ', to: 'nfse_display' },
            { grant: 'READ', to: 'nfse_monitor' }
    ])  as projection on nfse.Prefectures;
    
    @readonly
    entity Cities @(restrict: [ 
            { grant: 'READ', to: 'nfse_display' },
            { grant: 'READ', to: 'nfse_monitor' }
    ])  as projection on nfse.Cities;
   
   
    entity NotasFiscais @(restrict: [ 
            { grant: 'READ', to: 'nfse_display' },
            { grant: '*'   , to: 'nfse_monitor' }
    ])  as projection on nfse.NotasFiscais {
        *,
        Log : redirected to NotasFiscaisLog,
        PostLog : redirected to NotasFiscaisPostLog,
        status : redirected to NotaFiscalStatus,
        city : redirected to Cities,
        srvCity : redirected to Cities,
        company : redirected to Companies,
        prefecture : redirected to Prefectures,
        null as level: Integer
    };
    
    type returnMesaage {
        errorStatus: Boolean;
        errorMessage: String;
    }

    //Update status of nota fiscal individual
    action updateNotaFiscalStatusIndividual ( ID: nfse.NotasFiscais:ID, status_nfseStatus: nfse.NotaFiscalStatus:nfseStatus, newStatus: nfse.NotaFiscalStatus:nfseStatus) returns returnMesaage;

    function isKeyUser () returns Boolean;
}


        
