var client = require('../commons/db-connection');

function Game() { }

/* Create a new Game object */
Game.new = function() {
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
            sql += 'UPPER(name) like UPPER($' + paramIndex + ')';
            params.push(name);
        }
    } 

    client.query( sql, params,
        
        function (err, result) {
            if (err) {
                console.error('Error retrieving Games, filtered: ' + err);
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
                    game.link = result.rows[i].link;

                    list.push(game);
                }

                callback(null, list);   
            }
        }
    );     
};

/* Get a list of categories, ordered by name */
Game.getCategories = function(callback) {

    client.query( 'SELECT DISTINCT category FROM games ORDER BY category ASC',
        
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