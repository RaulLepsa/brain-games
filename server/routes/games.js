/**
 * Game-related Routes
**/

var GameController = require('../controllers/game-controller');

// Games page
app.get('/secure/games', function (req, res) {
	GameController.getGamesView(req, res);
});

// Get list of games by their category
app.get('/secure/games/category/:category', function (req, res) {
	GameController.getGamesSubview(req, res);
});

// Color Match Game page
app.get('/secure/game/color-match', function (req, res) {
	res.render('color-match');
});

// Save a Score for a Game
app.post('/secure/game-score', function (req, res) {
	GameController.saveScore(req, res);
});

// Get top score for a Game
app.get('/secure/game-score/top', function (req, res) {
	GameController.getTopScore(req, res);
});