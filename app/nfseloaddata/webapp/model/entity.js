sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function(JSONModel) {
	"use strict";

	return {
		initSelectionModel: function() {
			return {
			    selectionFile: "",
				selectionCheckCompany: true,
				selectionCheckSchedule: false,
				selectionCheckException: false,
				selectionCheckVendor: false,
                State: {
					selectionFile: {
						Enabled: true,
						ValueState: sap.ui.core.ValueState.None,
						ValueStateText: ""
					},
					selectionCheckCompany: {
						Enabled: true,
						ValueState: sap.ui.core.ValueState.None,
						ValueStateText: ""
					},
					selectionCheckSchedule: {
						Enabled: true,
						ValueState: sap.ui.core.ValueState.None,
						ValueStateText: ""
					},
					selectionCheckException: {
						Enabled: true,
						ValueState: sap.ui.core.ValueState.None,
						ValueStateText: ""
					},
					selectionCheckVendor: {
						Enabled: true,
						ValueState: sap.ui.core.ValueState.None,
						ValueStateText: ""
					}
                }
			};
		}
	};
});