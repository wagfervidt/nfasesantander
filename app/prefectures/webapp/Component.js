sap.ui.define(['sap/fe/core/AppComponent'], function(AppComponent) {
    'use strict';

    return AppComponent.extend("com.santander.nfse.app.prefectures.Component", {
        metadata: {
            manifest: "json"
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * The base AppComponent does most common things, we only add a listener for the Shell's logout button.
         * @public
         * @override
         */
        init : function () {
            // call the AppComponent's init function
            AppComponent.prototype.init.apply(this, arguments);

            // register for the Ushell's logout event
            sap.ushell.Container.attachLogoutEvent(this.doLogout);
        }        
    });
});
