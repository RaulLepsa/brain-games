/**
 * Game-related Routes
**/

var GameController = require('../controllers/game-controller');

/** General routes **/

// Games page
app.get('/secure/games', function (req, res) {
	GameController.getGamesView(req, res);
});

// Get list of games by an optional filter
app.get('/secure/gamesList', function (req, res) {
	GameController.getGamesSubview(req, res);
});

// Save a Score for a Game
app.post('/secure/game-score', function (req, res) {
	GameController.saveScore(req, res);
});

// Get top score for a user for a Game
app.get('/secure/game-score/top', function (req, res) {
	GameController.getTopScore(req, res);
});

// Get high scores for a game
app.get('/secure/highscores/:link', function (req, res) {
    GameController.getHighScores(req, res);
});

// Save game access entry
app.post('/secure/gameAccess', function(req, res) {
    GameController.saveGameAccessEntry(req);
    res.end();
});

/** Specific games **/

// Color Match Game page
app.get('/secure/game/color-match', function (req, res) {
	res.render('color-match');
});

// 2048 Game page
app.get('/secure/game/2048', function (req, res) {
	res.render('2048');
});