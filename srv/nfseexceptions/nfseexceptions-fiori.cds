using NfseExceptions from './nfseexceptions-service';

////////////////////////////////////////////////////////////////////////////
//	NFSE Exception List Page
////////////////////////////////////////////////////////////////////////////
annotate  NfseExceptions.NotasFiscaisReadException with @(
	UI: {
		LineItem        : [
			{
                $Type: 'UI.DataField', 
                Value: vendor,
                ![@UI.Importance] : #High
            },
            {
                $Type: 'UI.DataField', 
                Value: vendorExcName,
                ![@UI.Importance] : #High
            },
            {
                $Type: 'UI.DataField', 
                Value: validFrom,
                ![@UI.Importance] : #High     
            },
            {
                $Type: 'UI.DataField', 
                Value: validTo,
                ![@UI.Importance] : #High     
            }
		],
        PresentationVariant : {
            $Type     : 'UI.PresentationVariantType',
            SortOrder : [
                {
                    Property : vendor
                }
            ]
        },
        SelectionFields : [ 
            vendor, 
            validFrom,
            validTo
        ]
	},
////////////////////////////////////////////////////////////////////////////
//	NFSE Exception Object Page
////////////////////////////////////////////////////////////////////////////   
	UI: {
        HeaderInfo: {
            Description: { 
                Value: vendorExcName 
            },
            Title : { 
                $Type : 'UI.DataField',
                Value: vendor
            },
            TypeName        : '{i18n>nfse_exceptions_singular}',
            TypeNamePlural  : '{i18n>nfse_exceptions_plural}', 
        },
        HeaderFacets: [
            {
                $Type             : 'UI.ReferenceFacet',
                Target            : '@UI.FieldGroup#Admin',
                ![@UI.Importance] : #Medium
            }
        ],

        FieldGroup #GeneralData: {
			Data: [
                {   
                    $Type: 'UI.DataField',
                    Value: validFrom
                },
                {   
                    $Type: 'UI.DataField',
                    Value: validTo
                },
            ]
        },
        FieldGroup #Admin       : {
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
                }
            ]
        },
        Facets: [
            {
               $Type: 'UI.ReferenceFacet', 
               Label: '{i18n>general_data}', 
               Target: '@UI.FieldGroup#GeneralData'  
            },
            {   
                $Type: 'UI.ReferenceFacet', 
                Label: '{i18n>company_plural}',  
                Target : 'companies/@UI.LineItem'
          
            },            
        ]
    }
);

////////////////////////////////////////////////////////////////////////////
//	Exceptions Companies List
////////////////////////////////////////////////////////////////////////////
annotate NfseExceptions.NotasFiscaisReadExceptCompanies with  @(
	UI: {
    	TextArrangement     : #TextOnly,

        LineItem: [
            
			{
                $Type             : 'UI.DataField',
                Value             : company_ID,
                ![@UI.Importance] : #High
                
            },
            {
                $Type             : 'UI.DataField',
                Value             : company.companyName,
                ![@UI.Importance] : #High,                
                ![@Common.FieldControl] : #ReadOnly,
            },
            {
                $Type             : 'UI.DataField',
                Value             : company.CCM,
                ![@UI.Importance] : #High,                
                ![@Common.FieldControl] : #ReadOnly,
            },    

            {
                $Type             : 'UI.DataField',
                Value             : company.inactive,
                ![@UI.Importance] : #High,                
                ![@Common.FieldControl] : #ReadOnly,
            },                    
        ],
       // SelectionFields: [ 
        //    company_ID,
        //],
        PresentationVariant : {SortOrder : [{
            $Type      : 'Common.SortOrderType',
            Property   : company_ID,
            Descending : false
        }]}
    },
////////////////////////////////////////////////////////////////////////////
//	Exceptions Companies Object page
////////////////////////////////////////////////////////////////////////////
 UI        : {
        /*
        HeaderInfo              : {
            Title          : {
                $Type : 'UI.DataField',
                Value : nfseException.vendor
            },
            TypeName       : '{i18n>company_singular}',
            TypeNamePlural : '{i18n>company_plural}',
            Description    : {Value : company.companyName}
        },
        */
        FieldGroup #Description : {Data : [
            {
                $Type : 'UI.DataField',
                Value : company_ID,
            },
            {
                $Type : 'UI.DataField',
                Value : company.CCM,
                ![@Common.FieldControl] : #ReadOnly,
                ![@UI.Importance]       : #High
            },
            {
                $Type : 'UI.DataField',
                Value : company.homePrefecture_ID,
                ![@Common.FieldControl] : #ReadOnly,
                ![@UI.Importance]       : #High
            },
            {
                $Type : 'UI.DataField',
                Value : company.inactive,
                ![@Common.FieldControl] : #ReadOnly,
                ![@UI.Importance]       : #High
            }
        ]},
    // Page Facets
        Facets : [{
            $Type  : 'UI.CollectionFacet',
            ID     : 'NotasFiscaisReadExceptCompaniesDetails',
            Label  : '{i18n>details}',
            Facets : [{
                $Type  : 'UI.ReferenceFacet',
                Label  : '{i18n>details}',
                Target : '@UI.FieldGroup#Description'
            }]
        }]
    }
);


////////////////////////////////////////////////////////////////////////////
//	NFSE Text Exception List Page
////////////////////////////////////////////////////////////////////////////
annotate  NfseExceptions.NotasFiscaisTextException with @(
	UI: {
		LineItem        : [
			{
                $Type: 'UI.DataField', 
                Value: txtException,
                ![@UI.Importance] : #High
            },
            {
                $Type: 'UI.DataField', 
                Value: validFrom,
                ![@UI.Importance] : #High     
            },
            {
                $Type: 'UI.DataField', 
                Value: validTo,
                ![@UI.Importance] : #High     
            }
		],
        PresentationVariant : {
            $Type     : 'UI.PresentationVariantType',
            SortOrder : [
                {
                    Property : txtException
                }
            ]
        },
        SelectionFields : [ 
            txtException, 
            validFrom,
            validTo
        ]
	},
////////////////////////////////////////////////////////////////////////////
//	NFSE Text Exception Object Page
////////////////////////////////////////////////////////////////////////////   
	UI: {
        HeaderInfo: {
            /*  Description: { 
                Value: '{i18n>nfse_txtexceptions_singular}',
            },  */
            
            /* Title : { 
                $Type : 'UI.DataField',
                Value: '{i18n>nfse_txtexceptions_singular}',
            }, */
           
            TypeName        : '{i18n>nfse_txtexceptions_singular}',
            TypeNamePlural  : '{i18n>nfse_txtexceptions_plural}', 
            
            
            
        },
        HeaderFacets: [
            {
                
                $Type             : 'UI.ReferenceFacet',
                Target            : '@UI.FieldGroup#Admin',
                ![@UI.Importance] : #Medium
            
            }
        ],

        FieldGroup #GeneralData: {
			Data: [
                {   
                    $Type: 'UI.DataField', 
                    Value: txtException
                },                
                {   
                    $Type: 'UI.DataField', 
                    Value: validFrom
                },
                {   
                    $Type: 'UI.DataField', 
                    Value: validTo
                },
            ]
        },
        FieldGroup #Admin       : {
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
                }
            ]
        },
        Facets: [
            {
               $Type: 'UI.ReferenceFacet', 
               Label: '{i18n>general_data}', 
               Target: '@UI.FieldGroup#GeneralData'  
            } 
        ]
    }
);