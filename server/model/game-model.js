var client = require('../commons/db-connection');

function Game() {
}

/* Create a new Game object */
Game.new = function () {
    return { 'id': null, 'name': null, 'category': null, 'description': null, 'link': null };
};

/* Get a list of games. 'categories' and 'name' are optional parameters */
Game.getList = function (categories, name, callback) {

    var sql = 'SELECT * FROM games ';
    var params = [];
    var paramIndex = 1;

    if (categories || name) {
        sql += 'WHERE ';
        var i;

        if (categories) {
            sql += '( ';
            for (i = 0; i < categories.length; i++) {
                if (i > 0) { sql += 'OR '; }

                sql += 'category = $' + paramIndex + ' ';
                params.push(categories[i]);
                paramIndex++;
            }
            sql += ') ';
        }

        if (name) {
            if (categories) { sql += 'AND '; }
            name = '%' + name + '%';
            sql += 'UPPER(name) like UPPER($' + paramIndex + ') ';
            params.push(name);
        }
    }

    client.query(sql + 'ORDER BY games.name ASC', params, function (err, result) {
            if (err) {
                console.error('Error retrieving Games, filtered', err);
                callback(err);
            } else if (result.rowCount === 0) {
                callback(null, null);
            } else {
                var list = [];

                for (var i = 0; i < result.rows.length; i++) {
                    list.push(gameMapper(result.rows[i]));
                }

                callback(null, list);
            }
        }
    );
};

/* Get a list of categories, ordered by name */
Game.getCategories = function (callback) {

    client.query('SELECT DISTINCT category FROM games ORDER BY category ASC', function (err, result) {
            if (err) {
                console.error('Error retrieving Categories for Games', err);
                callback(err);
            } else if (result.rowCount === 0) {
                callback(null, null);
            } else {
                var list = [];

                for (var i = 0; i < result.rows.length; i++) {
                    list.push(result.rows[i].category);
                }

                callback(null, list);
            }
        }
    );
};

/* Get a list of games for a user - the ones he has played */
Game.getPlayedListForUser = function (userId, callback) {
    client.query('SELECT DISTINCT game_id AS id, game_name AS name FROM game_access WHERE user_id = $1 ORDER BY game_name ASC', [userId], function (err, result) {
        if (err) {
            console.error('Error retrieving Games played for User ' + userId, err);
            callback(err);
        } else if (result.rowCount === 0) {
            callback(null, null);
        } else {
            var list = [];
            for (var i = 0; i < result.rows.length; i++) {
                list.push(gameMapper(result.rows[i]));
            }

            callback(null, list);
        }
    });
};

/* Get games that a user has finished - he is allowed to rate them. Also bring the rating if it exists */
Game.gameRatingsForUser = function (userId, gamesArray, callback) {
    var args = [userId, '{' + gamesArray.toString() + '}'];

    client.query('SELECT DISTINCT scores.game_id, gr.rating FROM scores ' +
        'LEFT JOIN game_rating gr on gr.game_id = scores.game_id ' +
        'WHERE scores.user_id = $1 AND array_append(\'{}\', scores.game_id) <@ $2', args, function (err, result) {
        if (err) {
            console.error('Error retrieving games for user: ' + userId, err);
            callback(err);
        } else {
            var games = {}, rating;
            if (result.rowCount > 0) {
                for (var i = 0; i < result.rows.length; i++) {
                    rating = result.rows[i].rating;
                    games[result.rows[i].game_id] = rating != null ? rating : 0;
                }
            }
            callback(err, games);
        }
    });
};

/* Rate a game */
Game.rate = function (userId, gameId, rating, callback) {
    client.query('SELECT * FROM game_rating WHERE game_id = $1 AND user_id = $2', [gameId, userId], function (err, result) {
        var sql, args;
        if (result.rowCount === 0 ) {
            sql = 'INSERT INTO game_rating(game_id, user_id, rating) VALUES ($1, $2, $3)';
            args = [gameId, userId, rating];
        } else {
            sql = 'UPDATE game_rating SET rating = $1 WHERE game_id = $2 and user_id = $3';
            args = [rating, gameId, userId];
        }

        client.query(sql, args, function (err) {
            if (err) {
                console.error('Error inserting/updating rating for game: ' + gameId + 'for user: ' + userId, err);
                callback(err);
            } else {
                callback(null, rating);
            }
        });
    });
};

/* Map a Game object from a DB row */
function gameMapper(row) {
    var game = Game.new();
    game.id = row.id;
    game.category = row.category;
    game.name = row.name;
    game.description = row.description;
    game.link = row.link;

    return game;
}

module.exports = Game;