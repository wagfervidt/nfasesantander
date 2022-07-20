using NfsePDFLog as service from './nfsepdflog-service';

////////////////////////////////////////////////////////////////////////////
//	Nota Fiscal Post Log List Page
////////////////////////////////////////////////////////////////////////////
annotate NfsePDFLog.NotasFiscaisPDFLog with @(
UI: {
        TextArrangement: #TextOnly,
		LineItem: [
            {   
                $Type: 'UI.DataField', 
                Value: createdAt,
                ![@UI.Importance] : #High
            },
			{   
                $Type: 'UI.DataField', 
                Value: status.txtStatus,
                ![@UI.Importance] : #High
            },
            {   
                $Type             : 'UI.DataField', 
                Value             : notafiscal.nfseNo,
                ![@UI.Importance] : #High
            },
            {   
                $Type: 'UI.DataField', 
                Value: txtStatus,
                ![@UI.Importance] : #High
            },
            {
                $Type : 'UI.DataField',
                Value: txtStatus,
                ![@UI.Importance] : #High
            },
            {   
                $Type: 'UI.DataField', 
                Value: createdBy,
                ![@UI.Importance] : #High
            },        
		],
        PresentationVariant : {
            $Type     : 'UI.PresentationVariantType',
            SortOrder : [
                {
                    Property : createdAt,
                    Descending : true
                },
                {
                    Property : status_status,
                }, 
                {
                    Property : notafiscal_ID,
                },                                 
            ]
        },
        SelectionFields: [ 
            createdAt,
            status.txtStatus,
            notafiscal.nfseNo,
            createdBy
        ],
	},
////////////////////////////////////////////////////////////////////////////
//	Nota Fiscal Post Log Object Page
////////////////////////////////////////////////////////////////////////////
	UI: {
        HeaderInfo: {
            Title : { 
                $Type : 'UI.DataField',
                Value: notafiscal.nfseNo
            },
            TypeName: '{i18n>nfsepdflog_singular}',
            TypeNamePlural: '{i18n>nfsepdflog_plural}', 
        },
        HeaderFacets            : [
            {
                $Type  : 'UI.ReferenceFacet',
                Target : '@UI.FieldGroup#Admin'
            },
        ],
        FieldGroup #GeneralData: {
			Data: [
                {
                    $Type : 'UI.DataField',
                    Value: status.txtStatus
                },
				{
                    $Type : 'UI.DataField',
                    Value: txtStatus
                }
                
			]                        
        },
        FieldGroup #Admin: {
            Data : [
                {
                    $Type : 'UI.DataField',
                    Value : createdBy
                },
                {
                    $Type : 'UI.DataField',
                    Value : modifiedBy
                },
                {
                    $Type : 'UI.DataField',
                    Value : createdAt
                },
                {
                    $Type : 'UI.DataField',
                    Value : modifiedAt
                },
            ]
        },
        Facets: [ 
            {
                $Type: 'UI.ReferenceFacet',
                Label : '{i18n>general_data}',
                Target: '@UI.FieldGroup#GeneralData'
            }
        ]
    },
);


////////////////////////////////////////////////////////////////////////////
//	Nota Fiscal List Page
////////////////////////////////////////////////////////////////////////////
annotate NfsePDFLog.NotasFiscais with @(
	UI: {
        TextArrangement: #TextOnly,
		LineItem: [
			{   
                $Type: 'UI.DataField', 
                Value: company_ID
            },
            {   
                $Type             : 'UI.DataField', 
                Value             : prefecture_ID,
                ![@UI.Importance] : #High
            },
            {   
                $Type: 'UI.DataField', 
                Value: vendor,
                ![@UI.Importance] : #High
            },
			{   
                $Type: 'UI.DataField', 
                Value: vendorCCM,
                ![@UI.Importance] : #High
            },
			{   
                $Type: 'UI.DataField', 
                Value: nfseNo,
                ![@UI.Importance] : #High
            },            
            {   
                $Type: 'UI.DataField', 
                Value: docDate,
                ![@UI.Importance] : #Medium
            },
            {   $Type: 'UI.DataField', 
                Value: cancelDate,
                ![@UI.Importance] : #High
            },
            {   $Type: 'UI.DataField', 
                Value: nfseStatus,
                ![@UI.Importance] : #High
            },      
            {   $Type: 'UI.DataField', 
                Value: city_cityCode,
            },          
		],
        PresentationVariant : {
            $Type     : 'UI.PresentationVariantType',
            SortOrder : [
                {
                    Property : docDate,
                    Descending : true
                },
                {
                    Property : vendor,
                }, 
                {
                    Property : nfseNo,
                },                                 
            ]
        },
        SelectionFields: [ 
            company_ID,
            prefecture_ID,
            vendor,
            vendorCCM,
            nfseNo,
            docDate,
            cancelDate
        ],
	},

////////////////////////////////////////////////////////////////////////////
//	Nota Fiscal Monitor Object Page
////////////////////////////////////////////////////////////////////////////
	UI: {
        HeaderInfo: {
            Title : { 
                $Type : 'UI.DataField',
                Value: prefecture_ID
            },
            TypeName: '{i18n>nfse_singular}',
            TypeNamePlural: '{i18n>nfse_plural}', 
            Description: { 
                Value: company_ID 
            }
        },
		 HeaderFacets            : [
            {
                $Type             : 'UI.ReferenceFacet',
                Target            : '@UI.FieldGroup#NfseData',
                ![@UI.Importance] : #Medium
            },
            {
                $Type             : 'UI.ReferenceFacet',
                Target            : '@UI.FieldGroup#Admin',
                ![@UI.Importance] : #Medium
            }
        ],
        FieldGroup #GeneralData: {
			Data: [
                {
                    $Type : 'UI.DataField',
                    Value: vendor
                },
				{
                    $Type : 'UI.DataField',
                    Value: vendorCCM
                },
				{
                    $Type : 'UI.DataField',
                    Value: vendorName
                },
                
			]                        
        },
        FieldGroup #Details: {
			Data: [
				{
                    $Type : 'UI.DataField',
                    Value: veriCode
                },
                {   
                    $Type : 'UI.DataField',
                    Value: barcode
                },
                {
                    $Type : 'UI.DataField',
                    Value: reference         
                },
                {
                    $Type: 'UI.DataField', 
                    Value: city_cityCode          
                },
				{
                    $Type : 'UI.DataField',
                    Value:   serviceCode       
                },
				{
                    $Type : 'UI.DataField',
                    Value:   serviceDescription
                }                
			]                      
        },
        FieldGroup #Amount: {
			Data: [
				{
                    $Type : 'UI.DataField',
                    Value:   totalAmount, 
                },
				{
                    $Type : 'UI.DataField',
                    Value:   totalDeductions   
                },
				{
                    $Type : 'UI.DataField',
                    Value:   netAmount         
                },
				{
                    $Type : 'UI.DataField',
                    Value:   totalPIS          
                },
				{
                    $Type : 'UI.DataField',
                    Value:   totalCOFINS
                },
				{
                    $Type : 'UI.DataField',
                    Value:   totalINSS         
                },
				{
                    $Type : 'UI.DataField',
                    Value:   totalIR           
                },
				{
                    $Type : 'UI.DataField',
                    Value:   totalCSLL         
                },
				{
                    $Type : 'UI.DataField',
                    Value:   totalISS          
                },
				{
                    $Type : 'UI.DataField',
                    Value:   totalCredit       
                },
				{
                    $Type : 'UI.DataField',
                    Value:   rateTax           
                },
				{
                    $Type : 'UI.DataField',
                    Value:   totalTax          
                },   
				{
                    $Type : 'UI.DataField',
                    Value:   percentTax        
                },                                                                                   
			]                      
        },  
        FieldGroup #NfseData: {
            Data : [
                {
                    $Type : 'UI.DataField',
                    Value :   nfseNo        
                },
                {
                    $Type : 'UI.DataField',
                    Value :   docDate         
                },
                {
                    $Type : 'UI.DataField',
                    Value :   cancelDate        
                },
                {
                    $Type : 'UI.DataField',
                    Value : nfseSubst
                },
                {
                    $Type : 'UI.DataField',
                    Value :   simpleTax         
                },
                {
                    $Type : 'UI.DataField',
                    Value : retISS
                },
                {
                    $Type : 'UI.DataField',
                    Value : nfseStatus
                },                

            ]
        },  
        FieldGroup #Service: {
            Data : [
                {
                    $Type : 'UI.DataField',
                    Value : srvAmount
                },
                {
                    $Type : 'UI.DataField',
                    Value : srvAccount
                },
                {
                    $Type : 'UI.DataField',
                    Value : srvCostCenter
                },
                {
                    $Type : 'UI.DataField',
                    Value : srvPO
                },
                {
                    $Type : 'UI.DataField',
                    Value : srvPOItem
                },
                {
                    $Type : 'UI.DataField',
                    Value : srvDueDate
                }, 
                {
                    $Type : 'UI.DataField',
                    Value : srvBank
                },
                {
                    $Type : 'UI.DataField',
                    Value : srvBankAgency
                },
                {
                    $Type : 'UI.DataField',
                    Value : srvBankAccount
                },   
                {
                    $Type : 'UI.DataField',
                    Value : srvContact
                }, 
                {
                    $Type : 'UI.DataField',
                    Value : srvArea
                },   
                {
                    $Type : 'UI.DataField',
                    Value : srvDelivery
                },
                {
                    $Type : 'UI.DataField',
                    Value : srvMatDoc
                },                
                {
                    $Type : 'UI.DataField',
                    Value : srvMatDocItem
                }                     
            ]
        },                  
        FieldGroup #Admin: {
            Data : [
                {
                    $Type : 'UI.DataField',
                    Value : status_nfseStatus
                },
                {
                    $Type : 'UI.DataField',
                    Value : createdBy
                },
                {
                    $Type : 'UI.DataField',
                    Value : modifiedBy
                },
                {
                    $Type : 'UI.DataField',
                    Value : createdAt
                },
                {
                    $Type : 'UI.DataField',
                    Value : modifiedAt
                },
            ]
        },
        Facets: [
            {
                $Type  : 'UI.CollectionFacet',
                ID     : 'Details',
                Label  : '{i18n>details}',
                Facets : [
                    {
                        $Type  : 'UI.ReferenceFacet',
                        Label  : '{i18n>details}',
                        Target : '@UI.FieldGroup#Details'
                    },
                    {
                        $Type  : 'UI.ReferenceFacet',
                        Label  : '{i18n>amount}',
                        Target : '@UI.FieldGroup#Amount'
                    }
                ]
            },
            {   
                $Type: 'UI.ReferenceFacet', 
                Label: '{i18n>service}', 
                Target: '@UI.FieldGroup#Service'
            }
           
		],      
    }
);
