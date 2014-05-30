/**
 * Statistics-related operations
 **/

var GameAccess = require('../model/game-access-model');

var StatsController = {

    /* Get statistics based on the share of categories played, for a user */
    gameCategoriesForUser: function(id, callback) {
        GameAccess.gameCategoriesForUser(id, function (err, data) {
            data.title = 'Game categories shares';
            callback(err, data);
        });
    }

};

module.exports = StatsController;