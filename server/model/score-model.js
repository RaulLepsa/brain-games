var client = require('../commons/db-connection');

function Score() { }

/* Create a new Score object using parameters */
Score.new = function(id, userId, userFullname, gameId, gameName, date, score) {
    return { 'id': id, 'userId': userId, 'userFullname': userFullname, 'gameId': gameId, 'gameName': gameName, 'date': date, 'score': score };
};

/* Save a Score for a Game. If successful, the function returns the Score object containing the just-inserted id */
Score.save = function (score, callback) {

    var sql = 'INSERT INTO scores(user_id, user_fullname, game_id, game_name, date, score) VALUES ($1, $2, $3, $4, $5, $6::JSON) RETURNING id;';
    var params = [score.userId, score.userFullname, score.gameId, score.gameName, score.date, score.score];

    client.query( sql, params,
        
        function (err, result) {
            if (err) {
                console.error('Error saving Game Score: ' + err);
                callback(err, null);
            } else {
                score.id = result.rows[0].id;
                callback(null, score);
            }
        }
    );     
};


module.exports = Score;