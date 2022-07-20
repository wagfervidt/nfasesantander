using NfseList from './nfselist-service';


////////////////////////////////////////////////////////////////////////////
//	Nota Fiscal List Page
////////////////////////////////////////////////////////////////////////////
annotate NfseList.NotasFiscais with @(
	UI: {
		LineItem: [    
            {
                $Type : 'UI.DataField',
                Value: company.CNPJ,
                ![@UI.Importance] : #High
            },        
			{
                $Type : 'UI.DataField',
                Value: company.companyName,
                ![@UI.Importance] : #High
            },
        	{
                $Type : 'UI.DataField',
                Value: prefecture.prefectureName,
                ![@UI.Importance] : #High
            },            
            {   
                $Type: 'UI.DataField', 
                Value: ID,
                ![@UI.Importance] : #High
            },            
            {   
                $Type: 'UI.DataField', 
                Value: docDate,
                ![@UI.Importance] : #High
            },
			{   
                $Type: 'UI.DataField', 
                Value: nfseNo,
                ![@UI.Importance] : #High
            },
			{   
                $Type: 'UI.DataField', 
                Value: vendorName,
                ![@UI.Importance] : #Medium
            },
            {   
                $Type: 'UI.DataField', 
                Value: vendor,
                ![@UI.Importance] : #High
            },
            {   $Type: 'UI.DataField', 
                Value: status.txtStatus,
                ![@UI.Importance] : #Medium,
                Criticality: level
            },
            {   $Type: 'UI.DataField', 
                Value: totalAmount,
                ![@UI.Importance] : #Medium
            },
            {   $Type: 'UI.DataField', 
                Value: currency_code,
                ![@UI.Importance] : #Medium
            }
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
            ID,
            docDate,
            nfseNo,
            company.CNPJ,
            company.companyName,
            prefecture.prefectureName,
            vendorName,
            vendor,
            status.txtStatus,
            lastDate
        ],
	},

////////////////////////////////////////////////////////////////////////////
//	Nota Fiscal Monitor Object Page
////////////////////////////////////////////////////////////////////////////
	UI: {
        HeaderInfo: {
            Title : { 
                $Type : 'UI.DataField',
                Value: nfseNo
            },
            TypeName: '{i18n>nfse_singular}',
            TypeNamePlural: '{i18n>nfse_plural}', 
            Description: { 
                Value: docDate
            }
        },
		 HeaderFacets            : [
                    {
                        $Type  : 'UI.ReferenceFacet',
                        Label  : '{i18n>Details1}',
                        Target : '@UI.FieldGroup#Details1'
                    
                    },
                    {
                        $Type  : 'UI.ReferenceFacet',
                        Label  : '{i18n>Amount}',
                        Target : '@UI.FieldGroup#Amount'
                    },
                    {
                        $Type  : 'UI.ReferenceFacet',
                        Target : '@UI.FieldGroup#Admin'
                    },
                    {
                        $Type  : 'UI.ReferenceFacet',
                        Label  : '{i18n>Status}',
                        Target : '@UI.FieldGroup#Status'
                    }
        ],     
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
        FieldGroup #Status: {
			Data: [
				{
                    $Type : 'UI.DataField',
                    Value: status.nfseStatus,
                    Criticality : level,
                },
                {
                    $Type : 'UI.DataField',
                    Value: ID
                }
            ]
        },
        FieldGroup #Details1: {
			Data: [
                {   
                    $Type : 'UI.DataField',
                    Value: cancelDate
                },
                {   
                    $Type : 'UI.DataField',
                    Value: srvDate
                },                
                {
                    $Type : 'UI.DataField',
                    Value: nfseSubst
                },
				{
                    $Type : 'UI.DataField',
                    Value: city.cityName
                }
			]                      
        },
        FieldGroup #Details2: {
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
                    Value: simpleTax
                },
				{
                    $Type : 'UI.DataField',
                    Value: ceiCode
                },
				{
                    $Type : 'UI.DataField',
                    Value: artCode
                },
				{
                    $Type : 'UI.DataField',
                    Value: constructionID
                },
				{
                    $Type : 'UI.DataField',
                    Value: nfseStatus
                },
                {
                    $Type: 'UI.DataField', 
                    Value: signature
                },
				{
                    $Type : 'UI.DataField',
                    Value: descUnconditioned
                },
				{
                    $Type : 'UI.DataField',
                    Value: descConditioned
                }

			]                      
        },
        FieldGroup #nfseXML: {
			Data: [
                {
                    $Type : 'UI.DataField',
                    Value: nfseXML
                }
            ]
        },
        FieldGroup #VendorData: {
			Data: [
                {
                    $Type : 'UI.DataField',
                    Value: vendor
                },
				{
                    $Type : 'UI.DataField',
                    Value: vendorName
                },
				{
                    $Type : 'UI.DataField',
                    Value: vendorCCM
                },
				{
                    $Type : 'UI.DataField',
                    Value: company.companyName
                },
				{
                    $Type : 'UI.DataField',
                    Value: prefecture.prefectureName
                },
                
			]                        
        },

        FieldGroup #Amount: {
			Data: [
				{
                    $Type : 'UI.DataField',
                    Value: totalAmount
                },
				{
                    $Type : 'UI.DataField',
                    Value: netAmount
                },
				{
                    $Type : 'UI.DataField',
                    Value: currency.code
                },
				{
                    $Type : 'UI.DataField',
                    Value: totalReceipt
                }
			]                      
        },
        FieldGroup #Service: {
            Data : [
                {
                    $Type : 'UI.DataField',
                    Value : serviceCode
                },
                {
                    $Type : 'UI.DataField',
                    Value : serviceDescription
                },
                {
                    $Type : 'UI.DataField',
                    Value : srvCity.cityName
                },
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
        FieldGroup #Taxes: {
            Data : [
        
				{
                    $Type : 'UI.DataField',
                    Value: totalDeductions
                },
				{
                    $Type : 'UI.DataField',
                    Value: totalPIS
                },
				{
                    $Type : 'UI.DataField',
                    Value: totalCOFINS
                },
				{
                    $Type : 'UI.DataField',
                    Value: totalINSS
                },
				{
                    $Type : 'UI.DataField',
                    Value: totalIR
                },
				{
                    $Type : 'UI.DataField',
                    Value: totalCSLL
                },
				{
                    $Type : 'UI.DataField',
                    Value: totalISS
                },
                {
                    $Type : 'UI.DataField',
                    Value: retISS
                },
				{
                    $Type : 'UI.DataField',
                    Value: brokerISS
                },
				{
                    $Type : 'UI.DataField',
                    Value: broker
                },
				{
                    $Type : 'UI.DataField',
                    Value: totalCredit
                },
				{
                    $Type : 'UI.DataField',
                    Value: rateTax
                },
				{
                    $Type : 'UI.DataField',
                    Value: totalTax
                },
				{
                    $Type : 'UI.DataField',
                    Value: percentTax
                },
				{
                    $Type : 'UI.DataField',
                    Value: totalOtherRet
                }
            ]
        },       
        Facets: [
            {   
                $Type: 'UI.CollectionFacet', 
                Label: '{i18n>general_data}', 
                ID: 'vendor',
                Facets : [
                    {
                        $Type  : 'UI.ReferenceFacet',
                        Label: '{i18n>VendorData}',
                        Target : '@UI.FieldGroup#VendorData'
                    },
                    {
                        $Type  : 'UI.ReferenceFacet',
                         Label: '{i18n>Details2}',
                        Target : '@UI.FieldGroup#Details2'
                    }
                ]
            },
            {
                $Type  : 'UI.ReferenceFacet',
                Label  : '{i18n>Service}',
                Target : '@UI.FieldGroup#Service'
            },
            {   
                $Type: 'UI.ReferenceFacet', 
                Label: '{i18n>Taxes}',
                Target : '@UI.FieldGroup#Taxes'
            },
            {
                $Type  : 'UI.ReferenceFacet',
                Label  : '{i18n>nfseXML}',
                Target : '@UI.FieldGroup#nfseXML'
            },
            {   
                $Type: 'UI.ReferenceFacet', 
                Label: '{i18n>nfseLog}',  
                Target : 'Log/@UI.LineItem'
            },
            {   
                $Type: 'UI.ReferenceFacet', 
                Label: '{i18n>nfsePostLog}',  
                Target : 'PostLog/@UI.LineItem'
            }
		],      
    }
);


////////////////////////////////////////////////////////////////////////////
//	Nota Fiscal Log List Page
////////////////////////////////////////////////////////////////////////////
annotate  NfseList.NotasFiscaisLog with @(
    UI: {
        TextArrangement: #TextOnly,
		LineItem: [
            {   
                $Type             : 'UI.DataField', 
                Value             : createdAt,
                ![@UI.Importance] : #High
            },
            {   
                $Type             : 'UI.DataField', 
                Value             : createdBy,
                ![@UI.Importance] : #High
            },
            {   
                $Type             : 'UI.DataField', 
                Label             : '{i18n>nfse_oldStatus}',
                Value             : oldStatus_nfseStatus,
                ![@UI.Importance] : #High
            },
            {   
                $Type             : 'UI.DataField', 
                Label             : '{i18n>nfse_oldStatus}',
                Value             : oldTxtStatus,
                ![@UI.Importance] : #High
            },
            {   
                $Type             : 'UI.DataField', 
                Label             : '{i18n>nfse_newStatus}',
                Value             : newStatus_nfseStatus,
                ![@UI.Importance] : #High
            },
            {   
                $Type             : 'UI.DataField', 
                Label             : '{i18n>nfse_newStatus}',
                Value             : newTxtStatus,
                ![@UI.Importance] : #High
            },
        ],
        PresentationVariant : {
            $Type     : 'UI.PresentationVariantType',
            SortOrder : [
                {
                    Property : createdAt,
                    Descending : true
                }
            ]
        }       
    }
);

////////////////////////////////////////////////////////////////////////////
//	Nota Fiscal Post Log List Page
////////////////////////////////////////////////////////////////////////////
annotate  NfseList.NotasFiscaisPostLog with @(
    UI: {
        TextArrangement: #TextOnly,
		LineItem: [
            {   
                $Type             : 'UI.DataField',
                Value             : logTxtStatus,
                ![@UI.Importance] : #High
            },
            {   
                $Type             : 'UI.DataField',
                Value             : txtStatus,
                ![@UI.Importance] : #High
            },
            {   
                $Type             : 'UI.DataField', 
                Value             : createdAt,
                ![@UI.Importance] : #High
            },
            {   
                $Type             : 'UI.DataField', 
                Value             : createdBy,
                ![@UI.Importance] : #High
            },
        ],  
        PresentationVariant : {
            $Type     : 'UI.PresentationVariantType',
            SortOrder : [
                {
                    Property : createdAt,
                    Descending : true
                }
            ]
        }    
    }
);