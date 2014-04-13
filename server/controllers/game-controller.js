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

		var score = {};
		score.points = parseInt(req.param('points'));
		score.correct = parseInt(req.param('correct'));
		score.wrong = parseInt(req.param('wrong'));
		score.combos = parseInt(req.param('combos'));
		score.consecutive = parseInt(req.param('consecutive'));

		Score.save(Score.new(null, userId, userFullname, gameId, gameName, new Date(), score), function (err, score) {
			if (err) {
				res.statusCode = 500;
			} else {
				res.statusCode = 200;
			}
			res.end();
		});
	}
};

module.exports = GameController;