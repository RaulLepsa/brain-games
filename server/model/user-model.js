var client = require('../commons/db-connection');

function User() {
}

/** Create a new User object **/
User.new = function () {
    return { 'id': null, 'email': null, 'password': null, 'firstname': null, 'lastname': null, username: null, 'google_id': null };
};

/** Create a new User instance using parameters **/
User.new = function (email, password, firstname, lastname, googleId) {
    return { 'id': null, 'email': email, 'password': password, 'firstname': firstname, 'lastname': lastname, 'google_id': googleId };
};

/** Get a User by a User field. Returns the User entity if found, or null if it does not exist. **/
User.getByField = function (fieldName, fieldValue, callback) {

    client.query('SELECT * FROM users WHERE ' + fieldName + ' = $1', [fieldValue],
        function (err, result) {
            if (err) {
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
User.save = function (user, callback) {
    client.query(
        'INSERT INTO users(email, password, firstname, lastname, google_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [user.email, user.password, user.firstname, user.lastname, user.google_id],
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
User.update = function (user, callback) {
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

    sql += 'WHERE id = $' + argIndex + ' RETURNING id, firstname, lastname, email';
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
    user.google_id = row.google_id;

    return user;
}

module.exports = User;