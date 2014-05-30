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

module.exports = GameAccess;
