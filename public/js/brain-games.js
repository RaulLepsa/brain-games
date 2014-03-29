/*! Brain Games */

/* Name says it all: util functions */
var utils = {

	/* Displays an alert in the DOM element 'elem', having the text 'message' */
	displayAlert: function(elem, message) {
		elem.show().html(message);
		setTimeout(function() { utils.removeAlert(elem) }, 5000);
	},

	/* Removes an alert from a certain DOM element */
	removeAlert: function(elem) {
		elem.hide().html('');
	},

	/* Removes all alers from a page */
	removeAlertsFromPage: function() {
		$('.alert').hide().html('');
	}
};