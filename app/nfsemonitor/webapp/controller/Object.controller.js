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
    "sap/m/Dialog",
	"sap/m/DialogType",
    "sap/m/Button",
	"sap/m/ButtonType",
    "sap/m/Text",
	"sap/m/TextArea"
], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, FilterType, MessageToast, MessageBox, PDFViewer, Dialog, DialogType, Button, ButtonType, Text, TextArea) {
	"use strict";

	return BaseController.extend("com.santander.nfse.app.nfsemonitor.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function (oEvent) {
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


        onPressSave: function(oEvent){
            let oObject     = this.getView().getBindingContext().getObject(),
                aFieldValid = this.getModel("fieldControl").getData();
 
            if ((oObject.srvPO      !== null && oObject.srvPO      !== "") ||
                (oObject.srvAccount !== null && oObject.srvAccount !== "")) {

                MessageBox.warning(this.getResourceBundle().getText("messageSaveWarning"),{
                    actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
                    onClose: function(oAction) {
                        if(oAction === MessageBox.Action.YES) {
                            if(oObject.upPDF === true) {
                                this.setAppBusy(true);

                                //Como eu tenho duas requisições assincronas e a segunda depende da resposta da primeira, 
                                //é preciso crair uma promisse, para que seja feita a requisição e espere a resposta da primeira
                                //e dps seguir para proxima requisição
                                let promisseSaveData = new Promise(
                                    function(resolve, reject){
                                        this.getModel().submitChanges({
                                            success: function(oData){
                                                resolve(oData);
                                            }.bind(this),
                                            error: function(oError){
                                                reject(oError);
                                            }.bind(this)
                                        });
                                    }.bind(this)
                                );

                                promisseSaveData.then(function(oData){
                                    new Promise(
                                        function(resolve, reject) { 
                                            this.getModel().callFunction('/updateNotaFiscalStatusIndividual', {
                                                method: 'POST',
                                                urlParameters: {
                                                    ID: oObject.ID,
                                                    status_nfseStatus:oObject.status_nfseStatus,
                                                    newStatus: 6
                                                },
                                                success: function(oData) {
                                                    resolve(oData);
                                                }.bind(this),
                                                error: function(oError) {
                                                    reject(oError);
                                                }.bind(this)
                                            });
                                        }.bind(this)
                                        ).then(function(oData){
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
                                                this.getModel().callFunction("/nfsePost",{
                                                    method:"POST", 
                                                    urlParameters: { ID: oObject.ID }, 
                                                    success: function(response) {
                                                        this.setAppBusy(false);

                                                        aFieldValid.selectionButtonIgnore = false;
                    
                                                        this.getRouter().navTo("worklist", {}, true);
                                                        this.getModel().refresh(true);
                    
                                                        this._onMessageToast(
                                                            this.getResourceBundle().getText("messageSendSuccess"),
                                                            {closeOnBrowserNavigation: false}
                                                        );
                                                        this.getModel().refresh(true);
                                                        this.getModel("fieldControl").refresh(true);
                                                    }.bind(this),
                                                    error: function(err) {                                          
                                                        this.setAppBusy(false);

                                                        aFieldValid.selectionButtonIgnore = true;
                                                        aFieldValid.selectionButtonSend   = true;
                                                        this.getModel("fieldControl").refresh(true);
                   
                                                        this.getModel().refresh(true);
                                                        MessageBox.error(this.getResourceBundle().getText("messageSendError"));
                                                        this.getModel().refresh(true);
                                                    }.bind(this)
                                                });
                                            }
                                        }.bind(this)
                                        //Resposta da Promisse se for Error
                                        ).catch(
                                            function(error){
                                                this.setAppBusy(false);

                                                this.getModel().refresh(true);
                                                MessageBox.error(this.getResourceBundle().getText("messageSendError"));
                                                this.getModel().refresh(true);
                                            }.bind(this)
                                        );
                                    }.bind(this)
                                ).catch(function(oError){
                                    MessageBox.error(this.getResourceBundle().getText("messageSaveErrorData"));
                                }.bind(this));                                
                            }else {
                                this.setAppBusy(true);

                                let promiseSubmitChanges = new Promise(
                                    function(resolve, reject){
                                        this.getModel().submitChanges({
                                            success: function(oData){
                                                resolve(oData);
                                            }.bind(this),
                                            error: function(oError){
                                                reject(oError);
                                            }.bind(this)
                                        });
                                    }.bind(this)
                                )

                                promiseSubmitChanges.then(
                                    function(oData){
                                        this.getModel().callFunction('/updateNotaFiscalStatusIndividual', {
                                            method: 'POST',
                                            urlParameters: {
                                                ID: oObject.ID,
                                                status_nfseStatus:oObject.status_nfseStatus,
                                                newStatus: 6
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
        
                                                    aFieldValid.selectionButtonIgnore = true;
                                                    aFieldValid.selectionButtonSend   = true;
                                                    this.getModel("fieldControl").refresh(true);
        
                                                    this._onMessageToast(
                                                        this.getResourceBundle().getText("messageSaveSendError"), 
                                                        {duration: 4000}
                                                    );
                                                    this.getModel().refresh(true);
                                                }
                                            }.bind(this),
                                            error: function(oError) {
                                                this.setAppBusy(false);
        
                                                MessageBox.error(this.getResourceBundle().getText("messageSaveError"));
                                                this.getModel().refresh(true);
                                            }.bind(this)
                                        });
                                    }.bind(this)
                                ).catch(
                                    function(oError){
                                        MessageBox.error(this.getResourceBundle().getText("messageSaveErrorData"));
                                    }.bind(this)
                                );
                            }
                        }
                    }.bind(this)
                });
            } else {
                MessageBox.error(this.getResourceBundle().getText("messageErrorPO"));
            }
        },

        onPressSend: function(oEvent){
            let oObject     = this.getView().getBindingContext().getObject(),
                aFieldValid = this.getModel("fieldControl").getData(),
                oModel      = this.getModel();
           
            if(oObject.upPDF === true){
                this.setAppBusy(true);

                oModel.callFunction("/nfsePost",{
                    method:"POST", 
                    urlParameters: { ID: oObject.ID }, 
                    success: res => {
                        this.setAppBusy(false);

                        if(res.results[0].status_status === 1){
                            MessageBox.error(this.getResourceBundle().getText("messageSendError"));
                        }else{
                            this._onMessageToast(this.getResourceBundle().getText("messageSendSuccess"), {
                                closeOnBrowserNavigation: false
                            });
    
                            aFieldValid.selectionButtonIgnore = false;
                            aFieldValid.selectionButtonSend   = false;
                            this.getModel("fieldControl").refresh(true);
                             
                            this.getRouter().navTo("worklist", {}, true);
                            oModel.refresh(true);
                        }
                    }, 
                    error: error => {
                        this.setAppBusy(false);
                        MessageBox.error(this.getResourceBundle().getText("messageSendError"));
                        this.getModel().refresh(true);
                    }
                });
            }else {
                this._onMessageToast(this.getResourceBundle().getText("messageSendPDFError"), { 
                    duration: 4000
                });
                this.getModel().refresh(true);
            } 
        },

        onPressSendPending: function(oEvent) {
            let oObject     = this.getView().getBindingContext().getObject(),
                aFieldValid = this.getModel("fieldControl").getData();

            MessageBox.warning(this.getResourceBundle().getText("messageSendWarningPending"), {
                actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
				onClose: function(oAction) {
                    if(oAction === MessageBox.Action.YES){
                        if(oObject.upPDF === true){
                            //Como eu tenho duas requisições assincronas e a segunda depende da resposta da primeira, 
                            //é preciso crair uma promisse, para que seja feita a requisição e espere a resposta da primeira
                            //e dps seguir para proxima requisição
                            this.setAppBusy(true);
                            let promisseSubmit = new Promise(
                                function(resolve, reject) { 
                                    this.getModel().callFunction('/updateNotaFiscalStatusIndividual', {
                                        method: 'POST',
                                        urlParameters: {
                                            ID: oObject.ID,
                                            status_nfseStatus:oObject.status_nfseStatus,
                                            newStatus: 6
                                        },
                                        success: function(oData) {
                                            resolve(oData);
                                        }.bind(this),
                                        error: function(oError) {
                                            reject(oError);
                                        }.bind(this)
                                    });
                                }.bind(this)
                            );
                            
                            //Resposta da Promisse se for Success
                            promisseSubmit
                                .then(function(oData){
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
                                        this.getModel().callFunction("/nfsePost",{
                                            method:"POST", 
                                            urlParameters: { ID: oObject.ID }, 
                                            success: function(response) {
                                                //Seto false para que pare de mostrar que está carregando tela 
                                                this.setAppBusy(false);

                                                aFieldValid.selectionButtonIgnore = false;
                                                this.getModel("fieldControl").refresh(true);

                                                //chama a tela Worklist
                                                this.getRouter().navTo("worklist", {}, true);
                                                //Atualizo o Model
                                                this.getModel().refresh(true);

                                                this._onMessageToast(
                                                    this.getResourceBundle().getText("messageSendSuccess"),
                                                    {closeOnBrowserNavigation: false}
                                                );
                                                this.getModel().refresh(true);
                                            }.bind(this),
                                            error: function(oError) {                  
                                                //Seto false para que pare de mostrar que está carregando tela                         
                                                this.setAppBusy(false);

                                                aFieldValid.selectionButtonIgnore = true;
                                                aFieldValid.selectionButtonSend   = true;
                                                this.getModel("fieldControl").refresh(true);

                                                //Atualizo o Model
                                                this.getModel().refresh(true);
                                                MessageBox.error(this.getResourceBundle().getText("messageSendError"));
                                                //Atualizo o Model
                                                this.getModel().refresh(true);
                                            }.bind(this)
                                        });
                                    }
                                }.bind(this)
                            //Resposta da Promisse se for Error
                            ).catch(function(error){
                                    //Seto false para que pare de mostrar que está carregando tela
                                    this.setAppBusy(false);

                                    //Atualizo o Model
                                    this.getModel().refresh(true);
                                    MessageBox.error(this.getResourceBundle().getText("messageSendError"));
                                    //Atualizo o Model
                                    this.getModel().refresh(true);
                                }.bind(this)
                            );
                        }else {
                            this.setAppBusy(true);

                            this.getModel().callFunction('/updateNotaFiscalStatusIndividual', {
                                method: 'POST',
                                urlParameters: {
                                    ID: oObject.ID,
                                    status_nfseStatus:oObject.status_nfseStatus,
                                    newStatus: 6
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

                                        aFieldValid.selectionButtonIgnore = true;
                                        aFieldValid.selectionButtonSend   = true;
                                        this.getModel("fieldControl").refresh(true);
                                                
                                        this._onMessageToast(
                                            this.getResourceBundle().getText("messageSendPDFError"), 
                                            {duration: 4000}
                                        );
                                        this.getModel().refresh(true);
                                    }
                                }.bind(this),
                                error: function(oError) {
                                    this.setAppBusy(false);

                                    MessageBox.error(this.getResourceBundle().getText("messageSendError"));
                                    this.getModel("fieldControl").refresh(true);
                                    this.getModel().refresh(true);
                                }.bind(this)
                            });
                        }
                    }
                }.bind(this)
            });
        },

        onPressAdjust: function(oEvent){    
            let oObject     = this.getView().getBindingContext().getObject(),
                aFieldValid = this.getModel("fieldControl").getData();

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

                        aFieldValid.selectionButtonIgnore = true;
                        aFieldValid.selectionButtonSend   = false;
                        this.getModel("fieldControl").refresh(true);

                        this.getRouter().navTo("worklist", {}, true);
                        this.getModel().refresh(true);
        
                        this._onMessageToast(
                            this.getResourceBundle().getText("messageAdjustSuccess"), 
                            {closeOnBrowserNavigation: false}
                        );
                        this.getModel().refresh(true);
                    }
                }.bind(this),
                error: function(oError) {
                    this.setAppBusy(false);

                    MessageBox.error(this.getResourceBundle().getText("messageAdjustError"));
                    this.getModel().refresh(true);
                }.bind(this)
            });
        },

        onPressIgnore: function(oEvent){
            let aFieldValid = this.getModel("fieldControl").getData();

            MessageBox.warning(this.getResourceBundle().getText("messageIgnore"), {
                actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
				onClose: function(oAction) {
                    if(oAction === MessageBox.Action.YES){
                        let oObject = this.getView().getBindingContext().getObject();

                        this.setAppBusy(true);

                        this.getModel().callFunction('/updateNotaFiscalStatusIndividual', {
                            method: 'POST',
                            urlParameters: {
                                ID: oObject.ID,
                                status_nfseStatus:oObject.status_nfseStatus,
                                newStatus: 11
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

                                    aFieldValid.selectionButtonIgnore = false;
                                    aFieldValid.selectionButtonSend   = false;
                                    this.getModel("fieldControl").refresh(true);

                                    this.getRouter().navTo("worklist", {}, true);
                                    this.getModel().refresh(true);

                                    this._onMessageToast(
                                    this.getResourceBundle().getText("messageIgnoreSuccess"), 
                                        {closeOnBrowserNavigation: false}
                                    );
                                    this.getModel().refresh(true);
                                }
                            }.bind(this),
                            error: function(oError) {
                                this.setAppBusy(false);
                                MessageBox.error(this.getResourceBundle().getText("messageIgnoreError"));
                                this.getModel().refresh(true);
                            }.bind(this)
                        });
                        
                    }
                }.bind(this)
            });
        },

        onPressCancel: function(oEvent){
            MessageBox.warning(this.getResourceBundle().getText("messageCancel"), {
                actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
				onClose: function(oAction) {
                    if(oAction === MessageBox.Action.YES){
                        let oObject = this.getView().getBindingContext().getObject();
                        
                        //Coloco a tela do usuário em aguarde(carregando)
                        this.setAppBusy(true);

                        this.getModel().callFunction('/updateNotaFiscalStatusIndividual', {
                            method: 'POST',
                            urlParameters: {
                                ID: oObject.ID,
                                status_nfseStatus:oObject.status_nfseStatus,
                                newStatus: 9
                            },
                            success: function(oData){
                                //Tiro a tela do usuário do aguarde(carregando)
                                this.setAppBusy(false);

                                this.getRouter().navTo("worklist", {}, true);
                                this.getModel().refresh(true);

                                MessageToast.show(this.getResourceBundle().getText("messageCancelSuccess"));
                            }.bind(this),
                            error: function(oError){
                                //Tiro a tela do usuário do aguarde(carregando)
                                this.setAppBusy(false);
                                
                                this.getModel().refresh(true);
                                MessageToast.show(this.getResourceBundle().getText("messageCancelError"));
                            }.bind(this)
                        });

                    }
                }.bind(this)
            });
        },
        
        onPressPDF: function (oEvent) {
            let oObject = oEvent.getSource().getBindingContext().getObject();
			let xmlHttp = new XMLHttpRequest();
			let oModel = this.getModel("catalog");
			
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
                        oDataModel.metadataLoaded().then(function (oData) {
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

                return new Promise(resolve =>{
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
		},

        _onMessageToast: function(mensagem, object) {
            MessageToast.show(mensagem, object);
        },

        _onSubmitChange: function(oNumber, oMessageSuccess, oMessageError, oObject, oNav) {
            let sPath = this.getView().getBindingContext().getPath();

            this.getView().getModel().setProperty(sPath + "/status_nfseStatus", oNumber );

            this.getModel().submitChanges({
                success: res => {
                    this._onMessageToast(this.getResourceBundle().getText(oMessageSuccess), oObject);

                    if(oNav === true){
                        this.getRouter().navTo("worklist", {}, true);
                        this.getModel().refresh();
                    }else {
                        this.getModel().refresh();
                    }
                    this.getModel().refresh();
                },
                error: error => {
                    MessageBox.error(this.getResourceBundle().getText(oMessageError));
                    this.getModel().refresh();
                }
            });
        }

	});

});