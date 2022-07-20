using NfseArchive from './nfsearchive-service';



////////////////////////////////////////////////////////////////////////////
//	Archive List Page
////////////////////////////////////////////////////////////////////////////
annotate NfseArchive.NotasFiscaisArchive with @(
	UI: {
        TextArrangement: #TextOnly,
		LineItem: [
			{   
                $Type: 'UI.DataField', 
                Value: status_nfseStatus,
                ![@UI.Importance] : #High
            },
            {   
                $Type             : 'UI.DataField', 
                Value             : lifeTime,
                ![@UI.Importance] : #High
            }
          
		],
        PresentationVariant : {
            $Type     : 'UI.PresentationVariantType',
            SortOrder : [{Property : status_nfseStatus}]
        },
        SelectionFields: [ 
            status_nfseStatus
        ],
	},


////////////////////////////////////////////////////////////////////////////
//	Archive Object Page
////////////////////////////////////////////////////////////////////////////
	UI: {
        HeaderInfo: {
            Title : { 
                $Type : 'UI.DataField',
                Value: status.nfseStatus,
                ![@UI.Hidden],
            },
            TypeName: '{i18n>nfsearchive_singular}',
            TypeNamePlural: '{i18n>nfsearchive_plural}', 
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
        FieldGroup #GeneralData: {
			Data: [
                {
                    $Type : 'UI.DataField',
                    Value: status_nfseStatus

                },
				{
                    $Type : 'UI.DataField',
                    Value: lifeTime
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
                        $Type: 'UI.ReferenceFacet',
                        Target: '@UI.FieldGroup#GeneralData'
                    },
                    {   
                        $Type: 'UI.ReferenceFacet', 
                        Target: '@UI.FieldGroup#Admin'
                    }
                ]
            },
            
        ]
    }
){
 //status @Common.FilterExpressionRestrictions: [{
 // Property: status,
 // AllowedExpressions: #SingleInterval,

};



////////////////////////////////////////////////////////////////////////////
//	Arquive List Page
////////////////////////////////////////////////////////////////////////////
annotate NfseArchive.NotasFiscaisArchiveLog with @(
	UI: {
        TextArrangement: #TextOnly,
		LineItem: [
            {
                $Type : 'UI.DataField',
                Value : createdAt,
                ![@UI.Importance] : #High
            },
          	{   
                $Type: 'UI.DataField', 
                Value: status.txtStatus,
                 ![@UI.Importance] : #High
            },
            {
                $Type : 'UI.DataField',
                Value : createdBy,
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
        },
        SelectionFields: [
            createdAt, 
            status_status,
            createdBy
        ],
	}
);
