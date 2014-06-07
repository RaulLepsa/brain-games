/**
 * Statistics-related Routes
 **/

var StatsController = require('../controllers/stats-controller');

/* Get stats page */
app.get('/secure/stats', function (req, res) {
    res.render('stats', {username: req.user.username});
});

/* Get statistics based on the share of categories played, for a user */
app.get('/secure/stats/self/game-categories', function (req, res) {
    StatsController.gameCategoriesForUser(req.user.id, function (err, data) {
        if (err) {
            res.statusCode = 400;
            res.end();
        } else {
            res.json(200, {data: data});
        }
    });
});

/* Get statistics based on the share of categories played, for all users */
app.get('/secure/stats/collective/game-categories', function (req, res) {
    StatsController.gameCategoriesCollective(function (err, data) {
        if (err) {
            res.statusCode = 400;
            res.end();
        } else {
            res.json(200, {data: data});
        }
    });
});

/* Get statistics for trending games */
app.get('/secure/stats/collective/trending-games', function (req, res) {
    StatsController.trendingGames(function (err, data) {
        if (err) {
            res.statusCode = 400;
            res.end();
        } else {
            res.json(200, {data: data});
        }
    });
});

/* Get statistics based on game performance for a user for a specific game */
app.get('/secure/stats/self/game-performance', function (req, res) {
    StatsController.gamePerformance(req.user.id, req.param('gameId'), function (err, gamePerformance) {
        if (err) {
            res.statusCode = 400;
            res.end();
        } else {
            res.json(200, gamePerformance);
        }
    });
});