sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function(JSONModel) {
	"use strict";
    return {	
		initModel: function(i18n) {
			return {
			    columnsCompanies: [
                    {
                        label: i18n.download_CNPJ,
					    property: "CNPJ",
					    type: sap.ui.export.EdmType.String,
                        width: "8rem"
                    },
                    {
                        label: i18n.download_name,
					    property: "nome",
					    type: sap.ui.export.EdmType.String,
                        width: "10rem"
                    },
                    {
                        label: i18n.download_CCM,
					    property: "CCM",
					    type: sap.ui.export.EdmType.String,
                        width: "8rem"
                    },
                    {
                        label: i18n.download_certificate,
					    property: "certificado",
					    type: sap.ui.export.EdmType.String,
                        width: "15rem"
                    },
                    {
                        label: i18n.download_description,
					    property: "descricao",
					    type: sap.ui.export.EdmType.String,
                        width: "25rem"
                    },
                    {
                        label: i18n.download_cityName,
					    property: "cidade",
					    type: sap.ui.export.EdmType.String,
                        width: "8rem"
                    },
                    {
                        label: i18n.download_UF,
					    property: "UF",
					    type: sap.ui.export.EdmType.String,
                        width: "2rem"
                    }
                ],
                columnsSchedule: [
                    {
                        label: i18n.download_schedule_CNPJ,
					    property: "CNPJ",
					    type: sap.ui.export.EdmType.String,
                        width: "8rem"
                    },
                    {
                        label: i18n.download_readDate,
					    property: "DataInicio",
					    type: sap.ui.export.EdmType.String,
                        width: "6rem",
                        textAlign: 'end'
                    }
                ],
                columnsException : [
                    {
                        label: i18n.download_vendor,
					    property: "vendor",
					    type: sap.ui.export.EdmType.String,
                        width: "8rem"
                    },
                    {
                        label: i18n.download_vendorName,
					    property: "vendorExcName",
					    type: sap.ui.export.EdmType.String,
                        width: "28rem"
                    },
                    {
                        label: i18n.download_validFrom,
					    property: "ValidFrom",
					    type: sap.ui.export.EdmType.String,
                        width: "12rem"
                    },
                    {
                        label: i18n.download_validTo,
					    property: "ValidTo",
					    type: sap.ui.export.EdmType.String,
                        width: "12rem"
                    }
                ],
                columnsVendor: [
                    {
                        label: i18n.download_vendor,
					    property: "CNPJ",
					    type: sap.ui.export.EdmType.String,
                        width: "8rem"
                    },
                    {
                        label: i18n.download_name,
					    property: "nome",
					    type: sap.ui.export.EdmType.String,
                        width: "28rem"
                    },
                    {
                        label: i18n.download_registration,
					    property: "inscricao",
					    type: sap.ui.export.EdmType.String,
                        width: "8rem"
                    },
                    {
                        label: i18n.download_cityName,
					    property: "cidade",
					    type: sap.ui.export.EdmType.String,
                        width: "8rem"
                    },
                    {
                        label: i18n.download_UF,
					    property: "UF",
					    type: sap.ui.export.EdmType.String,
                        width: "2rem"
                    }
                ]
			};
		}
	};
});