using LayoutPatterns from './layoutpatterns-service';

////////////////////////////////////////////////////////////////////////////
//	Layout Patterns List Page
////////////////////////////////////////////////////////////////////////////
annotate LayoutPatterns.LayoutPatterns with @(
	UI: {
		LineItem        : [
			{
                $Type: 'UI.DataField', 
                Value: layoutpatternName
            },
            {   $Type               : 'UI.DataField', 
                Value               : description,
                ![@UI.Importance]   : #High
            }
		],
        PresentationVariant : {
            $Type     : 'UI.PresentationVariantType',
            SortOrder : [
                {
                    Property : layoutpatternName
                }
            ]
        },
        SelectionFields : [ 
            layoutpatternName, 
            description 
        ],
	},

////////////////////////////////////////////////////////////////////////////
//	Layout Patterns Object Page
////////////////////////////////////////////////////////////////////////////
	UI: {
        HeaderInfo: {
            Title           : {
                $Type: 'UI.DataField', 
                Value: layoutpatternName 
            },
            TypeName        : '{i18n>layout_singular}',
            TypeNamePlural  : '{i18n>layout_plural}' ,
            Description     : {
                $Type: 'UI.DataField', 
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
                    Value : description
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
        }
    }            
);