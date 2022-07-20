sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function(JSONModel) {
	"use strict";

	return {
		initSelectionModel: function() {
			return {
			    selectionPrefectureName: "",
                State: {
					selectionPrefectureName: {
						Enabled: true,
						ValueState: sap.ui.core.ValueState.None,
						ValueStateText: ""
					}
                }
			};
		}
	};
});