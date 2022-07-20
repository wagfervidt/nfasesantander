/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-undef
sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/PDFViewer",
], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, FilterType, MessageToast, MessageBox, PDFViewer ) {
	"use strict";

	return BaseController.extend("com.santander.nfse.app.nfseschedulelog.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page shows busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
            var iOriginalBusyDelay,
                oViewModel = new JSONModel({
					busy : true,
                    delay : 0,
                    update : false,
				});
            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
            
            // Store original busy indicator delay, so it can be restored later on
            iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
            
            this.setModel(oViewModel, "objectView");
            
            this.getOwnerComponent().getModel().metadataLoaded().then(function () {
					// Restore original busy indicator delay for the object view
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
				}
            );

		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */


		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack : function() {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				// eslint-disable-next-line sap-no-history-manipulation
				// eslint-disable-next-line no-undef
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

        onLiveChangeNumber: function(oEvent){
            var oInput = oEvent.getSource();
            var val = oInput.getValue();
            val = val.replace(/[^\d]/g, '');
            oInput.setValue(val);
        },

 		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched : function (oEvent) {
			var sObjectId =  oEvent.getParameter("arguments").objectId;
           
            //Alterado ODATA V4 P/ V2
            //this._bindView("/NotasFiscais" + sObjectId);
            this.getModel().metadataLoaded().then( function() {
                
                //Binding para Notas Fiscais
				var sObjectPath = this.getModel().createKey("NotasFiscaisScheduleLog", {
					ID :  sObjectId
				});
                this._bindView("/" + sObjectPath);
                
			}.bind(this));
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView : function (sObjectPath) {
            var oViewModel = this.getModel("objectView");
            //Inclusão para odata v2
            var oDataModel = this.getModel();

			this.getView().bindElement({
                path: sObjectPath,
                parameters:{
                    expand: 'company,prefecture,status'
                },
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
                        // Ajuste para ODATA V2 - Não pode ser direto pq ele não está startando depois de uma promisse o _bindView
                        //oViewModel.setProperty("/busy", true);
                        oDataModel.metadataLoaded().then(function () {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},
        
        _rebindTable:function(controlId, sPath, oFilters, sExpand){
                let table       = this.getView().byId(controlId);
                let template    = table.getBindingInfo('items').template;
                let sorters     = table.getBinding('items').aSorters;

                return new Promise((resolve)=>{
                    table.bindItems({ 
                        path:       sPath,
                        template:   template,
                        parameters: {
                            expand: sExpand
                        }
                    });
                    table.getBinding('items').sort(sorters);
                    if(oFilters){
                        table.getBinding('items').filter(oFilters);
                    }
                    table.getBinding('items').attachChange(() => {
                        resolve();
                    });
                });
            },


		_onBindingChange : function () {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			
            
            //Alterado ODATA V4 P/ V2
            /*
            var oResourceBundle = this.getResourceBundle();
            oView.getBindingContext().requestObject().then((function (oObject) {
				var sObjectId = oObject.ID,
					sObjectName = oObject.docDate;


				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/shareSendEmailSubject",
					oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
					oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
            }).bind(this));
            */


            var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.ID,
                sObjectName = oObject.nfseNo,
                sObjectStatus = oObject.status_nfseStatus;



            oViewModel.setProperty("/busy", false);
            
            //Caso status seja pendente de informações, alterar pra UPDATE = TRUE para abrir os campos
            if (sObjectStatus === 5){
                oViewModel.setProperty("/update", true );    
            } else {
                oViewModel.setProperty("/update", false );    
                
            }
          


			oViewModel.setProperty("/shareSendEmailSubject",
			oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
			// eslint-disable-next-line no-undef
			oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		}

	});

});