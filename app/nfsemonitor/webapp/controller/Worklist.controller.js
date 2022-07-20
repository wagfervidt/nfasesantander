sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"../model/entity",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/m/MessageToast",
    "sap/m/MessageBox",
	"sap/m/Dialog",
	"sap/m/DialogType",
    "sap/m/Button",
	"sap/m/ButtonType",
    "sap/m/Text",
	"sap/m/TextArea"
], function (BaseController, JSONModel, formatter, Entity, Filter, FilterOperator, FilterType, MessageToast, MessageBox, Dialog, DialogType, Button, ButtonType, Text, TextArea) {
	"use strict";

	return BaseController.extend("com.santander.nfse.app.nfsemonitor.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
            var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");

            // Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
            this._oTable 	   = oTable;
            
			// keeps the search state
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
                tableBusyDelay: 0,
                pendInfo: 0,
                pendSend: 0,
                pendCancel: 0,
				cancel: 0,
                sendError: 0,
                countAll: 0
			});
			this.setModel(oViewModel, "worklistView");
            
            // Create an object of filters
			this._mFilters = {
				"pendInfo":  [ new Filter("status_nfseStatus", FilterOperator.EQ, 5 )],
				"pendSend":  [ new Filter("status_nfseStatus", FilterOperator.EQ, 6) ],
				"pendCancel": [ new Filter("status_nfseStatus", FilterOperator.EQ, 7)],
				"cancel": [ new Filter("status_nfseStatus", FilterOperator.EQ, 3)],
                "sendError":  [ new Filter("status_nfseStatus", FilterOperator.EQ, 8) ],
                "countAll":  [
							new Filter({
								path: 'status_nfseStatus',
								operator: FilterOperator.EQ,
								value1: 5,
                                and: true
                            }),
							new Filter({
								path: 'status_nfseStatus',
								operator: FilterOperator.EQ,
								value1: 6,
                                and: true
                            }),
							new Filter({
								path: 'status_nfseStatus',
								operator: FilterOperator.EQ,
								value1: 7,
                                and: true
                            }),
							new Filter({
								path: 'status_nfseStatus',
								operator: FilterOperator.EQ,
								value1: 3,
                                and: true
                            }), 
							new Filter({
								path: 'status_nfseStatus',
								operator: FilterOperator.EQ,
								value1: 8,
                                and: true
                            })
                        ] 
					
            };
             
 

            // Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function(){
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});   

			this.getRouter().getRoute("worklist").attachPatternMatched(this._onObjectMatched, this);
		},


        
        onBeforeRendering : function() {
            //Fazendo filtro inicial 
            this._oTable.getBinding("items").filter(this._mFilters.countAll)

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
			// update the worklist's object counter after the table update
			var sTitle,
                oTable = oEvent.getSource(),
                oViewModel = this.getModel("worklistView"),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
                
                // Get the count for all the notas fiscais and set the value to 'countAll' property
				this.getModel().read("/NotasFiscais/$count", {
					success: function (oData) {
						oViewModel.setProperty("/countAll", oData);
                    },
                    filters: this._mFilters.countAll
                });
   
                // read the count for the information pendind filter
				this.getModel().read("/NotasFiscais/$count", {
					success: function (oData) {
						oViewModel.setProperty("/pendInfo", oData);
					},
					filters: this._mFilters.pendInfo
				});
				// read the count for the send pending filter
				this.getModel().read("/NotasFiscais/$count", {
					success: function (oData) {
						oViewModel.setProperty("/pendSend", oData);
					},
					filters: this._mFilters.pendSend
				});
				// read the count for the cancel pending filter
				this.getModel().read("/NotasFiscais/$count", {
					success: function(oData){
						oViewModel.setProperty("/pendCancel", oData);
					},
					filters: this._mFilters.pendCancel
				});
				// read the count for the cancel filter
				this.getModel().read("/NotasFiscais/$count", {
					success: function(oData){
						oViewModel.setProperty("/cancel", oData);
					},
					filters: this._mFilters.cancel
				});
				// read the count for the send error filter
				this.getModel().read("/NotasFiscais/$count", {
					success: function(oData){
						oViewModel.setProperty("/sendError", oData);
					},
					filters: this._mFilters.sendError
				});            
            } else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
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


		onSearch : function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				let aTableSearchState = [];
				let sQuery 			  = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
                    aTableSearchState = new Filter({
                        and: false,
                        filters: [
                            new Filter("nfseNo",                    FilterOperator.Contains, sQuery),
                            new Filter("vendor",                    FilterOperator.Contains, sQuery),
                            new Filter("vendorName",                FilterOperator.Contains, sQuery),
                            new Filter("status/txtStatus",          FilterOperator.Contains, sQuery),
                            new Filter("company/companyName",       FilterOperator.Contains, sQuery),
                            new Filter("prefecture/prefectureName", FilterOperator.Contains, sQuery),
                            //new Filter()
                        ]
                    })
       
				}
				this._applySearch(aTableSearchState);
			}

		},

		onSelectionDate: function(oEvent) {
			let oDateRangeSelction = this.byId("srvDueDateInput");
			let oDateRange  	   = oDateRangeSelction.getValue();
			let aTableSearchState  = [];
			
			if(oDateRange != ""){
				let dateBegin = "";
				let dateEnd   = "";

				if(oDateRange.length != 10){
					let day   = oDateRange.substring(0, 10).substring(0, 2);
					let month = oDateRange.substring(0, 10).substring(3, 5);
					let year  = oDateRange.substring(0, 10).substring(6, 10);

					let day1   = oDateRange.substring(13, 23).substring(0, 2);
					let month1 = oDateRange.substring(13, 23).substring(3, 5);
					let year1  = oDateRange.substring(13, 23).substring(6, 10);

					dateBegin = `${year}-${month}-${day}`;
					dateEnd   = `${year1}-${month1}-${day1}`;
				}else {
					let day   = oDateRange.substring(0, 10).substring(0, 2);
					let month = oDateRange.substring(0, 10).substring(3, 5);
					let year  = oDateRange.substring(0, 10).substring(6, 10);

					let day1   = oDateRange.substring(0, 10).substring(0, 2);
					let month1 = oDateRange.substring(0, 10).substring(3, 5);
					let year1  = oDateRange.substring(0, 10).substring(6, 10);

					dateBegin = `${year}-${month}-${day}`;
					dateEnd   = `${year1}-${month1}-${day1}`;
				}
				
				aTableSearchState = new Filter("srvDueDate", FilterOperator.BT, dateBegin, dateEnd);		

				if (dateBegin.length > 0) {
					this._applySearch(aTableSearchState);
				}
			}else {
				this._applySearch(aTableSearchState);
			}
		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh : function () {
			let oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/**
		 * Event handler when a filter tab gets pressed
		 * @param {sap.ui.base.Event} oEvent the filter tab event
		 * @public
		 */
		onQuickFilter: function(oEvent) {
			let oBinding     = this._oTable.getBinding("items"),
				sKey     	 = oEvent.getParameter("selectedKey"),
				fieldControl = this.getModel("fieldControl").getData();

			if(sKey === "pendInfo") {
				fieldControl.selectionButtonUpStatus = true;
			}else if(sKey === "cancel" || sKey === "pendCancel"){
				fieldControl.selectionButtonCancel   = true;
			}else {
				fieldControl.selectionButtonUpStatus = false;
				fieldControl.selectionButtonCancel   = false;
			}
			
			this.getModel("fieldControl").refresh();

			oBinding.filter(this._mFilters[sKey]);
		},

		onHandleChange: function(oEvent) {
			var bValid 		= oEvent.getParameter("valid"),
				aFieldValid = this.getModel("fieldControl").getData(); 

			if (bValid) {
				aFieldValid.State.selectionDate.ValueState     = sap.ui.core.ValueState.None;
				aFieldValid.State.selectionDate.ValueStateText = "";
				aFieldValid.State.selectionButton.Enabled      = true;
			} else {
				aFieldValid.State.selectionDate.ValueState 	   = sap.ui.core.ValueState.Error;
				aFieldValid.State.selectionDate.ValueStateText = this.getResourceBundle().getText("validationFieldRequired");
				aFieldValid.State.selectionButton.Enabled      = false;
			}

			this.getModel("fieldControl").refresh();
		},

		onHandleSend: function(oEvent) {
			let oTable = this.byId("table"),
				oItems = oTable.getSelectedItems();

			if(oItems.length != 0){
				MessageBox.warning(this.getResourceBundle().getText("messageSendsWarning"),{
					actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
					onClose: function(oAction) {
						if(oAction === MessageBox.Action.YES) {
							let aNotas = '';
	
							for(let i=0; i < oItems.length; i++){
								let oObject = oItems[i].getBindingContext().getObject();

								if(i === oItems.length-1){
									aNotas += JSON.stringify({
										ID: oObject.ID,
										status_nfseStatus: oObject.status_nfseStatus
									});
								}else{
									aNotas += JSON.stringify({
										ID: oObject.ID,
										status_nfseStatus: oObject.status_nfseStatus
									})+";";
								}
							}

							this.setAppBusy(true);
		
							this.getModel().callFunction("/updateNotaFiscalStatus",{
								method: "POST", 
                                urlParameters:  {
									Notas: aNotas,
									Status: 6
								},
								success: function (oRes) {
									this.setAppBusy(false);
									
									MessageToast.show(
										this.getResourceBundle().getText("messageSendsSuccess"),
										{closeOnBrowserNavigation: false}
									);
									this.getModel().refresh(true);
										
								}.bind(this),
								error: function (oError) {
									this.setAppBusy(false);

									MessageBox.error(this.getResourceBundle().getText("messageSendError"));
									this.getModel().refresh(true);

								}.bind(this)
							});
						}
					}.bind(this)
				});
			}else {
				MessageBox.warning(
					this.getResourceBundle().getText("messageCheckError"),
					{ actions: [MessageBox.Action.OK] }
				);
			}
		},

		onPressIgnore: function(oEvent){
			let oTable = this.byId("table"),
				oItems = oTable.getSelectedItems();

			if(oItems.length != 0){
				MessageBox.warning(this.getResourceBundle().getText("messageIgnores"),{
					actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
					onClose: function(oAction) {
						if(oAction === MessageBox.Action.YES) {
							let aNotas = '';
	
							for(let i=0; i < oItems.length; i++){
								let oObject = oItems[i].getBindingContext().getObject();
								
								if(i === oItems.length-1){
									aNotas += JSON.stringify({
										ID: oObject.ID,
										status_nfseStatus: oObject.status_nfseStatus
									});
								}else{
									aNotas += JSON.stringify({
										ID: oObject.ID,
										status_nfseStatus: oObject.status_nfseStatus
									})+";";
								}
							}

							this.setAppBusy(true);
		
							this.getModel().callFunction("/updateNotaFiscalStatus",{
								method: "POST", 
                                urlParameters:  {
									Notas: aNotas,
									Status: 11
								},
								success: function (oRes) {
									this.setAppBusy(false);
									
									MessageToast.show(
										this.getResourceBundle().getText("messageIgnoresSuccess"),
										{closeOnBrowserNavigation: false}
									);
									this.getModel().refresh(true);
										
								}.bind(this),
								error: function (oError) {
									this.setAppBusy(false);

									MessageBox.error(this.getResourceBundle().getText("messageIgnoresError"));
									this.getModel().refresh(true);

								}.bind(this)
							});
						}
					}.bind(this)
				});
			}else {
				MessageBox.warning(
					this.getResourceBundle().getText("messageCheckDesconsiderError"),
					{ actions: [MessageBox.Action.OK] }
				);
			}
            
        },

		onPressCancel: function(oEvent){
			let oTable = this.byId("table"),
				oItems = oTable.getSelectedItems();

			if(oItems.length != 0){
				MessageBox.warning(this.getResourceBundle().getText("messageCanceled"),{
					actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
					onClose: function(oAction) {
						if(oAction === MessageBox.Action.YES) {
							let aNotas = '';
		
							for(let i=0; i < oItems.length; i++){
								let oObject = oItems[i].getBindingContext().getObject();
									
								if(i === oItems.length-1){
									aNotas += JSON.stringify({
										ID: oObject.ID,
										status_nfseStatus: oObject.status_nfseStatus
									});
								}else{
									aNotas += JSON.stringify({
										ID: oObject.ID,
										status_nfseStatus: oObject.status_nfseStatus
									})+";";
								}
							}
	
							this.setAppBusy(true);
			
							this.getModel().callFunction("/updateNotaFiscalStatus",{
								method: "POST", 
								urlParameters:  {
									Notas: aNotas,
									Status: 9
								},
								success: function (oData) {
									this.setAppBusy(false);
									
									MessageToast.show(
										this.getResourceBundle().getText("messageCancelSuccess"),
										{closeOnBrowserNavigation: false}
									);
									this.getModel().refresh(true);
											
								}.bind(this),
								error: function (oError) {
									this.setAppBusy(false);
	
									MessageBox.error(this.getResourceBundle().getText("messageCancelError"));
									this.getModel().refresh(true);
	
								}.bind(this)
							});
						}
					}.bind(this)
				});
			}else {
				MessageBox.warning(
					this.getResourceBundle().getText("messageCheckCancelError"),
					{ actions: [MessageBox.Action.OK] }
				);
			}
		},

		onDonwloadPDFs: function(oEvent){
			let oTable = this.byId("table"),
				oItems = oTable.getSelectedItems();

			if(oItems.length != 0){
				this.setAppBusy(true);

				let aNotas        = "",
					aNFSeDownload = "",
					aNFSeWaiting  = "",
					pdfFalse      = 0,
					numberNFSe    = "",
					oTotal		  = 0;

					///aguardando carregamento automático de PDF
		
				for(let i=0; i < oItems.length; i++){
					let oObject = oItems[i].getBindingContext().getObject();

					if(oObject.upPDF){
						if(i === oItems.length-1){
							aNotas += oObject.ID;
						}else{
							aNotas += oObject.ID + ";";
						}

						aNFSeDownload += `Nr. NFS-e: ${oObject.nfseNo}\n`;
					}else{
						pdfFalse++;

						numberNFSe 	 += `${oObject.nfseNo}, `;
						aNFSeWaiting += `Nr. NFS-e: ${oObject.nfseNo}\n`;
					}
				}


				if(pdfFalse != 0){
					oTotal = ((oItems.length - pdfFalse) * 36) + ((oItems.length - pdfFalse) -1);
					aNotas = aNotas.substring(0, oTotal);
				}

				if(aNotas != ""){
					this.getModel().callFunction("/getMultiPDF",{
						method: "POST",
						urlParameters:  {
							notasID: aNotas,
						},
						success: function(oData){
							let jszip = new JSZip();

							if(oData.getMultiPDF.errors.length != 0){
								for(let errorPDF of oData.getMultiPDF.errors){
									aNFSeWaiting += `${errorPDF}\n`;
									numberNFSe   += errorPDF.replace(/^\D+/g, "") + ", ";

									let aNFSe = aNFSeDownload.split("\n").filter(sNFSe => {
										return !sNFSe.includes(errorPDF)
									});

									aNFSeDownload = aNFSe.join("\n");
								}
							}
							
							if(oData.getMultiPDF.pdfs.length != 0){
								for(let oPDF of oData.getMultiPDF.pdfs){
									jszip.folder("PDFs").file(`${oPDF.objectID}.pdf`, oPDF.base64, { base64: true } );
								}

								jszip.file("PDFs baixados.txt", aNFSeDownload);
								jszip.file("PDFs aguardando carregamento.txt", aNFSeWaiting);

		
								jszip.generateAsync({ type: "blob" })
								.then(function(content) {
									// see FileSaver.js
									saveAs(content, "Notas Físcais.zip");
								});
							}else{
								MessageBox.warning(this.getResourceBundle().getText("messageUpPDFsEmpty", [numberNFSe]));
							}
	
							this.setAppBusy(false);
						}.bind(this),
						error: function(oError){
							MessageBox.error(this.getResourceBundle().getText("messageDownloadPDFError"));
							this.setAppBusy(false);
						}.bind(this)
					});
				}else{
					MessageBox.warning(this.getResourceBundle().getText("messageUpPDFsEmpty", [numberNFSe]));

					this.setAppBusy(false);
				}
			}else{
				MessageBox.warning(this.getResourceBundle().getText("messageCheckDonwloadPDFs"));
			}
		},
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		_onObjectMatched: function() {
			this.getModel("fieldControl").setData(Entity.initSelectionModel());
			this.getModel("fieldControl").refresh(true);
		},
		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject : function (oItem) {
			let aFieldValid = this.getModel("fieldControl").getData(),
				oStatus 	= oItem.getBindingContext().getObject("status_nfseStatus");

			if (oStatus != 1 && oStatus != 2  && oStatus != 3 &&
				oStatus != 4 && oStatus != 5  && oStatus != 7 &&
				oStatus != 9 && oStatus != 10 && oStatus != 11 ){

				aFieldValid.selectionButtonSend   = true;
				aFieldValid.selectionButtonIgnore = true
			}else {
				if(oStatus === 5 || oStatus === 8){
					aFieldValid.selectionButtonSend   = false;
					aFieldValid.selectionButtonIgnore = true;
				}else if(oStatus === 3 || oStatus === 7){
					aFieldValid.selectionButtonCancel = true;
					aFieldValid.selectionButtonSend   = false;
					aFieldValid.selectionButtonIgnore = false;
				}else {
					aFieldValid.selectionButtonSend   = false;
					aFieldValid.selectionButtonIgnore = false;
				}			
			}
			this.getModel("fieldControl").refresh();
           
            this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("ID")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function(aTableSearchState) {
			let oTable     = this.byId("table"),
				oViewModel = this.getModel("worklistView");

			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}		
	});
});