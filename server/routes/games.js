/**
 * Game-related Routes
**/

var Games = require('../model/game-model');

// Games page
app.get('/secure/games', function (req, res) {
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
});

// Get list of games by their category
app.get('/secure/games/category/:category', function (req, res) {
	var category = req.params.category;
	if (category === 'null') { category = null; }
	
	Games.getList(category, function (err, games) {
		if (games) {
			res.render('sub-views/game-list', {games: games});
		} else {
			res.end();
		}
	});
});

// Color Match Game page
app.get('/secure/game/color-match', function (req, res) {
	res.render('color-match');
});