using NfseLog as service from './nfselog-service';

////////////////////////////////////////////////////////////////////////////
//	Nota Fiscal Log List Page
////////////////////////////////////////////////////////////////////////////
annotate NfseLog.NfseLog with  @(
	UI: {
        TextArrangement: #TextOnly,
		LineItem: [
			{   
                $Type               : 'UI.DataField', 
                Value               : NotaFiscal.company_ID,
                ![@UI.Importance]   : #High
            },
            {   
                $Type             : 'UI.DataField', 
                Value             : NotaFiscal.prefecture_ID,
                ![@UI.Importance] : #High
            },
            {   
                $Type: 'UI.DataField', 
                Value: NotaFiscal.vendor,
                ![@UI.Importance] : #High
            },
			{   
                $Type: 'UI.DataField', 
                Value: NotaFiscal.vendorName,
                ![@UI.Importance] : #High
            },
			{   
                $Type: 'UI.DataField', 
                Value: NotaFiscal.nfseNo,
                ![@UI.Importance] : #High
            },            
            {   
                $Type: 'UI.DataField', 
                Value: oldStatus.txtStatus,
                Criticality : oldLevel,
                ![@UI.Importance] : #Medium
            },
            {   $Type: 'UI.DataField', 
                Value: newStatus.txtStatus,
                Criticality: newLevel,
                ![@UI.Importance] : #High
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
                    Property : NotaFiscal.company_ID,
                }, 
                {
                    Property : NotaFiscal.prefecture_ID,
                },    
                {
                    Property : NotaFiscal.vendor,
                }, 
                {
                    Property : NotaFiscal.nfseNo,
                },                                 
            ]
        },
        SelectionFields: [ 
            NotaFiscal.company_ID,
            NotaFiscal.prefecture_ID,
            NotaFiscal.vendor,
            NotaFiscal.nfseNo,
            createdAt,
            createdBy
        ],
	},
);
