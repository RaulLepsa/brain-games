/**
 * Suggestion-related operations
 */

var Games = require('../model/game-model'),
    Score = require('../model/score-model'),
    GameAccess = require('../model/game-access-model');

var _suggestionTypes = {
    CATEGORY_NOT_PLAYED: 1,
    CATEGORY_RATIO_BELOW: 2
};

var SuggestionsController = {

    /**
     * Get suggestions for a user. There are 3 types of suggestions:
     *  1. Based on the categories not played by the user
     *  2. Based on the categories not played as much as others are playing
     *  3. Based on results for certain games
     *  4. Based on most popular games
     */
    getForUser: function (userId, callback) {
        var suggestions = [], suggestedItems = [], gameMap = {};

        Games.getList(null, null, function (err, gameList) {

            // Construct map of games (the key is the category)
            gameList.forEach(function (game) {
                if (!gameMap[game.category]) {
                    gameMap[game.category] = [];
                }
                gameMap[game.category].push(game);
            });

            // Get played Game Categories overall
            GameAccess.gameCategories(null, function (err, categoriesMap) {
                if (categoriesMap) {

                    // Get played Game Categories for a user
                    GameAccess.gameCategories(userId, function (err, userCategoriesMap) {
                        if (userCategoriesMap) {
                            var total = 0, totalForUser = 0, category;

                            for (category in categoriesMap) {
                                if (categoriesMap.hasOwnProperty(category)) {
                                    total += parseInt(categoriesMap[category]);

                                    // CASE 1: Category not played, suggest playing from it
                                    if (!userCategoriesMap[category]) {
                                        suggestions.push({type: _suggestionTypes.CATEGORY_NOT_PLAYED, object: category, suggested: gameMap[category]});
                                    } else {
                                        totalForUser += parseInt(userCategoriesMap[category]);
                                    }
                                }
                            }

                            for (category in userCategoriesMap) {
                                if (userCategoriesMap.hasOwnProperty(category)) {
                                    // CASE 2: If the ratio of the category overall and for the user has a difference of more than 20%
                                    if ((categoriesMap[category] / total) - (userCategoriesMap[category] / totalForUser) > 0.11) {
                                        suggestions.push({type: _suggestionTypes.CATEGORY_RATIO_BELOW, object: category, suggested: gameMap[category]});
                                    }
                                }
                            }

                            callback(null, suggestions);
                        }
                    });
                } else {
                    // No played games - suggest most popular
                    callback(null);

                }

            });
        });
    }
};

module.exports = SuggestionsController;