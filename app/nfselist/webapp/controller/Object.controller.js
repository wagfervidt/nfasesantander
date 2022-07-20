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

	return BaseController.extend("com.santander.nfse.app.nfselist.controller.Object", {

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
            let iOriginalBusyDelay,
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
            //Instantiate PDF Viewer
            this._pdfViewer = new PDFViewer();
			this.getView().addDependent(this._pdfViewer);
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
			let sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				// eslint-disable-next-line sap-no-history-manipulation
				// eslint-disable-next-line no-undef
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

        onLiveChangeNumber: function(oEvent){
            let oInput = oEvent.getSource();
            let val    = oInput.getValue();

            val = val.replace(/[^\d]/g, '');
            oInput.setValue(val);
        },

        onPressPDF: function(oEvent) {
            let oObject = oEvent.getSource().getBindingContext().getObject();
			let xmlHttp = new XMLHttpRequest();
			let oModel  = this.getModel("catalog");

    		xmlHttp.open("GET", `${oModel.sServiceUrl}NotasFiscais(${oObject.ID})/CatalogService.getPDF()`, false );
			xmlHttp.send(null);
			const { value: hexPDF } = JSON.parse(xmlHttp.responseText);      

			let byteArray = new Uint8Array(hexPDF.length/2);
			for (let x = 0; x < byteArray.length; x++){
				byteArray[x] = parseInt(hexPDF.substr(x*2,2), 16);
			}
			let blob    = new Blob([byteArray], {type: "application/pdf"});
			let _pdfurl = URL.createObjectURL(blob);

            this._pdfViewer.setSource(_pdfurl);
            jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
            this._pdfViewer.setTitle(`NFS-e Número ${oObject.nfseNo}`);

            this._pdfViewer.open();
		}, 

		onPressReconsider: function(oEvent) {
			//Do item selecionado eu pego os logs da Nota Fiscal
			let oObjectLog = oEvent.getSource().getBindingContext().getObject("Log"),  
				oObject    = oEvent.getSource().getBindingContext().getObject(),
				validUser  = this.getModel("keyUserGeneration").getData();

			if(oObjectLog.length === 0){
				this.setAppBusy(true);

				this.getModel().callFunction('/updateNotaFiscalStatusIndividual', {
					method: 'POST',
					urlParameters: {
						ID: oObject.ID,
						status_nfseStatus:oObject.status_nfseStatus,
						newStatus: 5
					},
					success: function(oData) {
						let errorStatus = oData.updateNotaFiscalStatusIndividual.errorStatus ? true : false;

						if(errorStatus){
							this.setAppBusy(false);

							MessageBox.error(oData.updateNotaFiscalStatusIndividual.errorMessage,{
								actions: [MessageBox.Action.OK],
								onClose: function(oAction) {
									if(oAction === MessageBox.Action.OK){
										this.getRouter().navTo("worklist", {}, true);
										this.getModel().refresh(true);
									}
								}.bind(this)
							});
						}else{
							this.setAppBusy(false);

							MessageToast.show(
								this.getResourceBundle().getText("messageAdjustSuccess"),
								{duration: 6000}
							);
							validUser.keyUser = false;

							this.getModel().refresh(true);
							this.getModel("keyUserGeneration").refresh(true);
							this.getModel().refresh(true);
						}
					}.bind(this),
					error: function(oError) {
						this.setAppBusy(false);

                        MessageBox.error(this.getResourceBundle().getText("messageSendError"));
						this.getModel().refresh();
					}.bind(this)
				});

			}else {
				let oPath = oObjectLog[oObjectLog.length - 1]
				    
				this.setAppBusy(true);
				//Como eu tenho duas requisições assincronas e a segunda depende da resposta da primeira, 
				//é preciso crair uma promisse, para que seja feita a requisição e espere a resposta da primeira
				//e dps seguir para proxima requisição
				let promisseLog = new Promise(
					function(resolve, reject){
						//Busco a ultimo Log da nota
						this.getModel().read("/" + oPath, {
							success: function(res) {
								resolve(res);
							}.bind(this),
							error: function(error) {
								reject(error);
							}.bind(this)
						});
					}.bind(this)
				);
				
				//Resposta da Promisse se for Success
				promisseLog.then(
					function(res){
						this.getModel().callFunction('/updateNotaFiscalStatusIndividual', {
							method: 'POST',
							urlParameters: {
								ID: oObject.ID,
								status_nfseStatus:oObject.status_nfseStatus,
								newStatus: res.oldStatus_nfseStatus
							},
							success: function(oData) {
								let errorStatus = oData.updateNotaFiscalStatusIndividual.errorStatus ? true : false;

								if(errorStatus){
									this.setAppBusy(false);

									MessageBox.error(oData.updateNotaFiscalStatusIndividual.errorMessage,{
										actions: [MessageBox.Action.OK],
										onClose: function(oAction) {
											if(oAction === MessageBox.Action.OK){
												this.getRouter().navTo("worklist", {}, true);
												this.getModel().refresh(true);
											}
										}.bind(this)
									});
								}else{
									this.setAppBusy(false);    

									MessageToast.show(
										this.getResourceBundle().getText("messageAdjustSuccess"),
										{duration: 6000}
									);
									validUser.keyUser = false;

									this.getModel().refresh(true);
									this.getModel("keyUserGeneration").refresh(true);
									this.getModel().refresh(true);
								}
							}.bind(this),
							error: function(oError) {
								this.setAppBusy(false);

								MessageBox.error(this.getResourceBundle().getText("messageSendError"));

								this.getModel().refresh(true);
							}.bind(this)
						});
					}.bind(this)
				//Resposta da Promisse se for Error
				).catch(
					function(error){
						this.setAppBusy(false);

						MessageBox.error(this.getResourceBundle().getText("messageReconsiderError"));
						this.getModel().refresh(true);
					}.bind(this)
				);

			}
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
				var sObjectPath = this.getModel().createKey("NotasFiscais", {
					ID :  sObjectId
				});
                this._bindView("/" + sObjectPath);
                
                //Biding para Logs

                this._bindViewLog("/NotasFiscaisLog",sObjectId);
                
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
                    expand: 'company,prefecture,status,city,srvCity,Log,PostLog'
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


        _bindViewLog : function (sObjectPath, sObjectId) {

            this._rebindTable("tableLog", sObjectPath, [new Filter("NotaFiscal_ID", FilterOperator.EQ, sObjectId)], 'oldStatus,newStatus')
           
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
			let oView 			= this.getView(),
				oViewModel		= this.getModel("objectView"),
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


            let oResourceBundle = this.getResourceBundle(),
				oObject 		= oView.getBindingContext().getObject(),
				sObjectId	    = oObject.ID,
                sObjectName 	= oObject.nfseNo,
                sObjectStatus 	= oObject.status_nfseStatus;



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