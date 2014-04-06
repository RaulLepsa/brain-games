var client = require('../commons/db-connection');

function Game() { }

/* Create a new Game object */
Game.new = function() {
    return { 'id': null, 'name': null, 'category': null, 'description': null };
};

/* Get a list of games by a category. If category is null, all the games are retrieved */
Game.getList = function (category, callback) {

    var sql = 'SELECT * FROM games ';
    var params = [];

    if (category) {
        sql += 'WHERE category = $1';
        params.push(category);
    } 

    var query = client.query( sql, params,
        
        function (err, result) {
            if (err) {
                console.error('Error retrieving Games by category: ' + err);
                callback(err);
            } else if (result.rowCount === 0) {
                callback(null, null);
            } else {
                var list = [];
                var game;

                for (var i = 0; i < result.rows.length; i++) {
                    game = Game.new();
                    game.id = result.rows[i].id;
                    game.category = result.rows[i].category;
                    game.name = result.rows[i].name;
                    game.description = result.rows[i].description;

                    list.push(game);
                }

                callback(null, list);   
            }
        }
    );     
};

/* Get a list of categories, ordered by name */
Game.getCategories = function(callback) {

    var query = client.query( 'SELECT DISTINCT category FROM games ORDER BY category ASC',
        
        function (err, result) {
            if (err) {
                console.error('Error retrieving Categories for Games: ' + err);
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

module.exports = Game;