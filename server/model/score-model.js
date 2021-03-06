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
                console.error('Error saving Game Score', err);
                callback(err, null);
            } else {
                score.id = result.rows[0].id;
                callback(null, score);
            }
        }
    );     
};

/* Get the top score for a user, in a certain game. If no entry is found, returns null */
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
    Get high scores for a specific game. If the current user is not included in the retrieved ones, check for his high score.
    'gameLink' is the game link (a.k.a friendly name);
    'userId' identifies the current user
    'limit' is the max number of records to be retrieved
 */
Score.getHighScores = function (gameLink, userId, limit, callback) {
    client.query("SELECT user_id, user_fullname, game_id, game_name, date, (score->>'points')::BIGINT AS points " +
            "FROM scores " +
            "JOIN games ON scores.game_id = games.id " +
            "WHERE games.link = $1 " +
            "ORDER BY points DESC " +
            "LIMIT $2",
        [gameLink, limit], function (err, result) {

            if (err) {
                console.error('Error retrieving top scores for game: ' + gameId, err);
                callback(err, null, null);
            } else {
                if (result.rowCount === 0) {
                    callback(null, null, null);
                } else {
                    var scores = [];
                    var score, scoreInfo;

                    var currentUserFound = false;
                    for (var i = 0; i < result.rows.length; i++) {
                        score = Score.new();
                        scoreInfo = Score.scoreInfo();

                        score.userFullname = result.rows[i].user_fullname;
                        score.userId = result.rows[i].user_id;
                        if (score.userId === userId) {
                            currentUserFound = true;
                        }
                        score.gameId = result.rows[i].game_id;
                        score.gameName = result.rows[i].game_name;
                        score.date = utils.formatDate(result.rows[i].date);
                        scoreInfo.points = result.rows[i].points;
                        score.score = scoreInfo;

                        scores.push(score);
                    }

                    if (!currentUserFound) {
                        client.query(
                                "SELECT row_num, user_fullname, date, (score->>'points') AS points FROM ( " +
                                "SELECT row_number() OVER (ORDER BY (score->>'points')::BIGINT desc) AS row_num, scores.* FROM scores " +
                                ") AS results " +
                                "WHERE results.user_id = $1 AND results.game_id = $2",
                            [userId, scores[0].gameId], function (err, result) {
                                if (err) {
                                    callback(err, null, null);
                                } else if (result.rowCount === 0) {
                                    callback(null, scores, null);
                                } else {
                                    score = Score.new();
                                    scoreInfo = Score.scoreInfo();

                                    score.userFullname = result.rows[0].user_fullname;
                                    score.date = utils.formatDate(result.rows[0].date);
                                    scoreInfo.points = result.rows[0].points;
                                    score.score = scoreInfo;

                                    // Also include the position of the current user's score
                                    score.order = result.rows[0].row_num;

                                    callback(null, scores, score);
                                }
                            });

                    } else {
                        callback(null, scores, null);
                    }
                }
            }
        });
};

Score.gamePerformance = function (userId, gameId, callback) {
    client.query('SELECT date, game_name, (score->>\'points\')::BIGINT AS points FROM scores WHERE user_id = $1 AND game_id = $2 ORDER BY date ASC', [userId, gameId], function (err, result) {
        if (err) {
            console.error('Error retrieving game performance for user: ' + userId, err);
            callback(err);
        } else if (result.rowCount === 0) {
            callback(null, {});
        } else {
            var gamePerformance = {}, entry;
            gamePerformance.data = [];
            gamePerformance.name = result.rows[0].game_name;

            for (var i = 0; i < result.rows.length; i++) {
                // Each entry has to be a pair of date + value
                entry = [];
                entry.push(new Date(result.rows[i].date).getTime());
                entry.push(parseInt(result.rows[i].points));
                gamePerformance.data.push(entry);
            }

            callback(null, gamePerformance);
        }
    });
};

/* Get user and global average for a specific game */
Score.userAverageGlobalAverage = function (userId, callback) {

    // Get game scores for a user
    client.query('SELECT DISTINCT s.game_id, s.game_name, (score->>\'points\')::BIGINT AS points ' +
        'FROM scores s INNER JOIN games g ON s.game_id = g.id ' +
        'WHERE s.user_id = $1', [userId], function (err, result) {
        if (err) {
            console.error('Error retrieving user average for games', err);
            callback(err);
        } else if (result.rowCount === 0) {
            callback(null, null);
        } else {
            var gamesForUser = [], games = {}, game_id, game_name, points;
            for (var i = 0; i < result.rows.length; i++) {
                game_id = result.rows[i].game_id;
                game_name = result.rows[i].game_name;
                points = result.rows[i].points;

                if (!games[game_id]) {
                    games[game_id] = {name: game_name, points: [parseInt(points)]};
                } else {
                    games[game_id].points.push(parseInt(points));
                }

                gamesForUser.push({id: game_id, name: game_name, points: points});
            }

            // Get only a random game
            var randomGameIndex = Math.floor(Math.random() * (gamesForUser.length));
            var randomGame = gamesForUser[randomGameIndex];

            // Get full information about it
            var id = randomGame.id;
            randomGame = games[id];
            randomGame.id = id;

            // Get global results for the game
            client.query('SELECT avg((s.score->>\'points\')::BIGINT) AS avg FROM scores s WHERE s.game_id = $1', [id], function (err, result) {
                if (err) {
                    console.error('Error retrieving global average for games', err);
                    callback(err);
                } else if (result.rowCount === 0) {
                    callback(null, null);
                } else {

                    // Compute the user average for the game
                    var userAverage = 0;
                    randomGame.points.forEach(function (points) {
                        userAverage += points;
                    });
                    userAverage = userAverage / randomGame.points.length;

                    // Return the user average and global average for the game
                    callback(null, {userAverage: userAverage, globalAverage: result.rows[0].avg, game: randomGame});
                }
            });
        }
    });
};


module.exports = Score;
