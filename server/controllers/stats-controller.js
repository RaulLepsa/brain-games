/**
 * Statistics-related operations
 **/

var GameAccess = require('../model/game-access-model');

var StatsController = {

    /* Get statistics based on the share of categories played, for a user */
    gameCategoriesForUser: function(id, callback) {
        GameAccess.gameCategoriesRatio(id, function (err, elements) {
            var data = {};
            data.title = 'Your training categories ratio';
            data.elements = elements;
            callback(err, data);
        });
    },

    /* Get statistics based on the share of categories played, for all users */
    gameCategoriesCollective: function (callback) {
        GameAccess.gameCategoriesRatio(null, function (err, elements) {
            var data = {};
            data.title = 'Overall training categories ratio';
            data.elements = elements;
            callback(err, data);
        });
    },

    /* Get trending games stats */
    trendingGames: function(callback) {
        var _hours = 5;

        GameAccess.trendingGames(_hours, function (err, elements) {
            var processedElements = [];

            for (var key in elements) {
                if (elements.hasOwnProperty(key)) {
                    processedElements.push(elements[key]);
                }
            }

            var data = {};
            data.title = 'Trending games';
            data.elements = processedElements;
            callback(err, data);
        });
    }
};

module.exports = StatsController;