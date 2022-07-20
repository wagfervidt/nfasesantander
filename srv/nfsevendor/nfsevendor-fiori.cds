using NfseVendor as service from './nfsevendor-service';


////////////////////////////////////////////////////////////////////////////
//	Nota Fiscal List Page
////////////////////////////////////////////////////////////////////////////
annotate NfseVendor.NotasFiscaisVendor with @(
	UI: {
        TextArrangement: #TextOnly,
		LineItem: [            
			
            {   
                $Type: 'UI.DataField', 
                Value: vendor,
                ![@UI.Importance] : #High
            },
            {   
                $Type: 'UI.DataField', 
                Value: vendorName
            },
            {   
                $Type: 'UI.DataField', 
                Value: vendorCCM
            },
            {   $Type: 'UI.DataField', 
                Value: prefecture_ID,

            }
           
		],
        PresentationVariant : {
            $Type     : 'UI.PresentationVariantType',
            SortOrder : [
                {
                    Property : vendor,
                }                                
            ]
        },
        SelectionFields: [ 
            vendor,
            vendorCCM,
            prefecture_ID
        ],
	},

////////////////////////////////////////////////////////////////////////////
//	Nota Fiscal Monitor Object Page
////////////////////////////////////////////////////////////////////////////
	UI: {
        HeaderInfo: {
            Title : { 
                $Type : 'UI.DataField',
                Value: vendor
            },
            TypeName: '{i18n>nfse_singular}',
            TypeNamePlural: '{i18n>nfse_plural}', 
            Description: { 
                Value: vendorName
            }
        },
		 HeaderFacets            : [
                    {
                        $Type  : 'UI.ReferenceFacet',
                        Target : '@UI.FieldGroup#Admin'
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

        FieldGroup #VendorData: {
			Data: [
				{
                    $Type : 'UI.DataField',
                    Value: vendorCCM
                },
				{
                    $Type : 'UI.DataField',
                    Value: prefecture_ID
                },
                
			]                        
        },
        Facets: [
            {
               $Type: 'UI.ReferenceFacet', 
               Label: '{i18n>vendor_data}', 
               Target: '@UI.FieldGroup#VendorData'  
            }    
        ]  
    }
);

