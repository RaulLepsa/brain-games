var dateFormat = require('dateformat');

var _format = 'dd/mm/yyyy';

/**
 * Different utilitary server-side functions
 * @type {{formatDate: formatDate}}
 */
var utils = {

    /* Format a date to a standard format which will be used throughout the application */
    formatDate: function(date) {
        return dateFormat(date, _format);
    }
};

module.exports = utils;