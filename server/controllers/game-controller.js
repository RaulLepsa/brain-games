/**
 * Game-related operations
**/

var Games = require('../model/game-model'),
	Score = require('../model/score-model');

var GameController = {

	/* Get the Games page - retrieves the categories and the games and populates the page with them */
	getGamesView: function(req, res) {
		var title = req.user.firstname + ' ' + req.user.lastname;
		
		Games.getCategories(function (err, categories) {
			if (categories) {
				Games.getList(null, function (err, games) {
					if (games) {
			    		res.render('games', {title: title, categories: categories, games: games} );
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
	getGamesSubview: function(req, res) {
		var category = req.params.category;
		if (category === 'null') { category = null; }
		
		Games.getList(category, function (err, games) {
			if (games) {
				res.render('sub-views/game-list', {games: games});
			} else {
				res.end();
			}
		});
	},

	/* Save a Score */
	saveScore: function(req, res) {

		var userId = req.user.id;
		var userFullname = req.user.firstname + ' ' + req.user.lastname;
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


		Score.save(Score.new(null, userId, userFullname, gameId, gameName, new Date(), scoreInfo), function (err, score) {
			if (err) {
				res.statusCode = 500;
			} else {
				res.statusCode = 200;
			}
			res.end();
		});
	},

	/* Get the top score for a user for a certain game */
	getTopScore: function(req, res) {
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
    getHighScores: function(req, res) {

        Score.getHighScores(req.params.link, req.user.id, 10, function (err, scores, currentUserScore) {
            if (err) {
                res.statusCode = 500;
                res.end();
            } else {
                // If we have scores for this game
                if (scores != null) {
                    // Set title
                    var title = scores[0].gameName;

                    res.render('highscores', {title: title, scores: scores, currentUserScore: currentUserScore, currentUser: req.user.id});
                } else {
                    res.render('highscores', {title: '', scores: null, currentPlayerHighScore: null, currentUser: null});
                }
            }
        });
    }
};

module.exports = GameController;