using Cities from './cities-service';

////////////////////////////////////////////////////////////////////////////
//	NFSE Cities Code
////////////////////////////////////////////////////////////////////////////
annotate  Cities.Cities with @(
	UI: {
		LineItem        : [
			{
                $Type: 'UI.DataField', 
                Value: cityCode,
                ![@UI.Importance] : #High
            },
			{
                $Type: 'UI.DataField', 
                Value: cityName,
                ![@UI.Importance] : #High
            }
		],
        PresentationVariant : {
            $Type     : 'UI.PresentationVariantType',
            SortOrder : [
                {
                    Property : cityCode
                }
            ]
        },
        SelectionFields : [ 
            cityCode,
            cityName
        ]
	}
);

