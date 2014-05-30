/**
 * Statistics-related Routes
 **/

var StatsController = require('../controllers/stats-controller');

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