sap.ui.define([
	"./BaseController",
	"../model/entity",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
], function (BaseController, Entity, MessageToast, MessageBox) {
	"use strict";

    return BaseController.extend("com.santander.nfse.app.nfseloadcompref.controller.Main", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		onInit : function () { 
			this.getRouter().getRoute("main").attachPatternMatched(this._onObjectMatched.bind(this), this);
		},

		onWizardStepValidation: function(oEvent) {
			let	aFieldsControl = this.getModel("fieldControl").getData(),
				bValid         = true;

			if (this._wizard) {		
				if(aFieldsControl.selectionPrefectureName === ""){
					aFieldsControl.State.selectionPrefectureName.ValueState     = sap.ui.core.ValueState.Error;
					aFieldsControl.State.selectionPrefectureName.ValueStateText = this.getResourceBundle().getText("validationFieldRequired");
					bValid = false;
				}else {
					aFieldsControl.State.selectionPrefectureName.ValueState     = sap.ui.core.ValueState.None;
					aFieldsControl.State.selectionPrefectureName.ValueStateText = "";
				}
							
				this.getModel("fieldControl").refresh();

				if(!bValid) {
					this._wizard.invalidateStep(this.byId("selectionPrefecture"));
				} else {
					this._wizard.validateStep(this.byId("selectionPrefecture"));
				}
			}
		},

		onWizardCompletedHandler: function() {
			let aFieldsControl = this.getModel("fieldControl").getData();

			this.setAppBusy(true);

			this.getModel().callFunction("/loadCompanyPrefectures",{
				method: 'POST',
				urlParameters: { prefectureName: aFieldsControl.selectionPrefectureName },
				success: function(oData) {
					this.setAppBusy(false);

					if(oData.results[0].messageError){
						MessageBox.warning(this.getResourceBundle().getText("messageWarningPrefectureCompanies"));

						this._wizard.discardProgress(this.byId("selectionPrefecture"));
						this._wizard.invalidateStep(this.byId("selectionPrefecture"));
					}else {

						aFieldsControl.State.selectionPrefectureName.Enabled = false;
						this.getModel("fieldControl").refresh(true);

						this.getModel("logsCompanyPrefecture").setData({
							logs: oData.results,
							simulation: true
						});
						this.getModel("logsCompanyPrefecture").refresh(true);

						this._oNavContainer.to(this._oWizardReviewPage);
					}
				}.bind(this),
				error: function(oError) {
					this.setAppBusy(false);

					MessageBox.error(this.getResourceBundle().getText("messageErrorLoadPrefecture"));

					this._wizard.discardProgress(this.byId("selectionPrefecture"));
					this._wizard.invalidateStep(this.byId("selectionPrefecture"));
				}.bind(this)
			});
		},

		onRestartingDataLoading: function() {
			MessageBox.warning(this.getResourceBundle().getText("messageRestarting"), {
                actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
				onClose: function(oAction) {
                    if(oAction === MessageBox.Action.YES){
						this._handleNavigationToStep(0);
						this._discardProgress();
					}
				}.bind(this)
			});
		},
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		_onObjectMatched: function(oEvent) {
			this._wizard 			 = this.byId("CreateWizard");
			this._oNavContainer	 	 = this.byId("wizardNavContainer");
			this._oWizardContentPage = this.byId("wizardContentPage");
			this.getModel("fieldControl").setData(Entity.initSelectionModel());
			this.getModel("fieldControl").refresh(true);

			if (this._oNavContainer) {
				this._oWizardReviewPage = sap.ui.xmlfragment(this.getView().getId(),
					"com.santander.nfse.app.nfseloadcompref.view.fragments.Review", this);
				this._oNavContainer.addPage(this._oWizardReviewPage);
			}
		},

		_backToWizardContent: function () {
			this._oNavContainer.backToPage(this._oWizardContentPage.getId());
		},

		_handleNavigationToStep: function (iStepNumber) {
			let fnAfterNavigate = function () {
				this._wizard.goToStep(this._wizard.getSteps()[iStepNumber]);
				this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
			}.bind(this);

			this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
			this._backToWizardContent();
		},

		_discardProgress: function () {
			let	aFieldsControl = this.getModel("fieldControl").getData(),
				aFields 	   = ["selectionPrefectureName"];
				
			this._wizard.discardProgress(this.byId("selectionPrefecture"));

			let clearContent = function (content) {
				for (let i = 0; i < content.length; i++) {
					if (content[i].setValue) {
						content[i].setValue("");
					}

					if (content[i].getContent) {
						clearContent(content[i].getContent());
					}
				}
			};

			aFieldsControl.selectionPrefectureName= "";

			aFields.forEach(function (sField) {
				aFieldsControl.State[sField].ValueState     = sap.ui.core.ValueState.None;
				aFieldsControl.State[sField].ValueStateText = "";
				aFieldsControl.State[sField].Enabled        = true;
			}.bind(this));

			this.getModel("fieldControl").refresh(true);

			this.getModel("logsCompanyPrefecture").setData({});
			this.getModel("logsCompanyPrefecture").refresh(true);

			clearContent(this._wizard.getSteps());
			this._wizard.invalidateStep(this.byId("selectionPrefecture"));
		}
	});
});