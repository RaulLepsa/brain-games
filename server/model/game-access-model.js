var client = require('../commons/db-connection');

function GameAccess() { }

/* Create a new GameAccess object using parameters */
GameAccess.new = function(id, userId, userFullname, gameId, gameName, accessDate) {
    return { 'id': id, 'userId': userId, 'userFullname': userFullname, 'gameId': gameId, 'gameName': gameName, 'accessDate': accessDate};
};

/* Save a GameAccess entry */
GameAccess.save = function (gameAccess, callback) {

    var sql = 'INSERT INTO game_access(user_id, user_fullname, game_id, game_name) VALUES ($1, $2, $3, $4)';
    var params = [gameAccess.userId, gameAccess.userFullname, gameAccess.gameId, gameAccess.gameName];

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
