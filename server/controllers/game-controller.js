/**
 * Game-related operations
 **/

var Games = require('../model/game-model'),
    Score = require('../model/score-model'),
    GameAccess = require('../model/game-access-model');

var GameController = {

    /* Get the Games page - retrieves the categories and the games and populates the page with them */
    getGamesView: function (req, res) {

        Games.getCategories(function (err, categories) {
            if (categories) {
                Games.getList(null, null, function (err, games) {
                    if (games) {
                        var gameIdsArray = [], i;
                        for (i = 0; i < games.length; i++) {
                            gameIdsArray.push(games[i].id);
                        }
                        Games.gameRatingsForUser(req.user.id, gameIdsArray, function (err, gameRatings) {
                            for (i = 0; i < games.length; i++) {
                                if (gameRatings[games[i].id] >= 0) {
                                    games[i].rating = gameRatings[games[i].id];
                                } else {
                                    games[i].rating = null;
                                }
                            }
                            res.render('games', {username: req.user.username, categories: categories, games: games});
                        });
                    } else {
                        res.end();
                    }
                });
            } else {
                res.end();
            }
        });
    },

    /* Retrieves a list of games and populates the Game List view with them */
    getGamesSubview: function (req, res) {
        var filter = req.param('filter');
        var categories = null;
        var searchTerm = null;

        if (filter && filter !== 'null') {
            categories = filter.categories;
            searchTerm = filter.searchTerm;
        }

        Games.getList(categories, searchTerm, function (err, games) {
            if (games) {
                res.render('sub-views/game-list', {games: games});
            } else {
                res.end();
            }
        });
    },

    /* Save a Score */
    saveScore: function (req, res) {

        var userId = req.user.id;
        var fullname = req.user.username;
        var gameId = req.param('gameId');
        var gameName = req.param('gameName');
        var points = req.param('points');

        var scoreInfo = Score.scoreInfo(
            parseInt(req.param('points')),
            parseInt(req.param('correct')),
            parseInt(req.param('wrong')),
            parseInt(req.param('combos')),
            parseInt(req.param('consecutive'))
        );


        Score.save(Score.new(null, userId, fullname, gameId, gameName, new Date(), scoreInfo), function (err, score) {
            if (err) {
                res.statusCode = 500;
            } else {
                res.statusCode = 200;
            }
            res.end();
        });
    },

    /* Get the top score for a user for a certain game */
    getTopScore: function (req, res) {
        var userId = req.user.id;
        var gameId = req.param('gameId');

        Score.getTopScore(userId, gameId, function (err, points) {
            if (err) {
                res.statusCode = 500;
                res.end();
            } else {
                res.json(200, {score: points});
            }
        });
    },

    /* Get high scores for a game */
    getHighScores: function (req, res) {

        Score.getHighScores(req.params.link, req.user.id, 10, function (err, scores, currentUserScore) {
            if (err) {
                res.statusCode = 500;
                res.end();
            } else {
                // If we have scores for this game
                if (scores != null) {
                    // Set title
                    var title = scores[0].gameName;

                    res.render('highscores', {title: title, scores: scores, currentUserScore: currentUserScore, currentUser: req.user.id, username: req.user.username});
                } else {
                    res.render('highscores', {title: '', scores: null, currentPlayerHighScore: null, currentUser: null, username: req.user.username});
                }
            }
        });
    },

    /* Save a Game Access Entry */
    saveGameAccessEntry: function (req) {
        var gameId = req.param('gameId');
        var gameName = req.param('gameName');
        var gameCategory = req.param('gameCategory');
        var userId = req.user.id;
        var fullname = req.user.username;

        if (gameId && gameName) {
            GameAccess.save(GameAccess.new(null, userId, fullname, gameId, gameName, gameCategory), function () {});
        }
    },

    /* Rate a game */
    rateGame: function (req, callback) {
        var userId = req.user.id;
        var gameId = req.param('gameId');
        var rating = req.param('rating');

        // Check if the user is allowed to rate this game (only allowed to rate if the game was played and finished)
        Score.getTopScore(userId, gameId, function (err, result) {
            if (err) {
                callback(err);
            } else {
                if (!result) {
                    callback('Error: User is now allowed to rate this game.');
                } else {
                    Games.rate(userId, gameId, rating, function (err, result) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, result);
                        }
                    });
                }
            }
        });
    },

    /* Get a list of games for a user - the ones he has played */
    getPlayedGamesForUser: function (req, callback) {
        Games.getPlayedListForUser(req.user.id, function (err, games) {
            callback (err, games);
        });
    }
};

module.exports = GameController;