using Prefectures from './prefectures-service';



////////////////////////////////////////////////////////////////////////////
//	Prefectures List Page
////////////////////////////////////////////////////////////////////////////
annotate Prefectures.Prefectures with @(
	UI: {
        TextArrangement : #TextOnly,
	    LineItem        : [
			{
                $Type: 'UI.DataField', 
                Value: prefectureName
            },
            {   
                $Type: 'UI.DataField', 
                Value: description,
                ![@UI.Importance] : #High
            },
			{   
                $Type: 'UI.DataField', 
                Value: layoutPattern_ID,
                ![@UI.Importance] : #High
            },
            {   $Type: 'UI.DataField', 
                Value: mapping_ID,
                ![@UI.Importance] : #High
            },
			{   $Type: 'UI.DataField', 
                Value: serviceAddress,
                ![@UI.Importance] : #High
            },
			{   $Type: 'UI.DataField', 
                Value: serviceMethod,
                ![@UI.Importance] : #High
            },  			
            {   $Type: 'UI.DataField', 
                Value: requireCCM,
                ![@UI.Importance] : #High
            },            
            {   $Type: 'UI.DataField', 
                Value: inactive,
                ![@UI.Importance] : #High
            },
            {   $Type: 'UI.DataField', 
                Value: queryParallel,
                ![@UI.Importance] : #High
            },
            {   $Type: 'UI.DataField', 
                Value: referenceLength,
                ![@UI.Importance] : #High
            }
		],
        PresentationVariant : {
            $Type     : 'UI.PresentationVariantType',
            SortOrder : [
                {
                    Property : prefectureName
                }
            ]
        },
        SelectionFields : [ 
            prefectureName, 
            description, 
            layoutPattern_ID, 
            mapping_ID 
        ]
	},

////////////////////////////////////////////////////////////////////////////
//	Prefectures Object Page
////////////////////////////////////////////////////////////////////////////
	UI: {
        HeaderInfo: {
            Title           : { 
                $Type : 'UI.DataField',
                Value: prefectureName
            },
            TypeName        : '{i18n>prefecture_singular}',
            TypeNamePlural  : '{i18n>prefecture_plural}', 
            Description     : { 
                Value: description 
            },
        

        },
        HeaderFacets: [
            {
                $Type             : 'UI.ReferenceFacet',
                Target            : '@UI.FieldGroup#Admin',
                ![@UI.Importance] : #Medium
            }
        ],
        FieldGroup #Description : {
            Data : [
                 {
                    $Type : 'UI.DataField',
                    Value : prefectureName,
                },
                {
                    $Type : 'UI.DataField',
                    Value : description,
                } 
            ]
        },
        FieldGroup #GeneralData: {
			Data: [
                {   
                    $Type: 'UI.DataField', 
                    Value: layoutPattern_ID
                },
            ]
        },
		FieldGroup#Details: {
			Data: [
                {
                    $Type: 'UI.DataField', 
                    Value: serviceAddress
                },
                {
                    $Type: 'UI.DataField', 
                    Value: altWSDL
                },                   
                {
                    $Type: 'UI.DataField', 
                    Value: serviceMethod
                },                
                {   
                    $Type: 'UI.DataField', 
                    Value: mapping_ID
                },
                {   
                    $Type: 'UI.DataField', 
                    Value: searchVendor
                }, 
                {   
                    $Type: 'UI.DataField', 
                    Value: onePage
                },                
                {
                    $Type: 'UI.DataField', 
                    Value: searchD1
                },
                {
                    $Type: 'UI.DataField', 
                    Value: requireCCM,
                },            
                {
                    $Type: 'UI.DataField', 
                    Value: methodPDF
                },         

                {
                    $Type: 'UI.DataField', 
                    Value: inactive
                },                 
                {
                    $Type: 'UI.DataField', 
                    Value: securityOption
                },
                {
                    $Type: 'UI.DataField', 
                    Value: queryParallel
                },
                {
                    $Type: 'UI.DataField', 
                    Value: referenceLength
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
                $Type  : 'UI.CollectionFacet',
                ID     : 'PeopleDetails',
                Label  : '{i18n>details}',
                Facets : [
                    {
			            $Type: 'UI.ReferenceFacet', 
                        Label: '{i18n>details}', 
                        Target: '@UI.FieldGroup#Details'
                    },
          	    ]      
            },
        ]
    }
);
