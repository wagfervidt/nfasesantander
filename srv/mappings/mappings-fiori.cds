using Mappings from './mappings-service';

////////////////////////////////////////////////////////////////////////////
//	Mappings List Page
////////////////////////////////////////////////////////////////////////////
@odata.draft.enabled
annotate Mappings.Mappings with @(
	UI: {
		LineItem        : [
			{
                $Type: 'UI.DataField', 
                Value: mappingName
            },
            {   $Type: 'UI.DataField', 
                Value: description,
                ![@UI.Importance] : #High
            },
            {   $Type: 'UI.DataField', 
                Value: requestWrapper
            },
            {   $Type: 'UI.DataField', 
                Value: requestXSLT
            },
            {   $Type: 'UI.DataField', 
                Value: responseXSLT
            },
            {   $Type: 'UI.DataField', 
                Value: responseTag
            },
            {   $Type: 'UI.DataField', 
                Value: errorAttr
            }
		],
        PresentationVariant : {
            $Type     : 'UI.PresentationVariantType',
            SortOrder : [
                {
                    Property : mappingName
                }
            ]
        },
        SelectionFields : [ 
            mappingName, 
            description 
        ]
	},

////////////////////////////////////////////////////////////////////////////
//	Mappings Object Page
////////////////////////////////////////////////////////////////////////////
	UI: {
        HeaderInfo: {
            Title           : {
                $Type: 'UI.DataField', 
                Value: mappingName
            },
            TypeName        : '{i18n>mapping_singular}',
            TypeNamePlural  : '{i18n>mapping_plural}', 
            Description     : {
                $Type: 'UI.DataField', 
                Value: description
            },
        },
        HeaderFacets            : [
            {
                $Type             : 'UI.ReferenceFacet',
                Target            : '@UI.FieldGroup#Admin',
                ![@UI.Importance] : #Medium
            }
        ],
        FieldGroup #Tag : {
            Data : [
                {
                    $Type : 'UI.DataField',
                    Value : signatureField
                }, 
            ]
        },
        FieldGroup #Description : {
            Data : [
                {
                    $Type : 'UI.DataField',
                    Value : description
                }, 
            ]
        },
        FieldGroup#RequestWrapper: {
			Data: [
                {   
                    $Type: 'UI.DataField', 
                    Value: requestWrapper,
                    
                }
			]                        
        },        
        FieldGroup#RequestXSLT: {
			Data: [
               
                {   
                    $Type: 'UI.DataField', 
                    Value: requestXSLT 
                },
                {   
                    $Type: 'UI.DataField', 
                    Value: transfXMLReq 
                }
			]                        
        },
        FieldGroup#Response: {
			Data: [
				
				{   $Type: 'UI.DataField', 
                    Value: responseXSLT
                },
				{   $Type: 'UI.DataField', 
                    Value: responseTag
                },   
                {   $Type: 'UI.DataField', 
                    Value: errorAttr
                },          
                {   $Type: 'UI.DataField', 
                    Value: transfXMLResp
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
        // Page Facets
		Facets: [
            {
                $Type  : 'UI.CollectionFacet',
                ID     : 'MappingDetails',
                Label  : '{i18n>Request}',
                Facets : [
                    {    
                        $Type: 'UI.ReferenceFacet',
                        Target: '@UI.FieldGroup#RequestWrapper'
                       
                    },
                    {    
                        $Type: 'UI.ReferenceFacet',
                        Target: '@UI.FieldGroup#RequestXSLT'
                    },
                    {    
                        $Type: 'UI.ReferenceFacet',
                        Target: '@UI.FieldGroup#Tag'
                    }                
                ]
            },
            {    
                        $Type: 'UI.ReferenceFacet', 
                        Label: '{i18n>Response}', 
                        Target: '@UI.FieldGroup#Response'
            },
		],      
    }
);