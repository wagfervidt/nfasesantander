using {com.santander.nfse as nfse} from '../../db/schema';


service CatalogService @(requires : [
    'nfse_monitor',
    'nfse_admin',
    'nfse_jobscheduler',
    'nfse_foreigncall'
]) {

    entity NotasFiscais                    as projection on nfse.NotasFiscais {
        * , Log : redirected to NotasFiscaisLog, PostLog : redirected to NotasFiscaisPostLog, PDFLog : redirected to NotasFiscaisPDFLog
    } actions {
        function getPDF() returns LargeString;
        action postPDF(blobPDF :  LargeBinary);

    };

    entity NotasFiscaisLog                 as projection on nfse.NotasFiscaisLog {
        * , NotaFiscal : redirected to NotasFiscais, oldStatus.txtStatus as oldTxtStatus, newStatus.txtStatus as newTxtStatus
    };

    entity NotasFiscaisPostLog             as projection on nfse.NotasFiscaisPostLog {
        * , notafiscal : redirected to NotasFiscais
    };


    entity NotasFiscaisPDFLog              as projection on nfse.NotasFiscaisPDFLog {
        * , notafiscal : redirected to NotasFiscais
    };

    entity NotasFiscaisScheduleLog         as projection on nfse.NotasFiscaisScheduleLog;

    entity NotasFiscaisErrorLog            as projection on nfse.NotasFiscaisErrorLog;

    entity NFSEScheduleLogDistinct         as


        select
            ID,
            a.company.ID    as company_ID,
            a.prefecture.ID as prefecture_ID,
            a.readDate,
            a.status.status as status,
            a.createdAt     as createdAt
        from nfse.NotasFiscaisScheduleLog as a
        inner join (
            select
                company.ID    as company_ID,
                prefecture.ID as prefecture_ID,
                readDate,
                b.status.status as status,
                max(
                    createdAt
                )             as createdAt
            from nfse.NotasFiscaisScheduleLog as b
            group by
                company.ID,
                prefecture.ID,
                readDate,
                b.status.status 
        ) as latest
            on  a.company.ID    = latest.company_ID
            and a.prefecture.ID = latest.prefecture_ID
            and a.readDate      = latest.readDate
            and a.createdAt     = latest.createdAt
        group by
            ID,
            company.ID,
            prefecture.ID,
            a.readDate,
            a.status.status,
            a.createdAt
        order by
            readDate      desc,
            company_ID    asc,
            prefecture_ID asc,
            ID            asc,
            status        asc;


    entity NotasFiscaisArchiveLogs         as projection on nfse.NotasFiscaisArchiveLog;

    entity NotasFiscaisVendor as projection on nfse.NotasFiscaisVendor;
    //Nfse queries
    action nfseQueries() returns {
        status    : nfse.ProcessingStatus:status;
        txtStatus : nfse.NotasFiscaisScheduleLog:txtStatus
    };

    type pdfs {
        objectID: String;
        base64: String;
    }

    //Nfse Multi PDF
    action getMultiPDF(notasID : String) returns { 
        pdfs: array of pdfs;
        errors: many String
    };
    //Nfse queries not parallel
    action nfseNotParallelPref() returns {};
    //Nfse queries parallel call
    action nfseQueriesParallel(lastDate : DateTime, todayDate : DateTime, companyPrefectureID : UUID) returns {};
    //Nfse queries retries
    action nfseQueriesRetries() returns {};
    //Nfse VIM Post
    action nfsePost(ID : String) returns array of NotasFiscaisPostLog;
    //Nfse VIM Post Parallel
    action nfsePostParallel(ID : String) returns {};
    //Nfse PDF queries
    action nfsePDF(ID : String) returns array of NotasFiscaisPDFLog;
    //Update status of nota fiscal massivelly
    action updateNotaFiscalStatus(Notas : String, Status : nfse.NotaFiscalStatus:nfseStatus);

    type returnMessage {
        errorStatus  : Boolean;
        errorMessage : String;
    }

    //Update status of nota fiscal individual
    action updateNotaFiscalStatusIndividual(ID : nfse.NotasFiscais:ID, status_nfseStatus : nfse.NotaFiscalStatus:nfseStatus, newStatus : nfse.NotaFiscalStatus:nfseStatus) returns returnMessage;

    //Nfse archiving
    action nfseArchive() returns {
        status    : nfse.NotasFiscaisArchiveLog:status.status;
        txtStatus : nfse.NotasFiscaisArchiveLog:txtStatus
    };


    @readonly
    entity Mappings                        as projection on nfse.Mappings;

    @readonly
    entity LayoutPatterns                  as projection on nfse.LayoutPatterns;

    @readonly
    entity Prefectures                     as projection on nfse.Prefectures;

    @readonly
    entity Companies                       as projection on nfse.Companies;

    @readonly
    entity CompaniesPrefectures            as projection on nfse.CompaniesPrefectures {
        * , companies : redirected to Companies
    };

    @readonly
    entity Cities                          as projection on nfse.Cities;

    @readonly
    entity ProcessingStatus                as projection on nfse.ProcessingStatus;

    @readonly
    entity NotasFiscaisReadException       as projection on nfse.NotasFiscaisReadException;

    @readonly
    entity NotasFiscaisReadExceptCompanies as projection on nfse.NotasFiscaisReadExceptCompanies {
        * , company : redirected to Companies, nfseException : redirected to NotasFiscaisReadException
    };

    @readonly
    entity NotasFiscaisTextException       as projection on nfse.NotasFiscaisTextException;

    @readonly
    entity NotaFiscalStatus                as projection on nfse.NotaFiscalStatus;


    @readonly
    entity NotasFiscaisArchives            as projection on nfse.NotasFiscaisArchive;


    @readonly
    entity PostParameters                  as projection on nfse.PostParameters;

    @readonly
    entity NotasFiscaisPostParameters      as projection on nfse.NotasFiscaisPostParameters;

}


////////// ANNOTATIONS  //////////
annotate sap.common.Currencies with @(readonly);
