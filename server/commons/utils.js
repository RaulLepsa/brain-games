var dateFormat = require('dateformat'),
    bcrypt = require('bcrypt');

var _format = 'dd/mm/yyyy';

/**
 * Different utilitary server-side functions
 */
var utils = {

    /* Format a date to a standard format which will be used throughout the application */
    formatDate: function (date) {
        return dateFormat(date, _format);
    },

    cryptPassword: function (password, callback) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return callback(err);
            }

            bcrypt.hash(password, salt, function (err, hash) {
                return callback(err, hash);
            });
        });
    },

    comparePassword: function (password, userPassword, callback) {
        bcrypt.compare(password, userPassword, function (err, isPasswordMatch) {
            if (err)
                return callback(err);
            return callback(null, isPasswordMatch);
        });
    }
};

module.exports = utils;