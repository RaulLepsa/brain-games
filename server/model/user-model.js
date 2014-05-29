var client = require('../commons/db-connection');

function User() { }

/** Create a new User object **/
User.new = function() {
    return { 'id': null, 'email': null, 'password': null, 'firstname': null, 'lastname': null, username: null };
};

/** Create a new User instance using parameters **/
User.new = function(email, password, firstname, lastname) {
	return { 'id': null, 'email': email, 'password': password, 'firstname': firstname, 'lastname': lastname };	
};

/** Get a User by his ID. Returns the User entity if found, or null if it does not exist. **/
User.getById = function (id, callback) {

    client.query(

        'SELECT * FROM users WHERE id = $1', [id],

        function (err, result) {
            if (err) {
                console.error('Error retrieving User by id: ' + id);
                callback(err);
            } else if (result.rowCount === 0) {
                callback(null, null);
            } else {
                callback(null, userMapper(result.rows[0]));
            }
        }
    );
};

/** Get a User by his email. Returns the User entity if found, or null if it does not exist. **/
User.getByEmail = function (email, callback) {
   
    client.query(
        
        'SELECT * FROM users WHERE email = $1', [email],
        
        function (err, result) {
            if (err) {
                console.error('Error retrieving User by email: ' + err);
                callback(err);
            } else if (result.rowCount === 0) {
                callback(null, null);
            } else {
                callback(null, userMapper(result.rows[0]));
            }
        }
    );     
};

/** Save a User. Returns the newly ID if the save is successful. **/
User.save = function(user, callback) {
	client.query(
        'INSERT INTO users(email, password, firstname, lastname) VALUES ($1, $2, $3, $4) RETURNING id',
        [user.email, user.password, user.firstname, user.lastname],
        function (err, result) {
            if (err) {
                console.error('Error saving User: ' + err);
                callback(err);
            } else {
                callback(null, result.rows[0].id);
            }
        }
    );
};

/** Update a User **/
User.update = function(user, callback) {
    var sql = 'UPDATE users SET email = $1, firstname = $2 ';
    var args = [user.email, user.firstname];

    var argIndex = 3;
    if (user.lastname) {
        sql += ',lastname = $' + argIndex + ' ';
        args.push(user.lastname);
        argIndex++;
    }
    if (user.password) {
        sql += ',password = $' + argIndex + ' ';
        args.push(user.password);
        argIndex++;
    }

    sql += 'WHERE id = $' + argIndex  + ' RETURNING id, firstname, lastname, email';
    args.push(user.id);

    client.query(sql, args, function (err, result) {
        if (err) {
            console.error('Error updating User: ' + err);
            callback(err);
        } else {
            if (result.rowCount === 0) {
                console.error('Cannot find User with id: ' + user.id);
                callback('No rows affected');
            } else {
                callback(null, userMapper(result.rows[0]));
            }
        }
    });
};

/** Create a user instance out of a DB-retrieved row **/
function userMapper(row) {
    var user = User.new();
    user.id = row.id;
    user.email = row.email;
    user.password = row.password;
    user.firstname = row.firstname;
    user.lastname = row.lastname;
    user.username = user.firstname + ' ' + user.lastname;
    
    return user;
}

module.exports = User;