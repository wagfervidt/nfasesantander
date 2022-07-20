sap.ui.define([] , function () {
	"use strict";

	return {
        
        nfseStatusState: function(status) {
			
           switch (status) {
               case 1: //Read error
                   return "Error";
               case 2: //Transform error
                   return "Error";
               case 3: //Canceled
                   return "Success";
               case 4: //Excepted
                   return "None";
               case 5: //Pending Info
                   return "Warning";
               case 6: //Pending Send
                   return "Information";
               case 7: //Pending Send Cancel
                   return "Information";
               case 8: //Send Error
                   return "Error";         
               case 9: //Cancel Processed
                   return "Success";
               case 10: //Processed
                   return "Success"; 
                case 11: //Not considered manually
                    return "None";                                                                                                                                                                           
               default:
                   return "None";
           }
        },
        nfseStatusIcon: function(status) {
			
           switch (status) {
               case 1: //Read error
                   return "sap-icon://status-error";
               case 2: //Transform error
                   return "sap-icon://status-error";
               case 3: //Canceled
                   return "sap-icon://message-success";
               case 4: //Excepted
                   return "sap-icon://status-inactive";
               case 5: //Pending Info
                   return "sap-icon://message-warning";
               case 6: //Pending Send
                   return "sap-icon://pending";
               case 7: //Pending Send Cancel
                   return "sap-icon://pending";
               case 8: //Send Error
                   return "sap-icon://message-error";         
               case 9: //Cancel Processed
                   return "sap-icon://message-success";
               case 10: //Processed
                   return "sap-icon://message-success";
               case 11: //Not considered manually
                    return "sap-icon://status-inactive";                                                                                                                                                                                  
               default:
                   return "sap-icon://status-inactive";
           }
		},        
        



		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit : function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		}

	};

});