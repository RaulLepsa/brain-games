var client = require('../commons/db-connection');

function GameAccess() {
}

/* Create a new GameAccess object using parameters */
GameAccess.new = function (id, userId, userFullname, gameId, gameName, gameCategory) {
    return { 'id': id, 'userId': userId, 'userFullname': userFullname, 'gameId': gameId, 'gameName': gameName, 'gameCategory': gameCategory};
};

/* Save a GameAccess entry */
GameAccess.save = function (gameAccess, callback) {

    var sql = 'INSERT INTO game_access(user_id, user_fullname, game_id, game_name, game_category) VALUES ($1, $2, $3, $4, $5)';
    var params = [gameAccess.userId, gameAccess.userFullname, gameAccess.gameId, gameAccess.gameName, gameAccess.gameCategory];

    client.query(sql, params,

        function (err) {
            if (err) {
                console.error('Error saving Game Access entry: ' + err);
                callback(err);
            } else {
                callback(null);
            }
        }
    );
};

/* Get statistics based on the share of categories played. If user_id is specified - for a user, else - collective. */
GameAccess.gameCategoriesRatio = function (user_id, callback) {

    var sql = 'SELECT game_category AS category, count(*) AS occurrences FROM game_access ';
    var args = [];

    if (user_id) {
        sql += 'WHERE user_id = $1 ';
        args.push(user_id);
    }

    client.query(sql + 'GROUP BY game_category', args, function (err, result) {
        if (err) {
            console.error('Error retrieving Game Categories Ratio', err);
            callback(err);
        } else if (result.rowCount === 0) {
            callback(null, null);
        } else {
            var categories = [], category;
            for (var i = 0; i < result.rows.length; i++) {
                category = {};
                category.name = result.rows[i].category;
                category.drilldown = result.rows[i].category;
                category.y = parseInt(result.rows[i].occurrences);
                categories.push(category);
            }

            callback(null, categories);
        }
    });
};

/* Get statistics based on the share of games played. If user_id is specified - for a user, else - collective. */
GameAccess.gamesRatio = function (user_id, callback) {

    var sql = 'SELECT game_name, count(*) AS occurrences, game_category FROM game_access ';
    var args = [];

    if (user_id) {
        sql += 'WHERE user_id = $1 ';
        args.push(user_id);
    }

    client.query(sql + 'GROUP BY game_name, game_category', args, function (err, result) {
        if (err) {
            console.error('Error retrieving Games Ratio', err);
            callback(err);
        } else {
            var games = [], game;
            for (var i = 0; i < result.rows.length; i++) {
                game = {};
                game.name = result.rows[i].game_name;
                game.occurrences = parseInt(result.rows[i].occurrences);
                game.category = result.rows[i].game_category;
                games.push(game);
            }

            callback(null, games);
        }
    });
};

GameAccess.trendingGames = function (hours, callback) {

    // Get most accessed games in the last X hours
    var hoursString = hours + 'h';

    client.query('SELECT game_id AS game FROM game_access WHERE access_date > now() - interval \'' + hoursString + '\' ' +
            'GROUP BY game_id ORDER BY COUNT(*) DESC',
        function (err, result) {
            if (err) {
                console.error('Error retrieving most recently accessed games', err);
                callback(err);
            } else if (result.rowCount === 0) {
                callback(null, null);
            } else {
                // Now we have the top trending games of the last X hours, ordered by the #of times they were accessed
                var gameIdsString = '{';
                var gameIds = [];

                for (var i = 0; i < result.rows.length; i++) {
                    if (i > 0) {
                        gameIdsString += ','
                    }
                    gameIdsString += result.rows[i].game;
                    gameIds.push(result.rows[i].game);
                }
                gameIdsString += '}';

                // We retrieve access information for those games, ordered by date
                client.query('SELECT *, date_part(\'hour\', now() - access_date) * 60 + date_part(\'minute\', now() - access_date) AS minutes_ago ' +
                        'FROM game_access WHERE access_date > now() - interval \'' + hoursString + '\' ' +
                        'AND array_append(\'{}\', game_id) <@ \'' + gameIdsString + '\' ORDER BY minutes_ago ASC', function (err, result) {

                        if (err) {
                            console.error('Error retrieving most recently accessed games', err);
                            callback(err);
                        } else if (result.rowCount === 0) {
                            callback(null, null);
                        } else {
                            var i, game;
                            var minutes = 60;

                            // Initialize array for each game
                            var elements = {};
                            for (i = 0; i < gameIds.length; i++) {
                                elements[gameIds[i]] = {};
                                elements[gameIds[i]].data = [];

                                // Create array of length the # of hour periods
                                for (var j = 0; j < hours; j++) {
                                    elements[gameIds[i]].data.push(0);
                                }
                            }

                            // Iterate through results
                            i = 0;
                            var currentCycle = 0;

                            do {
                                game = result.rows[i];

                                if (game.minutes_ago < minutes) {
                                    // If no entry was created for this game, create one
                                    if (!elements[game.game_id].name) {
                                        elements[game.game_id].name = game.game_name;
                                    }
                                    elements[game.game_id].data[currentCycle] += 1;

                                    i++;
                                } else {
                                    // Completed period of 1 hour, move to next 1 hour period
                                    minutes += 60;
                                    currentCycle++;
                                }

                            } while (i < result.rows.length);

                            callback(null, elements);
                        }
                    }
                );
            }
        }
    );
};

/* Get Categories and the number of occurrences. If 'user_id' is specified, it's for a user, else it's global. */
GameAccess.gameCategories = function (user_id, callback) {
    var sql = 'SELECT game_category, COUNT(*) FROM game_access ';
    var args = [];

    if (user_id) {
        sql += 'WHERE user_id = $1 ';
        args.push(user_id);
    }

    sql += 'GROUP BY game_category';

    client.query(sql, args, function (err, result) {
        if (err) {
            console.error('Error retrieving game categories', err);
            callback(err);
        } else if (result.rowCount === 0) {
            callback(null, null);
        } else {
            var gameCategoriesMap = {};
            for (var i = 0; i < result.rows.length; i++) {
                gameCategoriesMap[result.rows[i].game_category] = result.rows[i].count;
            }
            callback(null, gameCategoriesMap);
        }

    });
};

module.exports = GameAccess;
