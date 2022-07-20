using {
    cuid,
    managed,
    sap,
    temporal,
    Currency,
    User
} from '@sap/cds/common';


namespace com.santander.nfse;


// ---------------------------------------------------------------------------
// Nota Fical Status
// ---------------------------------------------------------------------------
// Para possibilitar o fiori elements, transformei para tabela
/*
type nfseStatus : Integer @( title: '{nfseStatus}' ) enum {
      read_error          = 1   @( title: '{read_error}');
      transform_error     = 2   @( title: '{transform_error}');
      canceled            = 3   @( title: '{canceled}');
      excepted            = 4   @( title: '{excepted}');
      pending_info        = 5   @( title: '{pending_info}');
      pending_send        = 6   @( title: '{pending_send}');
      pending_send_cancel = 7   @( title: '{pending_send_cancel}');
      send_error          = 8   @( title: '{send_error}');
      cancel_processed    = 9   @( title: '{cancel_processed}');
      processed          = 10    @( title: '{processed}');
  };
*/
@cds.odata.valuelist
entity NotaFiscalStatus {
    key nfseStatus : Integer not null;
        txtStatus  : localized String;
};

annotate NotaFiscalStatus with @(
    title              : '{i18n>notafiscalstatus}',
    description        : txtStatus,
    UI.TextArrangement : #TextOnly,
    cds.odata.valuelist,
    Common.SemanticKey : [txtStatus],
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : txtStatus
    }]
) {
    nfseStatus @(
        title       : '{i18n>notafiscalstatus}',
        description : '{i18n>notafiscalstatus}',
        Common.Text : {
            $value                 : txtStatus,
            ![@UI.TextArrangement] : #TextOnly
        }
    );

    txtStatus  @(
        title       : '{i18n>notafiscalstatus}',
        description : '{i18n>notafiscalstatus}',
        Common      : {
            FieldControl             : #Mandatory,
            TextFor                  : nfseStatus,
            ValueListWithFixedValues : false,
            ValueList                : {
                CollectionPath : 'NotaFiscalStatus',
                Parameters     : [
                {
                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'nfseStatus',
                    ValueListProperty : 'nfseStatus'
                },
                {
                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'txtStatus',
                    ValueListProperty : 'txtStatus'
                }
                ]
            }
        }
    );
};


// ---------------------------------------------------------------------------
// Processing Status
// ---------------------------------------------------------------------------
// Para possibilitar o fiori elements, transformei para tabela
/*
type processingStatus : Integer @( title: '{processingStatus}' ) enum {
      Error          = 1 @( title: '{error}');
      Canceled       = 2 @( title: '{canceled}');
      Success        = 3 @( title: '{success}');
  };
*/
@cds.odata.valuelist
entity ProcessingStatus {
    key status    : Integer not null;
        txtStatus : localized String;
}

annotate ProcessingStatus with @(
    title              : '{i18n>processingstatus}',
    description        : txtStatus,
    UI.TextArrangement : #TextOnly,
    cds.odata.valuelist,
    Common.SemanticKey : [txtStatus],
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : txtStatus
    }]
) {
    status    @(
        title       : '{i18n>processingstatus}',
        description : '{i18n>processingstatus}',
        Common.Text : {
            $value                 : txtStatus,
            ![@UI.TextArrangement] : #TextOnly
        }
    );

    txtStatus @(
        title       : '{i18n>processingstatus}',
        description : '{i18n>processingstatus}',
        Common      : {
            FieldControl             : #Mandatory,
            TextFor                  : status,
            ValueListWithFixedValues : false,
            ValueList                : {
                CollectionPath : 'ProcessingStatus',
                Parameters     : [
                {
                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'status',
                    ValueListProperty : 'status'
                },
                {
                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'txtStatus',
                    ValueListProperty : 'txtStatus'
                }
                ]
            }
        }
    );
};


// ---------------------------------------------------------------------------
// Post Parameters
// ---------------------------------------------------------------------------
/* Para possibilitar o fiori elements, transformei para tabela
type PostParameters: Integer @( title: '{nfseParam}' ) enum {
      serviceAddress          = 1   @( title: '{serviceaddress}');
      serviceMethod           = 2   @( title: '{servicemethod');
      serviceCertificate      = 3   @( title: '{servicecertificate}');
      serviceXml              = 4   @( title: '{servicexml}');
 };
*/
@cds.odata.valuelist
entity PostParameters {
    key param    : Integer not null;
        txtParam : localized String;
}

annotate PostParameters with @(
    title              : '{i18n>postparameters}',
    description        : txtParam,
    UI.TextArrangement : #TextOnly,
    cds.odata.valuelist,
    Common.SemanticKey : [txtParam],
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : txtParam
    }]
) {
    param    @(
        title       : '{i18n>postparameters}',
        description : '{i18n>postparameters}',
        Common.Text : {
            $value                 : txtParam,
            ![@UI.TextArrangement] : #TextOnly
        }
    );

    txtParam @(
        title       : '{i18n>postparameterstxt}',
        description : '{i18n>postparameterstxt}',
        Common      : {
            FieldControl             : #Mandatory,
            TextFor                  : param,
            ValueListWithFixedValues : false,
            ValueList                : {
                CollectionPath : 'PostParameters',
                Parameters     : [
                {
                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'param',
                    ValueListProperty : 'param'
                },
                {
                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'txtParam',
                    ValueListProperty : 'txtParam'
                }
                ]
            }
        }
    );
};


// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------
entity Companies : cuid, managed {
    companyName    : String not null;
    CNPJ           : String not null;
    CCM            : String;
    homePrefecture : Association to one Prefectures;
    certificate    : String not null;
    description    : localized String not null;
    inactive       : Boolean not null default false;
    prefectures    : Composition of many CompaniesPrefectures
                         on prefectures.companies = $self;
}

annotate Companies with @(
    title              : CNPJ,
    description        : companyName,
    UI.TextArrangement : #TextOnly,
    cds.odata.valuelist,
    Common.SemanticKey : [CNPJ],
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : CNPJ

    }]
) {
    ID             @(
        title       : 'ID',
        description : 'ID',
        Core.Computed,
        Common.Text : {
            $value                 : companyName,
            ![@UI.TextArrangement] : #TextOnly
        }
    );


    CNPJ           @(
        title       : '{i18n>company_CNPJ}',
        description : '{i18n>company_CNPJ}',
        Common      : {
            FieldControl             : #Mandatory
        }
    );
    companyName    @(
        title       : '{i18n>company_name}',
        description : '{i18n>company_name}',
        Common      : {
            FieldControl             : #Mandatory
        }
    );

    CCM            @(
        title       : '{i18n>company_CCM}',
        description : '{i18n>company_CCM}',

    );

    certificate    @(
        title       : '{i18n>company_certificate}',
        description : '{i18n>company_certificate}',
        Common      : {FieldControl : #Mandatory}
    );

    homePrefecture @(
        title       : '{i18n>company_homePrefecture}',
        description : '{i18n>company_homePrefecture}',
        Common      : {
            Text      : {
                $value                 : homePrefecture.prefectureName,
                ![@UI.TextArrangement] : #TextOnly
            },
            ValueList : {
                CollectionPath  : 'Prefectures',
                SearchSupported : true,
                Parameters      : [
                {

                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'homePrefecture_ID',
                    ValueListProperty : 'ID'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'prefectureName'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'description'
                }
                ]
            }
        }
    );

    description    @(
        title            : '{i18n>company_description}',
        description      : '{i18n>company_description}',
        UI.MultiLineText : true,
        Common           : {FieldControl : #Mandatory}
    );

    inactive       @(
        title       : '{i18n>company_inactive}',
        description : '{i18n>company_inactive}',
    );

    prefectures    @(
        title       : '{i18n>company_prefectures}',
        description : '{i18n>company_prefectures}'
    );
};

entity CompaniesPrefectures : cuid {
    companies   : Association to Companies;
    prefectures : Association to Prefectures;
    CCMPrefecture: String not null default '';
}

annotate CompaniesPrefectures with {
    ID          @Core.Computed;
    companies   @(
        Common.Text                     : {
            $value                 : companies.CNPJ,
            ![@UI.TextArrangement] : #TextOnly
        },
        Common.ValueListWithFixedValues : false,
        title                           : '{i18n>company_name}',
        Common.ValueList                : {
            CollectionPath : 'Companies',
            Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : 'companies_ID',
                ValueListProperty : 'ID'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'companyName'
            },
            ]
        }
    );
    prefectures @(
        Common.Text                     : {
            $value                 : prefectures.prefectureName,
            ![@UI.TextArrangement] : #TextOnly
        },
        title                           : '{i18n>company_prefectures}',
        Common.ValueListWithFixedValues : false,
        Common.ValueList                : {
            CollectionPath : 'Prefectures',
            Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : 'prefectures_ID',
                ValueListProperty : 'ID'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'prefectureName'
            },
            ]
        }
    );
    CCMPrefecture @(
        title       : '{i18n>company_ccmprefecture}',
        description : '{i18n>company_ccmprefecture}',  
    );
};


// ---------------------------------------------------------------------------
// Layout Patterns - Nota Fiscal Patterns
// ---------------------------------------------------------------------------
@cds.odata.valuelist
entity LayoutPatterns : cuid, managed {
    layoutpatternName : String not null;
    description       : localized String not null;
    prefectures       : Association to many Prefectures
                            on prefectures.layoutPattern = $self;
}

annotate LayoutPatterns with @(
    title              : '{i18n>layout_singular}',
    description        : layoutpatternName,
    UI.TextArrangement : #TextOnly,
    cds.odata.valuelist,
    Common.SemanticKey : [layoutpatternName],
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : layoutpatternName
    }]
) {
    ID                @(
        Core.Computed,
        Common.Text : {
            $value                 : layoutpatternName,
            ![@UI.TextArrangement] : #TextOnly
        }
    );

    layoutpatternName @(
        title       : '{i18n>layout_pattern_name}',
        description : '{i18n>layout_pattern_name}',
        Common      : {
            FieldControl             : #Mandatory,   
        }
    );

    /*layoutpatternName @(
        title       : '{i18n>layout_pattern_name}',
        description : '{i18n>layout_pattern_description}',
        Common      : {
            FieldControl             : #Mandatory,
            TextFor                  : ID,
            ValueListWithFixedValues : false,
            ValueList                : {
                CollectionPath : 'LayoutPatterns',
                Parameters     : [{
                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'layoutpatternName',
                    ValueListProperty : 'layoutpatternName'
                }]
            }
        }
    );*/
    description       @(
        title            : '{i18n>layout_pattern_description}',
        description      : '{i18n>layout_pattern_description}',
        UI.MultiLineText : true,
        Common           : {FieldControl : #Mandatory}
    );
};


// ---------------------------------------------------------------------------
// Mappings - Nota Fiscal Prefectures
// ---------------------------------------------------------------------------
//@cds.odata.valuelist
entity Prefectures : managed, cuid {
    prefectureName : String not null;
    layoutPattern  : Association to LayoutPatterns not null;
    mapping        : Association to Mappings not null;
    serviceAddress : String not null;
    serviceMethod  : String not null;
    altWSDL        : String;
    searchVendor   : Boolean not null default false;
    onePage        : Boolean not null default false;
    searchD1       : Boolean not null default false;
    methodPDF      : String;
    description    : localized String not null;
    requireCCM     : Boolean not null default false;
    inactive       : Boolean not null default false;
    securityOption : String default 'TLSv1_method';
    queryParallel  : Boolean not null default true;
    referenceLength: Integer default null;
    WSBetha        : Boolean not null default false;
}

annotate Prefectures with @(
    title              : '{i18n>prefecture_singular}',
    description        : prefectureName,
    UI.TextArrangement : #TextOnly,
    cds.odata.valuelist,
    Common.SemanticKey : [prefectureName],
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : prefectureName
    }]
) {
    ID             @(
        title       : 'ID',
        Core.Computed,
        Common      : {
            FieldControl: #Mandatory,
        }
    );

    prefectureName @(
        title       : '{i18n>prefecture_name}',
        description : '{i18n>prefecture_name}',
        Common.Text : {
            $value                 : prefectureName,
            ![@UI.TextArrangement] : #TextOnly
        }
    );

    layoutPattern  @(
        title       : '{i18n>prefecture_layout}',
        description : '{i18n>prefecture_layout}',
        Common      : {
            FieldControl : #Mandatory,
            Text         : {
                $value                 : layoutPattern.layoutpatternName,
                ![@UI.TextArrangement] : #TextOnly
            },
            ValueList    : {
                CollectionPath  : 'LayoutPatterns',
                SearchSupported : true,
                Parameters      : [
                {

                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'layoutPattern_ID',
                    ValueListProperty : 'ID'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'layoutpatternName'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'description'
                }
                ]
            }
        }
    );
    mapping        @(
        title       : '{i18n>prefecture_mapping}',
        description : '{i18n>prefecture_mapping}',
        Common      : {
            FieldControl : #Mandatory,
            Text         : {
                $value                 : mapping.mappingName,
                ![@UI.TextArrangement] : #TextOnly
            },
            ValueList    : {
                CollectionPath  : 'Mappings',
                SearchSupported : true,
                Parameters      : [
                {
                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'mapping_ID',
                    ValueListProperty : 'ID'

                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'mappingName'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'description'
                }
                ]
            }
        }
    );

    serviceAddress @(
        title       : '{i18n>prefecture_service_address}',
        description : '{i18n>prefecture_service_address}',
        Common      : {FieldControl : #Mandatory}
    );

    serviceMethod  @(
        title       : '{i18n>prefecture_service_method}',
        description : '{i18n>prefecture_service_method}',
        Common      : {FieldControl : #Mandatory}
    );

    altWSDL        @(
        title       : '{i18n>prefecture_altWSDL}',
        description : '{i18n>prefecture_altWSDL}',
    );

    searchVendor   @(
        title       : '{i18n>prefecture_searchVendor}',
        description : '{i18n>prefecture_searchVendor}',
    );

    onePage @(
        title       : '{i18n>prefecture_onePage}',
        description : '{i18n>prefecture_onePage}',
    );

    searchD1 @(
        title       : '{i18n>prefecture_searchD1}',
        description : '{i18n>prefecture_searchD1}',
    );
    
    methodPDF @(
        title       : '{i18n>prefecture_methodPDF}',
        description : '{i18n>prefecture_methodPDF}',
    );
    description    @(
        title            : '{i18n>prefecture_description}',
        description      : '{i18n>prefecture_description}',
        UI.MultiLineText : true,
        Common           : {FieldControl : #Mandatory}
    );
    requireCCM      @(
        title            : '{i18n>prefecture_requireCCM}',
        description      : '{i18n>prefecture_requireCCM}',
        Common           : {FieldControl : #Mandatory}
    );
    inactive       @(
        title       : '{i18n>prefecture_inactive}',
        description : '{i18n>prefecture_inactive}',
    );
    securityOption  @(
        title       : '{i18n>prefecture_security}',
        description : '{i18n>prefecture_security}',
    );
    queryParallel  @(
        title       : '{i18n>query_parallel}',
        description : '{i18n>query_parallel}',
    );
    referenceLength  @(
        title       : '{i18n>referenceLength}',
        description : '{i18n>referenceLength}',
    );
};


// ---------------------------------------------------------------------------
// Mappings - Nota Fiscal Mappings
// ---------------------------------------------------------------------------
@cds.odata.valuelist
entity Mappings : cuid, managed {
    mappingName     : String not null;
    description     : localized String not null;
    signatureField  : String;
    requestWrapper  : LargeString;
    transfXMLReq    : Boolean not null default false;
    requestXSLT     : LargeString;
    requestXSLTSEF  : LargeString;
    transfXMLResp   : Boolean not null default false;
    responseXSLT    : LargeString;
    responseXSLTSEF : LargeString;
    responseTag     : String;
    errorAttr       : String;
}

annotate Mappings with @(
    title              : '{i18n>mapping_singular}',
    description        : mappingName,
    UI.TextArrangement : #TextOnly,
    cds.odata.valuelist,
    Common.SemanticKey : [mappingName],
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : mappingName

    }]
) {
    ID             @(
        Core.Computed,
        Common.Text : {
            $value                 : mappingName,
            ![@UI.TextArrangement] : #TextOnly
        }
    );

    mappingName    @(
        title       : '{i18n>mapping_name}',
        description : '{i18n>mapping_name}',
        Common      : {
            FieldControl             : #Mandatory,
        }
    );

    description    @(
        title            : '{i18n>mapping_description}',
        description      : '{i18n>mapping_description}',
        UI.MultiLineText : true,
        Common           : {FieldControl : #Mandatory}
    );
    requestWrapper @(
        title            : '{i18n>mapping_requestWrapper}',
        description      : '{i18n>mapping_requestWrapper}',
        UI.MultiLineText : true
    );

    transfXMLReq   @(
        title       : '{i18n>mapping_transfXMLReq}',
        description : '{i18n>mapping_transfXMLReq}',

    );

    requestXSLT    @(
        title            : '{i18n>mapping_requestXSLT}',
        description      : '{i18n>mapping_requestXSLT}',
        UI.MultiLineText : true
    );
    requestXSLTSEF   @(
        title            : '{i18n>mapping_requestXSLT}',
        description      : '{i18n>mapping_requestXSLT}',
    );
    transfXMLResp  @(
        title       : '{i18n>mapping_transfXMLResp}',
        description : '{i18n>mapping_transfXMLResp}',

    );

    responseXSLT   @(
        title            : '{i18n>mapping_responseXSLT}',
        description      : '{i18n>mapping_responseXSLT}',
        UI.MultiLineText : true
    );
    responseXSLTSEF @(
        title            : '{i18n>mapping_responseXSLT}',
        description      : '{i18n>mapping_responseXSLT}',
    );
    content        @(
        title            : '{i18n>mapping_content}',
        description      : '{i18n>mapping_content}',
        UI.MultiLineText : true
    );

    signatureField @(
        title       : '{i18n>mapping_signature}',
        description : '{i18n>mapping_signature}'
    );
    responseTag    @(
        title       : '{i18n>mapping_responseTag}',
        description : '{i18n>mapping_responseTag}'
    );
    errorAttr    @(
        title       : '{i18n>mapping_errorAttr}',
        description : '{i18n>mapping_errorAttr}'
    );
};


// ---------------------------------------------------------------------------
// Cities
// ---------------------------------------------------------------------------
entity Cities {
    key cityCode : String(7);
        cityName : String(50);
        cityNameNoAccents : String(50);
}

annotate Cities with @(
    title              : cityName,
    description        : cityName,
    UI.TextArrangement : #TextOnly,
    cds.odata.valuelist,
    Common.SemanticKey : [cityCode],
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : cityName
    }]
) {
    cityCode @(
        title       : '{i18n>nfse_cityCode}',
        description : '{i18n>nfse_cityCode}'
    //Common.Text : {
    //    $value                 : cityName,
    //    ![@UI.TextArrangement] : #TextOnly
    //}
    );
    cityName @(
        title       : '{i18n>nfse_cityName}',
        description : '{i18n>nfse_cityName}',
        Common      : {
            FieldControl             : #Mandatory,
            TextFor                  : cityCode,
            ValueListWithFixedValues : false,
            ValueList                : {
                CollectionPath : 'Cities',
                Parameters     : [{
                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'cityName',
                    ValueListProperty : 'cityName'
                }]
            }
        }
    );
    cityNameNoAccents @(
        title       : '{i18n>cityNameNoAccents}',
        description : '{i18n>cityNameNoAccents}'
    //Common.Text : {
    //    $value                 : cityName,
    //    ![@UI.TextArrangement] : #TextOnly
    //}
    )
}

// ---------------------------------------------------------------------------
// Notas Fiscais
// ---------------------------------------------------------------------------
entity NotasFiscais : cuid, managed {
    company            : Association to one Companies;
    prefecture         : Association to one Prefectures;
    vendor             : String not null;
    vendorCCM          : String not null;
    nfseNo             : String not null;
    docDate            : DateTime not null;
    cancelDate         : DateTime;
    lastDate           : Date;
    postDate           : DateTime;
    nfseSubst          : String;
    upPDF              : Boolean not null default false;
    upPDFDate          : DateTime;
    upPDFDateCall      : DateTime;
    upPDFStatus        : Integer default null;
    upPDFStatusMsg     : LargeString;
    veriCode           : String;
    signature          : String;
    vendorName         : String;
    barcode            : String;
    reference          : String;
    simpleTax          : Boolean;
    serviceCode        : Integer;
    serviceDescription : String;
    totalAmount        : Decimal;
    totalDeductions    : Decimal;
    netAmount          : Decimal;
    totalPIS           : Decimal;
    totalCOFINS        : Decimal;
    totalINSS          : Decimal;
    totalIR            : Decimal;
    totalCSLL          : Decimal;
    totalISS           : Decimal;
    retISS             : Boolean;
    totalOtherRet      : Decimal;
    totalCredit        : Decimal;
    rateTax            : Decimal;
    totalTax           : Decimal;
    percentTax         : Decimal;
    descUnconditioned  : Decimal;
    descConditioned    : Decimal;
    artCode            : String;
    currency           : Currency;
    ceiCode            : String;
    constructionID     : String;
    city               : Association to one Cities;
    companyCity        : Association to one Cities;
    totalReceipt       : Decimal;
    broker             : String;
    brokerISS          : Decimal;
    srvDate            : Date;
    srvAmount          : Decimal;
    srvAccount         : String(10);
    srvCostCenter      : String(10);
    srvPO              : String(10);
    srvPOItem          : String(5);
    srvDueDate         : Date;
    srvBank            : String(3);
    srvBankAgency      : String(5);
    srvBankAccount     : String(10);
    srvContact         : String(100);
    srvArea            : String(100);
    srvDelivery        : String(10);
    srvMatDoc          : String(10);
    srvMatDocItem      : String(4);
    srvCity            : Association to one Cities;
    nfseStatus         : String;
    nfseXML            : LargeString;
    Log                : Composition of many NotasFiscaisLog
                             on Log.NotaFiscal = $self;
    PostLog            : Composition of many NotasFiscaisPostLog
                             on PostLog.notafiscal = $self;
    PDFLog            : Composition of many NotasFiscaisPDFLog
                             on PDFLog.notafiscal = $self;
    status             : Association to one NotaFiscalStatus;

};

annotate NotasFiscais with @(
    title              : vendor,
    description        : vendorName,
    UI.TextArrangement : #TextOnly,
    cds.odata.valuelist,
    Common.SemanticKey : [
    company_ID,
    prefecture_ID,
    vendor,
    vendorCCM,
    nfseNo
    ],
    UI.Identification  : [
    {
        $Type : 'UI.DataField',
        Value : company_ID
    },
    {
        $Type : 'UI.DataField',
        Value : prefecture_ID
    },
    {
        $Type : 'UI.DataField',
        Value : vendor
    },
    {
        $Type : 'UI.DataField',
        Value : vendorCCM
    },
    {
        $Type : 'UI.DataField',
        Value : nfseNo
    }
    ]
) {
    ID                 @(
        Core.Computed,
        title       : '{i18n>nfse_ID}',
        description : '{i18n>nfse_ID}',
    /*
    Common.Text : {

        $value                 : company_ID && prefecture_ID && vendor && vendorCCM && nfseNo ,
        ![@UI.TextArrangement] : #TextOnly
    }
    */
    );

    company            @(
        title       : '{i18n>nfse_company}',
        description : '{i18n>nfse_company}',
        Common      : {
            Text      : {
                $value                 : company.companyName,
                ![@UI.TextArrangement] : #TextOnly
            },
            ValueList : {
                CollectionPath  : 'Companies',
                SearchSupported : true,
                Parameters      : [
                {

                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'company_ID',
                    ValueListProperty : 'ID'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'companyName'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'description'
                }
                ]
            }
        }
    );
    prefecture         @(
        title       : '{i18n>nfse_prefecture}',
        description : '{i18n>nfse_prefecture}',
        Common      : {
            Text      : {
                $value                 : prefecture.prefectureName,
                ![@UI.TextArrangement] : #TextOnly
            },
            ValueList : {
                CollectionPath  : 'Prefectures',
                SearchSupported : true,
                Parameters      : [
                {

                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'prefecture_ID',
                    ValueListProperty : 'ID'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'prefectureName'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'description'
                }
                ]
            }
        }
    );
    vendor             @(
        title       : '{i18n>nfse_vendor}',
        description : '{i18n>nfse_vendor}',
        Common      : {FieldControl : #Mandatory}
    );
    vendorCCM          @(
        title       : '{i18n>nfse_vendorCCM}',
        description : '{i18n>nfse_vendorCCM}',
        Common      : {FieldControl : #Mandatory}
    );

    nfseNo             @(
        title       : '{i18n>nfse_nfseNo}',
        description : '{i18n>nfse_nfseNo}',
        Common      : {FieldControl : #Mandatory}
    );
    docDate            @(
        title       : '{i18n>nfse_docDate}',
        description : '{i18n>nfse_docDate}',
        Common      : {FieldControl : #Mandatory}
    );
    cancelDate         @(
        title       : '{i18n>nfse_cancelDate}',
        description : '{i18n>nfse_cancelDate}',
    );
    lastDate         @(
        title       : '{i18n>nfse_lastDate}',
        description : '{i18n>nfse_lastDate}',
    );   
    postDate         @(
        title       : '{i18n>nfse_postDate}',
        description : '{i18n>nfse_postDate}',
    );   
    nfseSubst        @(
        title       : '{i18n>nfse_nfseSubst}',
        description : '{i18n>nfse_nfseSubst}',
    );
    upPDF            @(
        title       : '{i18n>nfse_nfseupPDF}',
        description : '{i18n>nfse_nfseupPDF}',
    );
    upPDFDate @(
        title       : '{i18n>nfse_upPDFDate}',
        description : '{i18n>nfse_upPDFDate}',
    );
    upPDFStatus    @(
        title       : '{i18n>nfse_upPDFStatus}',
        description : '{i18n>nfse_upPDFStatus}',
    );     
    upPDFStatusMsg  @(
        title       : '{i18n>nfse_upPDFStatusMsg}',
        description : '{i18n>nfse_upPDFStatusMsg}',
    );    
    veriCode           @(
        title       : '{i18n>nfse_veriCode}',
        description : '{i18n>nfse_veriCode}',
    );
    signature          @(
        title       : '{i18n>nfse_signature}',
        description : '{i18n>nfse_signature}',
    );
    vendorName         @(
        title       : '{i18n>nfse_vendorName}',
        description : '{i18n>nfse_vendorName}',
    );
    barcode            @(
        title       : '{i18n>nfse_barCode}',
        description : '{i18n>nfse_barCode}',
    );
    reference          @(
        title       : '{i18n>nfse_reference}',
        description : '{i18n>nfse_reference}',
    );
    simpleTax          @(
        title       : '{i18n>nfse_simpleTax}',
        description : '{i18n>nfse_simpleTax}',
    );
    serviceCode        @(
        title       : '{i18n>nfse_serviceCode}',
        description : '{i18n>nfse_serviceCode}',
    );
    serviceDescription @(
        title            : '{i18n>nfse_serviceDescription}',
        description      : '{i18n>nfse_serviceDescription}',
        UI.MultiLineText : true
    );
    totalAmount        @(
        title       : '{i18n>nfse_totalAmount}',
        description : '{i18n>nfse_totalAmount}',
    );
    totalDeductions    @(
        title       : '{i18n>nfse_totalDeductions}',
        description : '{i18n>nfse_totalDeductions}',
    );
    netAmount          @(
        title       : '{i18n>nfse_netAmount}',
        description : '{i18n>nfse_netAmount}',
    );
    totalPIS           @(
        title       : '{i18n>nfse_totalPIS}',
        description : '{i18n>nfse_totalPIS}',
    );
    totalCOFINS        @(
        title       : '{i18n>nfse_totalCOFINS}',
        description : '{i18n>nfse_totalCOFINS}',
    );
    totalINSS          @(
        title       : '{i18n>nfse_totalINSS}',
        description : '{i18n>nfse_totalINSS}',
    );
    totalIR            @(
        title       : '{i18n>nfse_totalIR}',
        description : '{i18n>nfse_totalIR}',
    );
    totalCSLL          @(
        title       : '{i18n>nfse_totalCSLL}',
        description : '{i18n>nfse_totalCSLL}',
    );
    totalISS           @(
        title       : '{i18n>nfse_totalISS}',
        description : '{i18n>nfse_totalISS}',
    );
    retISS             @(
        title       : '{i18n>nfse_retISS}',
        description : '{i18n>nfse_retISS}',
    );
    totalCredit        @(
        title       : '{i18n>nfse_totalCredit}',
        description : '{i18n>nfse_totalCredit}',
    );
    rateTax            @(
        title       : '{i18n>nfse_rateTax}',
        description : '{i18n>nfse_rateTax}',
    );
    totalOtherRet      @(
        title       : '{i18n>nfse_totalOtherRet}',
        description : '{i18n>nfse_totalOtherRet}',
    );
    totalTax           @(
        title       : '{i18n>nfse_totalTax}',
        description : '{i18n>nfse_totalTax}',
    );
    percentTax         @(
        title       : '{i18n>nfse_percentTax}',
        description : '{i18n>nfse_percentTax}',
    );
    descConditioned    @(
        title       : '{i18n>nfse_descConditioned}',
        description : '{i18n>nfse_descConditioned}',
    );
    descUnconditioned  @(
        title       : '{i18n>nfse_descUnconditioned}',
        description : '{i18n>nfse_descUnconditioned}',
    );
    artCode            @(
        title       : '{i18n>nfse_artCode}',
        description : '{i18n>nfse_artCode}',
    );
    currency           @(
        title       : '{i18n>nfse_currency}',
        description : '{i18n>nfse_currency}',
    );
    ceiCode            @(
        title       : '{i18n>nfse_ceiCode}',
        description : '{i18n>nfse_ceiCode}',
    );
    constructionID     @(
        title       : '{i18n>nfse_constructionID}',
        description : '{i18n>nfse_constructionID}',
    );
    city               @(
        title       : '{i18n>nfse_city}',
        description : '{i18n>nfse_city}',
        Common      : {
            Text      : {
                $value                 : city.cityName,
                ![@UI.TextArrangement] : #TextOnly
            },
            ValueList : {
                CollectionPath  : 'Prefectures',
                SearchSupported : true,
                Parameters      : [
                {

                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'city_cityCode',
                    ValueListProperty : 'cityCode'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'cityName'
                }
                ]
            }
        }
    );
    totalReceipt       @(
        title       : '{i18n>nfse_totalReceipt}',
        description : '{i18n>nfse_totalReceipt}',
    );
    broker             @(
        title       : '{i18n>nfse_broker}',
        description : '{i18n>nfse_broker}',
    );
    brokerISS          @(
        title       : '{i18n>nfse_brokerISS}',
        description : '{i18n>nfse_brokerISS}',
    );
    srvDate            @(
        title       : '{i18n>nfse_srvDate}',
        description : '{i18n>nfse_srvDate}',
    );
    srvAmount          @(
        title       : '{i18n>nfse_srvAmount}',
        description : '{i18n>nfse_srvAmount}',
    );
    srvAccount         @(
        title       : '{i18n>nfse_srvAccount}',
        description : '{i18n>nfse_srvAccount}',
    );
    srvCostCenter      @(
        title       : '{i18n>nfse_srvCostCenter}',
        description : '{i18n>nfse_srvCostCenter}',
    );
    srvPO              @(
        title       : '{i18n>nfse_srvPO}',
        description : '{i18n>nfse_srvPO}',
    );
    srvPOItem          @(
        title       : '{i18n>nfse_srvPOItem}',
        description : '{i18n>nfse_srvPOItem}',
    );
    srvDueDate         @(
        title       : '{i18n>nfse_srvDueDate}',
        description : '{i18n>nfse_srvDueDate}',
    );
    srvBank            @(
        title       : '{i18n>nfse_srvBank}',
        description : '{i18n>nfse_srvBank}',
    );
    srvBankAgency      @(
        title       : '{i18n>nfse_srvBankAgency}',
        description : '{i18n>nfse_srvBankAgency}',
    );
    srvBankAccount     @(
        title       : '{i18n>nfse_srvBankAccount}',
        description : '{i18n>nfse_srvBankAccount}',
    );
    srvContact         @(
        title       : '{i18n>nfse_srvContact}',
        description : '{i18n>nfse_srvContact}',
    );
    srvArea            @(
        title       : '{i18n>nfse_srvArea}',
        description : '{i18n>nfse_srvArea}',
    );
    srvDelivery        @(
        title       : '{i18n>nfse_srvDelivery}',
        description : '{i18n>nfse_srvDelivery}',
    );
    srvMatDoc          @(
        title       : '{i18n>nfse_srvMatDoc}',
        description : '{i18n>nfse_srvMatDoc}',
    );
    srvMatDocItem      @(
        title       : '{i18n>nfse_srvMatDocItem}',
        description : '{i18n>nfse_srvMatDocItem}',
    );
    srvCity            @(
        title       : '{i18n>nfse_srvcity}',
        description : '{i18n>nfse_srvcity}',
        Common      : {
            Text      : {
                $value                 : srvCity.cityName,
                ![@UI.TextArrangement] : #TextOnly
            },
            ValueList : {
                CollectionPath  : 'Prefectures',
                SearchSupported : true,
                Parameters      : [
                {
                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'city_cityCode',
                    ValueListProperty : 'cityCode'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'cityName'
                }
                ]
            }
        }
    );
    nfseXML            @(
        title       : '{i18n>nfse_nfseXML}',
        description : '{i18n>nfse_nfseXML}',
    );
    nfseStatus         @(
        title       : '{i18n>nfse_nfseStatus}',
        description : '{i18n>nfse_nfseStatus}',
    );
    Log                @(
        title       : '{i18n>nfse_log}',
        description : '{i18n>nfse_log}',
    );
    PostLog            @(
        title       : '{i18n>nfse_postlog}',
        description : '{i18n>nfse_postlog}',
    );
    PDFLog            @(
        title       : '{i18n>nfse_pdflog}',
        description : '{i18n>nfse_pdflog}',
    );    
    status             @(
        title       : '{i18n>nfse_status}',
        description : '{i18n>nfse_status}',
    );
};


// ---------------------------------------------------------------------------
// Notas Fiscais Count View
// ---------------------------------------------------------------------------
/*define view  NotasFiscaisCount as
    select from NotasFiscais {
        COUNT(CASE WHEN status.nfseStatus = 1  THEN 1 ELSE NULL END) as![read_error]          : Integer  @( title: '{read_error}'),
        COUNT(CASE WHEN status.nfseStatus = 2  THEN 1 ELSE NULL END) as![transform_error]     : Integer  @( title: '{transform_error}'),
        COUNT(CASE WHEN status.nfseStatus = 3  THEN 1 ELSE NULL END) as![canceled]            : Integer  @( title: '{canceled}'),
        COUNT(CASE WHEN status.nfseStatus = 4  THEN 1 ELSE NULL END) as![excepted]            : Integer  @( title: '{excepted}'),
        COUNT(CASE WHEN status.nfseStatus = 5  THEN 1 ELSE NULL END) as![pending_info]        : Integer  @( title: '{pending_info}'),
        COUNT(CASE WHEN status.nfseStatus = 6  THEN 1 ELSE NULL END) as![pending_send]        : Integer  @( title: '{pending_send}'),
        COUNT(CASE WHEN status.nfseStatus = 7  THEN 1 ELSE NULL END) as![pending_send_cancel] : Integer  @( title: '{pending_send_cancel}'),
        COUNT(CASE WHEN status.nfseStatus = 8  THEN 1 ELSE NULL END) as![send_error]          : Integer  @( title: '{send_error}'),
        COUNT(CASE WHEN status.nfseStatus = 9  THEN 1 ELSE NULL END) as![cancel_processed]    : Integer  @( title: '{cancel_processed}'),
        COUNT(CASE WHEN status.nfseStatus = 10 THEN 1 ELSE NULL END) as![processed]           : Integer  @( title: '{processed}'),
        COUNT(CASE WHEN status.nfseStatus = 5 THEN 1
                WHEN status.nfseStatus = 6 THEN 1
                WHEN status.nfseStatus = 7 THEN 1
                WHEN status.nfseStatus = 8 THEN 1
                ELSE NULL END ) as![pend_all]                                                 : Integer  @( title: '{pend_all}')
    };
*/

// ---------------------------------------------------------------------------
// Notas Fiscais Log
// ---------------------------------------------------------------------------
entity NotasFiscaisLog : cuid {
    NotaFiscal : Association to NotasFiscais;
    oldStatus  : Association to one NotaFiscalStatus;
    newStatus  : Association to one NotaFiscalStatus;
    createdAt  : Timestamp @readonly  @cds.on.insert : $now;
    createdBy  : User      @readonly  @cds.on.insert : $user;
}

annotate NotasFiscaisLog with {
    ID         @Core.Computed;
    NotaFiscal @(
        Common.ValueListWithFixedValues : false,
        title                           : '{i18n>nfse_notaFiscal}',
        Common.ValueList                : {
            CollectionPath : 'NotasFiscais',
            Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : 'NotaFiscal_ID',
                ValueListProperty : 'ID'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'vendorName'
            },
            ]
        }
    );
    oldStatus  @(
        title                           : '{i18n>nfse_oldStatus}',
        description                     : '{i18n>nfse_oldStatus}',
        Common.ValueListWithFixedValues : true
    );
    newStatus  @(
        title                           : '{i18n>nfse_newStatus}',
        description                     : '{i18n>nfse_newStatus}',
        Common.ValueListWithFixedValues : true
    );
    createdAt  @title : '{i18n>CreatedAt}';
    createdBy  @title : '{i18n>CreatedBy}';
}


// ---------------------------------------------------------------------------
// Notas fiscais reading processing schedule log
// ---------------------------------------------------------------------------
entity NotasFiscaisScheduleLog : cuid, managed {
    company    : Association to one Companies;
    prefecture : Association to one Prefectures;
    readDate   : Date;
    status     : Association to one ProcessingStatus;
    txtStatus  : LargeString;
    CCMPrefecture: String;
}

annotate NotasFiscaisScheduleLog with @(
    title              : company.companyName,
    description        : prefecture.prefectureName,
    UI.TextArrangement : #TextOnly,
    cds.odata.valuelist,
    Common.SemanticKey : [
    company_ID,
    prefecture_ID
    ],
    UI.Identification  : [
    {
        $Type : 'UI.DataField',
        Value : company_ID
    },
    {
        $Type : 'UI.DataField',
        Value : prefecture_ID
    },
    ]
) {
    ID         @(Core.Computed,
                                /*
                                Common.Text : {

                                    $value                 : company_ID && prefecture_ID && vendor && vendorCCM && nfseNo ,
                                    ![@UI.TextArrangement] : #TextOnly
                                }
                                */
               );

    company    @(
        title       : '{i18n>nfse_company}',
        description : '{i18n>nfse_company}',
        Common      : {
            Text      : {
                $value                 : company.companyName,
                ![@UI.TextArrangement] : #TextOnly
            },
            ValueList : {
                CollectionPath  : 'Companies',
                SearchSupported : true,
                Parameters      : [
                {

                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'company_ID',
                    ValueListProperty : 'ID'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'companyName'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'description'
                }
                ]
            }
        }
    );
    prefecture @(
        title       : '{i18n>nfse_prefecture}',
        description : '{i18n>nfse_prefecture}',
        Common      : {
            Text      : {
                $value                 : prefecture.prefectureName,
                ![@UI.TextArrangement] : #TextOnly
            },
            ValueList : {
                CollectionPath  : 'Prefectures',
                SearchSupported : true,
                Parameters      : [
                {

                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'prefecture_ID',
                    ValueListProperty : 'ID'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'prefectureName'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'description'
                }
                ]
            }
        }
    );
    readDate   @(
        title       : '{i18n>nfse_readDate}',
        description : '{i18n>nfse_readDate}',
    );
    status     @(
        title       : '{i18n>nfse_processingStatus}',
        description : '{i18n>nfse_processingStatus}',
        ValueList   : {
            CollectionPath  : 'ProcessingStatus',
            SearchSupported : true,
            Parameters      : [{
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : 'status_status',
                ValueListProperty : 'status'
            }]
        }

    );
    txtStatus  @(
        title            : '{i18n>nfse_txtStatus}',
        description      : '{i18n>nfse_txtStatus}',
        UI.MultiLineText : true
    );
    CCMPrefecture @(
        title       : '{i18n>company_ccmprefecture}',
        description : '{i18n>company_ccmprefecture}',  
    );
}

// ---------------------------------------------------------------------------
// Notas fiscais reading exceptions
// ---------------------------------------------------------------------------
entity NotasFiscaisReadException : cuid, managed {
    vendor        : String not null @assert.unique;
    vendorExcName : String not null; //Vendor name para não repetir o nome dos campos em entidades diferentes
    validFrom     : Timestamp not null;
    validTo       : Timestamp       @cds.valid.to;
    companies     : Composition of many NotasFiscaisReadExceptCompanies
                        on companies.nfseException = $self;
}

annotate NotasFiscaisReadException with @(
    title              : '{i18n>nfse_NotasFiscaisReadException}',
    UI.TextArrangement : #TextOnly,
    cds.odata.valuelist,
    Common.SemanticKey : [vendor],
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : vendor
    }, ]
) {
    ID            @Core.Computed;
    vendor        @(
        title       : '{i18n>nfse_vendor}',
        description : '{i18n>nfse_vendor}',
        Common      : {FieldControl : #Mandatory}
    );
    vendorExcName @(
        title       : '{i18n>nfse_vendorName}',
        description : '{i18n>nfse_vendorName}',
        Common      : {FieldControl : #Mandatory}
    );
    companies     @(
        title       : '{i18n>nfse_company}',
        description : '{i18n>nfse_company}'
    );
    validFrom     @(
        title       : '{i18n>ValidFrom}',
        description : '{i18n>ValidFrom}',
    );
    validTo       @(
        title       : '{i18n>ValidTo}',
        description : '{i18n>ValidTo}',
    );
}

// ---------------------------------------------------------------------------
// Notas fiscais reading exceptions Companies
// ---------------------------------------------------------------------------
entity NotasFiscaisReadExceptCompanies : cuid {
    nfseException : Association to NotasFiscaisReadException;
    company       : Association to Companies;
}

annotate NotasFiscaisReadExceptCompanies with {
    ID            @Core.Computed;
    nfseException @(
        Common.Text                     : {
            $value                 : nfseException.vendor,
            ![@UI.TextArrangement] : #TextOnly
        },
        Common.ValueListWithFixedValues : false,
        title                           : '{i18n>company_CNPJ}',
        Common.ValueList                : {
            CollectionPath : 'NFSEExceptions',
            Parameters     : [{
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : 'nfseException_ID',
                ValueListProperty : 'ID'
            }]
        }
    );

    company       @(
        Common.Text                     : {
            $value                 : company.CNPJ,
            ![@UI.TextArrangement] : #TextOnly
        },
        title                           : '{i18n>company_CNPJ}',
        Common.ValueListWithFixedValues : false,
        Common.ValueList                : {
            CollectionPath : 'Companies',
            Parameters     : [
            {
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : 'company_ID',
                ValueListProperty : 'ID'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'companyName'
            },
            {
                $Type             : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'inactive'
            },
            ]
        }

    );
}


// ---------------------------------------------------------------------------
// Notas fiscais Text exceptions
// ---------------------------------------------------------------------------
entity NotasFiscaisTextException : cuid, managed {
    txtException  : String not null @assert.unique;
    validFrom     : Timestamp not null;
    validTo       : Timestamp       @cds.valid.to;
}

annotate NotasFiscaisTextException with @(
    title              : '{i18n>nfse_NotasFiscaisTextException}',
    UI.TextArrangement : #TextOnly,
    cds.odata.valuelist,
    Common.SemanticKey : [txtException],
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : txtException
    }, ]
) {
    ID            @Core.Computed;
    txtException        @(
        title       : '{i18n>nfse_txtexception}',
        description : '{i18n>nfse_txtexception}',
        //Common      : {FieldControl : #Mandatory}
    );
    validFrom     @(
        title       : '{i18n>ValidFrom}',
        description : '{i18n>ValidFrom}',
    );
    validTo       @(
        title       : '{i18n>ValidTo}',
        description : '{i18n>ValidTo}',
    );
}




// ---------------------------------------------------------------------------
// Notas fiscais Post Parameters
// ---------------------------------------------------------------------------
entity NotasFiscaisPostParameters : cuid, managed {
    paramCode  : Association to one PostParameters not null @assert.unique;
    paramValue : LargeString not null;
}


annotate NotasFiscaisPostParameters with @(
    title              : '{i18n>nfse_postparameters}',
    description        : '{i18n>nfse_postparameters}',
    UI.TextArrangement : #TextOnly,
    cds.odata.valuelist,
    Common.SemanticKey : [ID],
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : paramCode_param
    }]
) {
    ID         @Core.Computed;
    paramCode  @(
        title       : '{i18n>nfsepostparameters_paramcode}',
        description : '{i18n>nfsepostparameters_paramcode}',
        Common      : {
            FieldControl : #Mandatory,
            Text         : {$value : paramCode.txtParam, },
            ValueList    : {
                CollectionPath  : 'PostParameters',
                SearchSupported : true,
                Parameters      : [{
                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'paramCode_param',
                    ValueListProperty : 'param'
                }]
            }
        }
    );
    paramValue @(
        title            : '{i18n>nfsepostparameters_paramvalue}',
        description      : '{i18n>nfsepostparameters_paramvalue}',
        UI.MultiLineText : true
    )
}


// ---------------------------------------------------------------------------
// Notas fiscais Post Log
// ---------------------------------------------------------------------------
entity NotasFiscaisPostLog : cuid, managed {
    status     : Association to one ProcessingStatus not null;
    notafiscal : Association to one NotasFiscais;
    txtStatus  : LargeString;
}

annotate NotasFiscaisPostLog with @(
    title              : '{i18n>nfse_postlog}',
    description        : '{i18n>nfse_postlog}',
    UI.TextArrangement : #TextOnly,
    Common.SemanticKey : [createdAt],
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : createdAt
    }]
) {
    ID        @Core.Computed;
    status    @(
        title       : '{i18n>nfsepostlog_status}',
        description : '{i18n>nfsepostlog_status}',
        ValueList   : {
            CollectionPath  : 'ProcessingStatus',
            SearchSupported : true,
            Parameters      : [{
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : 'status_status',
                ValueListProperty : 'status'
            }]
        }
    );
    txtStatus @(
        title            : '{i18n>nfsepostlog_txtstatus}',
        description      : '{i18n>nfsepostlog_txtstatus}',
        UI.MultiLineText : true
    )
}


// ---------------------------------------------------------------------------
// Notas fiscais Arquive
// ---------------------------------------------------------------------------
entity NotasFiscaisArchive : cuid, managed {
    status   : Association to one NotaFiscalStatus not null @assert.unique;
    lifeTime : Integer not null; //Lifetime in days
}

annotate NotasFiscaisArchive with @(
    title              : '{i18n>nfse_archive}',
    description        : '{i18n>nfse_archive}',
    UI.TextArrangement : #TextOnly,
    cds.odata.valuelist,
    Common.SemanticKey : [ID],
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : ID
    }]
) {
    ID       @Core.Computed;
    status   @(
        title       : '{i18n>nfsearchive_status}',
        description : '{i18n>nfsearchive_status}',
        Common      : {
            FieldControl : #Mandatory,
            Text         : {$value : status.txtStatus, },
            ValueList    : {
                CollectionPath  : 'NotaFiscalStatus',
                SearchSupported : true,
                Parameters      : [{
                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'status_nfseStatus',
                    ValueListProperty : 'nfseStatus'
                }]
            }
        }
    );
    lifeTime @(
        title       : '{i18n>nfsearchive_lifetime}',
        description : '{i18n>nfsearchive_lifetime}',
        Common      : {FieldControl : #Mandatory}
    );
}




// ---------------------------------------------------------------------------
// Notas fiscais Arquive Log
// ---------------------------------------------------------------------------
entity NotasFiscaisArchiveLog : cuid, managed {
    status    : Association to one ProcessingStatus not null;
    txtStatus : LargeString;
}

annotate NotasFiscaisArchiveLog with @(
    title              : '{i18n>nfse_archivelog}',
    description        : '{i18n>nfse_archivelog}',
    UI.TextArrangement : #TextOnly,
    Common.SemanticKey : [createdAt],
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : createdAt
    }]
) {
    ID        @Core.Computed;
    status    @(
        title       : '{i18n>nfsearchivelog_status}',
        description : '{i18n>nfsearchivelog_status}',
        ValueList   : {
            CollectionPath  : 'ProcessingStatus',
            SearchSupported : true,
            Parameters      : [{
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : 'status_Status',
                ValueListProperty : 'status'
            }]
        }
    );
    txtStatus @(
        title            : '{i18n>nfsearchivelog_txtstatus}',
        description      : '{i18n>nfsearchivelog_txtstatus}',
        UI.MultiLineText : true
    )

}

entity NotasFiscaisVendor : cuid, managed {

    vendor     : String not null;
    vendorCCM  : String not null;
    vendorName : String;
    prefecture : Association to one Prefectures;

}

annotate NotasFiscaisVendor with
@(
    title              : '{i18n>nfse_NotasFiscaisVendor}',
    UI.TextArrangement : #TextOnly,
    cds.odata.valuelist,
    Common.SemanticKey : [vendor],
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : vendor
    }, ]
) {
    ID            @(Core.Computed);
    vendor         @(
        title       : '{i18n>nfse_vendor}',
        description : '{i18n>nfse_vendor}',
        Common      : {FieldControl : #Mandatory}
    );
    vendorCCM      @(
        title       : '{i18n>nfse_vendorCCM}',
        description : '{i18n>nfse_vendorCCM}',
        Common      : {FieldControl : #Mandatory}
    );
    vendorName     @(
        title       : '{i18n>nfse_vendorName}',
        description : '{i18n>nfse_vendorName}',
    );

    prefecture @(
        title       : '{i18n>nfsevendor_prefecture}',
        description : '{i18n>nfsevendor_prefecture}',
        Common      : {
            Text      : {
                $value                 : prefecture.prefectureName,
                ![@UI.TextArrangement] : #TextOnly
            },
            ValueList : {
                CollectionPath  : 'Prefectures',
                SearchSupported : true,
                Parameters      : [
                {

                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : 'prefecture_ID',
                    ValueListProperty : 'ID'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'prefectureName'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'description'
                }
                ]
            }
        }
    );
};

// ---------------------------------------------------------------------------
// Notas fiscais PDF Log
// ---------------------------------------------------------------------------
entity NotasFiscaisPDFLog : cuid, managed {
    status     : Association to one ProcessingStatus not null;
    notafiscal : Association to one NotasFiscais;
    txtStatus  : LargeString;
}

annotate NotasFiscaisPDFLog with @(
    title              : '{i18n>nfse_pdflog}',
    description        : '{i18n>nfse_pdflog}',
    UI.TextArrangement : #TextOnly,
    Common.SemanticKey : [createdAt],
    UI.Identification  : [{
        $Type : 'UI.DataField',
        Value : createdAt
    }]
) {
    ID        @Core.Computed;
    status    @(
        title       : '{i18n>nfsepdflog_status}',
        description : '{i18n>nfsepdflog_status}',
        ValueList   : {
            CollectionPath  : 'ProcessingStatus',
            SearchSupported : true,
            Parameters      : [{
                $Type             : 'Common.ValueListParameterInOut',
                LocalDataProperty : 'status_status',
                ValueListProperty : 'status'
            }]
        }
    );
    txtStatus @(
        title            : '{i18n>nfsepdflog_txtstatus}',
        description      : '{i18n>nfsepdflog_txtstatus}',
        UI.MultiLineText : true
    )
}


// ---------------------------------------------------------------------------
// Notas fiscais Error Log
// ---------------------------------------------------------------------------

entity NotasFiscaisErrorLog : cuid, managed {
    companyPrefecture   : Association to one CompaniesPrefectures;
    todayDate           : Date;
    lastDate            : Date;
    message             : LargeString;
    jobHasRun           : Boolean not null default false;
}
