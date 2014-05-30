var client = require('../commons/db-connection');

function GameAccess() { }

/* Create a new GameAccess object using parameters */
GameAccess.new = function(id, userId, userFullname, gameId, gameName, gameCategory) {
    return { 'id': id, 'userId': userId, 'userFullname': userFullname, 'gameId': gameId, 'gameName': gameName, 'gameCategory': gameCategory};
};

/* Save a GameAccess entry */
GameAccess.save = function (gameAccess, callback) {

    var sql = 'INSERT INTO game_access(user_id, user_fullname, game_id, game_name, game_category) VALUES ($1, $2, $3, $4, $5)';
    var params = [gameAccess.userId, gameAccess.userFullname, gameAccess.gameId, gameAccess.gameName, gameAccess.gameCategory];

    client.query( sql, params,

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

/* Get statistics based on the share of categories played, for a user */
GameAccess.gameCategoriesForUser = function(user_id, callback) {

    client.query('SELECT game_category AS category, count(*) AS occurrences FROM game_access WHERE user_id = $1 GROUP BY game_category', [user_id],
        function (err, result) {
            if (err) {
                console.error('Error retrieving Game ');
                callback(err);
            } else {
                if (result.rowCount === 0) {
                    callback(null, null);
                } else {
                    var data = {elements: []};
                    var elem;
                    for (var i = 0; i < result.rows.length; i++) {
                        elem = [];
                        elem.push(result.rows[i].category);
                        elem.push(parseInt(result.rows[i].occurrences));
                        data.elements.push(elem);
                    }

                    callback(null, data);
                }
            }
    });
};

module.exports = GameAccess;
