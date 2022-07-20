sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
	"sap/ui/model/odata/type/DateTimeOffset"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, DateTimeOffset) {
	"use strict";

	return BaseController.extend("com.santander.nfse.app.nfseschedulelog.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {

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

		onBeforeRebindTable: function (oEvent) {
			let mBindingParams = oEvent.getParameter("bindingParams");
			let oMultiInput   = this.byId("createdAtInput");
			let oInput 		  = oMultiInput.getTokens()[0];
			
			if(oInput != undefined){
				let oValue = oInput.getTooltip();

				let oFormatOptions = {
						pattern: "y-mm-d HH:mm:ss",
						relativeScale: "auto",
						relativeStyle: "wide",
						style: "medium"
					};
				let oConstraints = { 
						nullable: false,
						precision: false,
						v4: false 
					};

				let DataFormat =  new DateTimeOffset(oFormatOptions, oConstraints);

				const { dateBegin, dateEnd } = this._formatDate(oValue);
				
				let date1 = DataFormat.parseValue(dateBegin, "object");
				let date2 = DataFormat.parseValue(dateEnd, "object");
				
				let newFilter = new Filter("createdAt", FilterOperator.BT, date1, date2);

				if (dateBegin.length > 0) {
					mBindingParams.filters.push(newFilter);
				}
			}
		},



		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject : function (oItem) {
            
           //Somente para ODATA V4 
           /*
            var that = this;

			oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
				that.getRouter().navTo("object", {
					objectId_Old: oItem.getBindingContext().getProperty("ID"),
					objectId : sObjectPath.slice("/NotasFiscais".length) // /Products(3)->(3)
				});
            });
            */
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


		_formatDate: function (sValue) {
			let dateBegin, 
				monthBegin, 
				date1;

			let dateEnd, 
				monthEnd, 
				date2;

			let day1, 
				month1, 
				year1,
				day2, 
				month2, 
				year2;
			

			if(sValue.length === 17) {
				date1  = sValue.substring(1, 17).replaceAll('de', '').replaceAll(' ', '');
				date2  = sValue.substring(1, 17).replaceAll('de', '').replaceAll(' ', '');

				monthBegin = this._changeToNumber(date1.substring(1, 4));
				monthEnd   = this._changeToNumber(date2.substring(1, 4));

				day1  = date1.substring(0, 1);
				day2  = date2.substring(0, 1);
				year1 = date1.substring(4, 8);
				year2 = date2.substring(4, 8);

			}else if(sValue.length === 18){
				date1  = sValue.substring(1, 18).replaceAll('de', '').replaceAll(' ', '');
				date2  = sValue.substring(1, 18).replaceAll('de', '').replaceAll(' ', '');

				monthBegin = this._changeToNumber(date1.substring(2, 5));
				monthEnd   = this._changeToNumber(date2.substring(2, 5));

				day1 = date1.substring(0, 2);
				day2 = date2.substring(0, 2);
				year1 = date1.substring(5, 9);
				year2 = date2.substring(5, 9);

			}else if(sValue.length === 36 || sValue.length === 35){
				date1  = sValue.substring(0, 16).replaceAll('de', '').replaceAll(' ', '');
				date2  = sValue.substring(19, 36).replaceAll('de', '').replaceAll(' ', '');
				if(date1.length === 8) {
					monthBegin = this._changeToNumber(date1.substring(1, 4));
					day1 = date1.substring(0, 1);
					year1 = date1.substring(4, 8);
				}else {
					monthBegin = this._changeToNumber(date1.substring(2, 5));
					day1 = date1.substring(0, 2);
					year1 = date1.substring(5, 9);
				}
				
				if(date2.length === 8) {
					monthEnd   = this._changeToNumber(date2.substring(1, 4));
					day2 = date2.substring(0, 1);
					year2 = date2.substring(4, 8);
				}else {
					monthEnd   = this._changeToNumber(date2.substring(2, 5));
					day2 = date2.substring(0, 2);
					year2 = date2.substring(5, 9);
				}
				
			}else {
				date1  = sValue.substring(0, 17).replaceAll('de', '').replaceAll(' ', '');
				date2  = sValue.substring(20, 37).replaceAll('de', '').replaceAll(' ', '');

				monthBegin = this._changeToNumber(date1.substring(2, 5));
				monthEnd   = this._changeToNumber(date2.substring(2, 5));

				day1 = date1.substring(0, 2);
				day2 = date2.substring(0, 2);
				year1 = date1.substring(5, 9);
				year2 = date2.substring(5, 9);
			}

			

			if(monthBegin >=1 && monthBegin <=9){
				date1  = date1.replace(date1.substring(1, 4), `0${monthBegin}`);
				month1 = date1.substring(1, 3);
			}else {
				date1  = date1.replace(date1.substring(1, 4), monthBegin);
				month1 = date1.substring(2, 4);
			}
			if(monthEnd >=1 && monthEnd <=9){
				date2  = date2.replace(date2.substring(1, 4), `0${monthEnd}`);
				month2 = date2.substring(1, 3);
			}else {
				date2  = date2.replace(date2.substring(1, 4), monthEnd);
				month2 = date2.substring(2, 4);
			}

			if(day1 >= 1 && day1 <=9){
				dateBegin = `${year1}-${month1}-0${day1} 00:00:00`;
			}else {
				dateBegin = `${year1}-${month1}-${day1} 00:00:00`;
			}

			if(day2 >= 1 && day2 <=9){
				dateEnd   = `${year2}-${month2}-0${day2} 23:59:59`;
			}else {
				dateEnd   = `${year2}-${month2}-${day2} 23:59:59`;
			}

			return { dateBegin, dateEnd };
		},

		_changeToNumber: function(sValue) {
			switch (sValue) {
				case "jan":
					return 1
					break;
				case "fev":
					return 2
					break;
				case "mar":
					return 3
					break;
				case "abr":
					return 4
					break;
				case "mai":
					return 5
					break;
				case "jun":
					return 6
					break;
				case "jul":
					return 7
					break;
				case "ago":
					return 8
					break;
				case "set":
					return 9
					break;
				case "out":
					return 10
					break;
				case "nov":
					return 11
					break;
				case "dez":
					return 12
					break;
				default:
					break;
			}
		}
	});
});