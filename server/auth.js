var User = require('./model/user-model');

module.exports = function (app, passport) {

    // Serialize and deserialize methods for the passport authentication
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    // Use local strategy authentication
    var LocalStrategy = require('passport-local').Strategy;
    passport.use(new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        }
        , function (email, password, done) {
            // Get user by email
            User.getByEmail(email, function (err, user) {
                // Validate the response
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                if (user.password !== password) {
                    return done(null, false);
                }

                // If everything is ok, return the user
                return done(null, user);
            });
        }
    ));
};