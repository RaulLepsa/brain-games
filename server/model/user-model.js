var client = require('../commons/db-connection');

function User() { }

/** Create a new User object **/
User.new = function() {
    return {'id': null, 'email': null, 'password': null, 'firstname': null, 'lastname': null};
}

/** Get a User by his email. Returns the User entity if found, or null if it does not exist. **/
User.getByEmail = function (email, callback) {
   
    var query = client.query(
        
        'SELECT * FROM users WHERE email = $1', [email],
        
        function (err, result) {
            if (err) {
                console.error('Error retrieving User by email: ' + err);
                callback(err);
            } else if (result.rowCount === 0) {
                callback(null, null);
            } else {
                var user = User.new();
                user.id = result.rows[0].id;
                user.email = result.rows[0].email;
                user.password = result.rows[0].password;
                user.firstname = result.rows[0].firstname;
                user.lastname = result.rows[0].lastname;

                callback(null, user);   
            }
        }
    );     
};


module.exports = User;