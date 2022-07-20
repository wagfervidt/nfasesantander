sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"../model/entity",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType"
], function (BaseController, JSONModel, formatter, Entity, Filter, FilterOperator, FilterType) {
	"use strict";

	return BaseController.extend("com.santander.nfse.app.nfselist.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			this.getRouter().getRoute("worklist").attachPatternMatched(this._onObjectMatched, this);
		},

        
        onBeforeRendering : function() {

        },

        onAfterRendering : function() {

        },

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished : function (oEvent) {
			
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress : function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler for navigating back.
		 * Navigate back in the browser history
		 * @public
		 */
		onNavBack : function() {
			// eslint-disable-next-line sap-no-history-manipulation
			history.go(-1);
		},


		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh : function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},
		onSort: function () {
			var oSmartTable = this._getSmartTable();
			if (oSmartTable) {
				oSmartTable.openPersonalisationDialog("Sort");
			}
		},

		onFilter: function () {
			var oSmartTable = this._getSmartTable();
			if (oSmartTable) {
				oSmartTable.openPersonalisationDialog("Filter");
			}
		},

		onGroup: function () {
			var oSmartTable = this._getSmartTable();
			if (oSmartTable) {
				oSmartTable.openPersonalisationDialog("Group");
			}
		},



		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		_onObjectMatched: function() {
			this.getModel("keyUserGeneration").setData(Entity.initSelectionModel());
			this.getModel("keyUserGeneration").refresh(true);
		},
		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject : function (oItem) {
			let validationUser = this.getModel("keyUserGeneration").getData(),
				status_nfse    = oItem.getBindingContext().getObject("status/nfseStatus");

			if (status_nfse === 4 || status_nfse === 11){
				//Faço a leitura do keyUser para poder habilitar o botão
				this.getModel().read("/isKeyUser", {
					success: res => {
						//o res trás true ou false, eu passo esse valor para um model,
						// que eu instacio na hora em que o app é iniciado, assim tenho ele em qualquer parte do código
						validationUser.keyUser = res;
						//Depois de alterar o valor, eu atualizo o model
						this.getModel("keyUserGeneration").refresh();
					},
					//caso a requisição, de erro por causa de um erro no banco
					//é setado false para o model, pois se não sei qual use é não tem como habilitar o button
					error: error => {
						//seto false para o model, desabilitando o Button
						validationUser.keyUser = false;
						//Depois de alterar o valor, eu atualizo o model
						this.getModel("keyUserGeneration").refresh();
					}
				});
			}else {
				validationUser.keyUser = false;
				this.getModel("keyUserGeneration").refresh();
			}
			
            this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("ID")
			});
		},

        _getSmartTable: function () {
			if (!this._oSmartTable) {
				this._oSmartTable = this.getView().byId("LineItemSmartTable");
			}
			return this._oSmartTable;
		},
	});
});