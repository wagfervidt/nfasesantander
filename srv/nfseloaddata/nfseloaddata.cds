using {com.santander.nfse as nfse} from '../../db/schema';


service NfseLoadData  @(requires : ['nfse_admin', 'nfse_jobscheduler']) {
        entity Companies            as projection on nfse.Companies;
        entity CompaniesPrefectures as projection on nfse.CompaniesPrefectures {
                * , companies : redirected to Companies, prefectures : redirected to Prefectures
        };
        entity Prefectures               as projection on nfse.Prefectures;
        entity LayoutPatterns            as projection on nfse.LayoutPatterns;
        entity Mappings                  as projection on nfse.Mappings;
        entity NotasFiscaisScheduleLog   as projection on nfse.NotasFiscaisScheduleLog;
        entity NotasFiscaisReadException as projection on nfse.NotasFiscaisReadException;
        entity NotasFiscaisVendor        as projection on nfse.NotasFiscaisVendor;
        
                                         




        type logsCompanies {
                log: {
                   CNPJ: String;
                   name: String;
                   message: String;
                };
                error: Boolean;
                errorMessage: String;      
        }

        type logsSchedules {
                log: {
                   CNPJ: String;
                   readDate: String;
                   message: String;
                };
                error: Boolean;
                errorMessage: String;
        }

        type logsExeceptions {
                log: {
                   vendor: String;
                   vendorExcName: String;
                   message: String;
                };
                error: Boolean;
                errorMessage: String;
        }

        type logsVendors {
                log: {
                   CNPJ: String;
                   name: String;
                   registration: String;
                   message: String;
                };
                error: Boolean;
                errorMessage: String;
        }
        
        type logsCompanyPrefectures {
                prefectureName: String;
                companyName: String;
                CNPJ: String;
                message: String;
                messageError: Boolean;
        }

        type downloadsTemplates {
                companies: {
                    CNPJ: String;
                    nome: String;
                    CCM: String;
                    certificado: String;
                    descricao: String;
                    cidade: String;
                    UF: String;
                };

                schedule: {
                    CNPJ: String;
                    DataInicio: String;
                };

                exception: {
                    vendor: String;
                    vendorExcName: String;
                    ValidFrom: String;
                    ValidTo:String;
                };

                vendor: {
                    CNPJ: String;
                    nome: String;
                    inscricao: String;
                    cidade: String;
                    UF: String;
                }

        }

        //UPLOAD COMPANIES
        action uploadCompanies(File: LargeString ) returns array of logsCompanies;
        //UPLOAD SCHEDULELOG
        action uploadScheduleLog(File: LargeString ) returns array of logsSchedules;
        //UPLOAD READEXCEPTION
        action uploadReadException(File: LargeString ) returns array of logsExeceptions;  
        //UPLOAD VENDOR
        action uploadVendor(File: LargeString) returns array of logsVendors;     
        //FILL COMPANYPREFECUTRES BY PREFECTURE
        action loadCompanyPrefectures(prefectureName: String) returns array of logsCompanyPrefectures;
        //Download dos templates de carga
        action downloadTemplate(Name: String) returns array of downloadsTemplates;
}
