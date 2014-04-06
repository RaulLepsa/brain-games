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