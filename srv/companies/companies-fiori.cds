using Companies from './companies-service';

////////////////////////////////////////////////////////////////////////////
//	Companies List Page
////////////////////////////////////////////////////////////////////////////
annotate Companies.Companies with @(
	UI: {
        LineItem: [
			{   
                $Type: 'UI.DataField', 
                Value: CNPJ,
                ![@UI.Importance] : #High
            },
            {   
                $Type : 'UI.DataField', 
                Value : companyName,
                ![@UI.Importance] : #High
            },
            {   
                $Type: 'UI.DataField', 
                Value: CCM,
                ![@UI.Importance] : #High
            },
			{   
                $Type: 'UI.DataField', 
                Value: certificate,
                ![@UI.Importance] : #High
            },
			{   
                $Type: 'UI.DataField', 
                Value: homePrefecture_ID,
                ![@UI.Importance] : #High
            },            
            {   
                $Type: 'UI.DataField', 
                Value: description,
                ![@UI.Importance] : #High
            },
            {   $Type: 'UI.DataField', 
                Value: inactive,
                ![@UI.Importance] : #High
            }
		],
        PresentationVariant : {
            $Type     : 'UI.PresentationVariantType',
            SortOrder : [{Property : CNPJ}]
        },
        SelectionFields: [ 
            CNPJ,
            companyName,
            certificate,
            homePrefecture_ID
        ],
	},


////////////////////////////////////////////////////////////////////////////
//	Companies Object Page
////////////////////////////////////////////////////////////////////////////
	UI: {
        HeaderInfo: {
            Description: { 
                Value: companyName 
            },           
            Title : { 
                $Type : 'UI.DataField',
                Value: CNPJ
            },
            TypeName: '{i18n>company_singular}',
            TypeNamePlural: '{i18n>company_plural}', 

        },
		 HeaderFacets            : [
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
                    Value: CNPJ
                },
				{
                    $Type : 'UI.DataField',
                    Value: companyName
                },

			]                        
        },
        FieldGroup #Details: {
			Data: [
				{
                    $Type : 'UI.DataField',
                    Value: CCM
                },
                {   
                    $Type : 'UI.DataField',
                    Value: certificate
                },
                {
                    $Type : 'UI.DataField',
                    Value: homePrefecture_ID

                },
                {
                    $Type: 'UI.DataField', 
                    Value: inactive
                }
			]            
        },
        FieldGroup #Description: {
			Data: [
				{
                    $Type : 'UI.DataField',
                    Value: description
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
                }
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
                    }
                ]
            },
            {   
                $Type: 'UI.ReferenceFacet', 
                Label: '{i18n>description}', 
                Target: '@UI.FieldGroup#Description'
            },
            {   
                $Type: 'UI.ReferenceFacet', 
                Label: '{i18n>prefectures}',  
                Target : 'prefectures/@UI.LineItem'
          
            },
		],      
    }
);

////////////////////////////////////////////////////////////////////////////
//	Prefecture List
////////////////////////////////////////////////////////////////////////////
annotate Companies.CompaniesPrefectures with @( 
   	UI: {
    	TextArrangement     : #TextOnly,
        LineItem: [           
			{
                $Type             : 'UI.DataField',
                Value             : prefectures_ID,
                ![@UI.Importance] : #High
            },
			{
                $Type             : 'UI.DataField',
                Value             : CCMPrefecture,
                ![@UI.Importance] : #High
            },            
            {   
                $Type                   : 'UI.DataField',
                Value                   : prefectures.description,
                ![@Common.FieldControl] : #ReadOnly,
                ![@UI.Importance]       : #High
            },          
 			{   
                $Type                   : 'UI.DataField',
                Value                   : prefectures.serviceAddress,
                ![@Common.FieldControl] : #ReadOnly,
                ![@UI.Importance]       : #High,
            },
            {   
                $Type                   : 'UI.DataField',
                Value                   : prefectures.serviceMethod,
                ![@Common.FieldControl] : #ReadOnly,
                ![@UI.Importance]       : #High,
            }
		],
        PresentationVariant : {SortOrder : [{
            $Type      : 'Common.SortOrderType',
            Property   : prefectures_ID,
            Descending : false
        }]}
    },
  
////////////////////////////////////////////////////////////////////////////
//	Prefecture Object Header
////////////////////////////////////////////////////////////////////////////    
    UI: { 
        HeaderInfo: {         
            Title: {
                $Type : 'UI.DataField',
                Value : '{i18n>company_singular}'
            },    
            TypeName       : '{i18n>prefecture_singular}',
            TypeNamePlural : '{i18n>prefecture_singular}',
            Description    : {
                Value : '{i18n>prefecture_singular}'
            }
        },
        HeaderFacets: [
            {
                $Type             : 'UI.ReferenceFacet',
                Target            : '@UI.FieldGroup#Admin',
                ![@UI.Importance] : #Medium
            }
        ],

        FieldGroup #Details : {
            Data : [
                {
                    $Type : 'UI.DataField',
                    Value : prefectures_ID,
                },
                {
                    $Type : 'UI.DataField',
                    Value : CCMPrefecture,
                },
                {
                    $Type                   : 'UI.DataField',
                    Value                   : prefectures.description,
                    ![@Common.FieldControl] : #ReadOnly,
                    ![@UI.Importance]       : #High
                },
                {   
                    $Type                   : 'UI.DataField',
                    Value                   : prefectures.serviceAddress,
                    ![@Common.FieldControl] : #ReadOnly,
                    ![@UI.Importance]       : #High,
                },
                
            ]
        },
        
        FieldGroup #Admin: {
            Data : [
                {
                    $Type : 'UI.DataField',
                    Value : prefectures.createdBy
                },
                {
                    $Type : 'UI.DataField',
                    Value : prefectures.modifiedBy
                },
                {
                    $Type : 'UI.DataField',
                    Value : prefectures.createdAt
                },
                {
                    $Type : 'UI.DataField',
                    Value : prefectures.modifiedAt
                }
            ]
        },
    // Page Facets
        Facets : [
            {
                $Type  : 'UI.CollectionFacet',
                ID     : 'CompaniesPrefecturesDetails',
                Label  : '{i18n>details}',
                Facets : [
                    {
                        $Type  : 'UI.ReferenceFacet',
                        Label  : '{i18n>details}',
                        Target : '@UI.FieldGroup#Details'
                    }
                ]
            }
        ]
    }  
); 
