using NfseScheduleLog as service from './nfseschedulelog-service';


////////////////////////////////////////////////////////////////////////////
//	NFSE Schedule Log List Page
////////////////////////////////////////////////////////////////////////////
annotate NfseScheduleLog.NotasFiscaisScheduleLog with @(
   	UI: {
		LineItem: [
			{
                $Type: 'UI.DataField', 
                Value: company_ID,
                ![@UI.Importance] : #High
            },
			{
                $Type: 'UI.DataField', 
                Value: prefecture_ID,
                ![@UI.Importance] : #High
            },
			{
                $Type: 'UI.DataField', 
                Value: CCMPrefecture,
                ![@UI.Importance] : #High
            },
            {
                $Type: 'UI.DataField', 
                Value: readDate,
                ![@UI.Importance] : #High     
            },
            {
                $Type: 'UI.DataField', 
                Value: status.txtStatus,
                ![@UI.Importance] : #High     
            },
            { 
                $Type: 'UI.DataField', 
                Value: txtStatus,
                ![@UI.Importance] : #Low  
            },
            {   $Type: 'UI.DataField', 
                Value: createdAt,
                ![@UI.Importance] : #High
            },      
            {   $Type: 'UI.DataField', 
                Value: createdBy,
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
                    Property : readDate,
                    Descending : true
                },
                {
                    Property : company_ID,
                    Descending : false
                },                
                {
                    Property : prefecture_ID,
                    Descending : false
                },   
            ]
        },
        SelectionFields : [ 
            company_ID, 
            prefecture_ID,
            readDate,
            createdAt,
            status_status
        ]
	}, 
////////////////////////////////////////////////////////////////////////////
//	NFSE Schedule Log Object Page
////////////////////////////////////////////////////////////////////////////  
UI: {
        HeaderInfo: {
            Title           : { 
                $Type : 'UI.DataField',
                Value: company_ID
            },
            TypeName        : '{i18n>nfse_schedulelog_singular}',
            TypeNamePlural  : '{i18n>nfse_schedulelog_plural}', 
            Description     : { 
                Value: prefecture_ID
            },
        

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
                    Value: txtStatus
                },
                {
                    $Type : 'UI.DataField',
                    Value : status.txtStatus
                },
                {
                    $Type: 'UI.DataField', 
                    Value: CCMPrefecture,
                    ![@UI.Importance] : #High
                },
                {
                    $Type : 'UI.DataField',
                    Value : readDate
                }
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
    },

    
);