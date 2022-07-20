sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function(JSONModel) {
	"use strict";

	return {
		initSelectionModel: function() {
			return {
			    selectionDate: null,
				selectionButton:null,
				selectionButtonSend: null,
				selectionButtonUpStatus: false,
				selectionButtonIgnore: null,
				selectionButtonCancel: false,
                State: {
					selectionDate: {
						Enabled: true,
						ValueState: sap.ui.core.ValueState.None,
						ValueStateText: ""
					},
					selectionButton: {
						Enabled: false,
						ValueState: sap.ui.core.ValueState.None,
						ValueStateText: ""
					}
                }
			};
		}
	};
});