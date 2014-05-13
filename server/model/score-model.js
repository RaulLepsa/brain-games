var client = require('../commons/db-connection'),
    utils = require('../commons/utils');

function Score() { }

function ScoreInformation() { }

/* Create a new Score object using parameters */
Score.new = function(id, userId, userFullname, gameId, gameName, date, scoreInfo) {
    return { 'id': id, 'userId': userId, 'userFullname': userFullname, 'gameId': gameId, 'gameName': gameName, 'date': date, 'score': scoreInfo };
};

/* Create a new Score Information object using parameters */
Score.scoreInfo = function(points, correct, wrong, combos, consecutive) {
    return { 'points': points, 'correct': correct, 'wrong': wrong, 'combos': combos, 'consecutive': consecutive };
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

/* Get the top score for a user, in a certain game */
Score.getTopScore = function (userId, gameId, callback) {

    client.query("SELECT score->>'points' AS points FROM scores WHERE user_id = $1 AND game_id = $2 ORDER BY (score->>'points')::BIGINT DESC LIMIT 1",
        [userId, gameId],

        function (err, result) {
            if (err) {
                console.error('Error retrieving score for game: ' + gameId + ' for user: ' + userId, err);
                callback(err, null);
            } else {
                if (result.rowCount === 0) {
                    callback(null, null);
                } else {
                    callback(null, result.rows[0].points);
                }
            }
        }
    );
};

/*
    Get high scores for a specific game.
    'link' is the game link (a.k.a friendly name);
    'limit' is the max number of records to be retrieved
 */
Score.getHighScores = function (link, limit, callback) {
    client.query("SELECT user_id, user_fullname, game_id, game_name, date, (score->>'points')::BIGINT AS points " +
            "FROM scores " +
            "JOIN games ON scores.game_id = games.id " +
            "WHERE games.link = $1 " +
            "ORDER BY points DESC " +
            "LIMIT $2",
        [link, limit], function (err, result) {

            if (err) {
                console.error('Error retrieving top scores for game: ' + gameId, err);
                callback(err, null);
            } else {
                if (result.rowCount === 0) {
                    callback(null, null);
                } else {
                    var scores = [];
                    var score, scoreInfo;

                    for (var i = 0; i < result.rows.length; i++) {
                        score = Score.new();
                        scoreInfo = Score.scoreInfo();

                        score.userFullname = result.rows[i].user_fullname;
                        score.userId = result.rows[i].user_id;
                        score.gameId = result.rows[i].game_id;
                        score.gameName = result.rows[i].game_name;
                        score.date = utils.formatDate(result.rows[i].date);
                        scoreInfo.points = result.rows[i].points;
                        score.score = scoreInfo;

                        scores.push(score);
                    }

                    callback(null, scores);
                }
            }
        });
};


module.exports = Score;
