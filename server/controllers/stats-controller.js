/**
 * Statistics-related operations
 **/

var GameAccess = require('../model/game-access-model'),
    Scores = require('../model/score-model');

var StatsController = {

    /* Get statistics based on the share of categories played, for a user */
    gameCategoriesForUser: function(id, callback) {
        GameAccess.gameCategoriesRatio(id, function (err, categories) {
            var data = {elements: categories};

            // After we have the categories, get drill-down data by Games
            if (categories) {
                gamesRatioForCategories(id, categories, data, callback);
            } else {
                callback(null);
            }
        });
    },

    /* Get statistics based on the share of categories played, for all users */
    gameCategoriesCollective: function (callback) {
        GameAccess.gameCategoriesRatio(null, function (err, categories) {
            var data = {elements: categories};

            // After we have the categories, get drill-down data by Games
            if (categories) {
                gamesRatioForCategories(null, categories, data, callback);
            } else {
                callback(null);
            }
        });
    },

    /* Get trending games stats */
    trendingGames: function (callback) {
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
    },

    /* Get statistics based on game performance for a user for a specific game */
    gamePerformance: function (userId, gameId, callback) {
        Scores.gamePerformance(userId, gameId, function (err, gamePerformance) {
            callback(err, gamePerformance);
        });
    }
};

module.exports = StatsController;

/* Get Games for the Categories drill-down */
function gamesRatioForCategories(id, categories, data, callback) {

    GameAccess.gamesRatio(id, function (err, allGames) {
        if (err) {
            callback(err);
        } else {
            // For each category, we set all the games belonging to it in the drilldownElements object
            var drilldownElements = {}, drilldownElement, i, game, dataArray;
            for (i = 0; i < categories.length; i++) {
                drilldownElement = {};
                drilldownElement.name = categories[i].name;
                drilldownElement.id = categories[i].name;
                drilldownElement.data = [];
                drilldownElements[categories[i].name] = drilldownElement;
            }
            for (i = 0; i < allGames.length; i++) {
                game = allGames[i];
                dataArray = [];
                dataArray.push(game.name);
                dataArray.push(game.occurrences);
                drilldownElements[game.category].data.push(dataArray);
            }

            // Finally, convert the drilldownElements into an array
            var drilldownElementsArray = [];
            for (var key in drilldownElements) {
                if (drilldownElements.hasOwnProperty(key)) {
                    drilldownElementsArray.push(drilldownElements[key]);
                }
            }

            data.drilldownElements = drilldownElementsArray;

            callback(err, data);
        }
    });
}
