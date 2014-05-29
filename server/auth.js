var User = require('./model/user-model'),
    utils = require('./commons/utils');

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

                utils.comparePassword(password, user.password, function(err, isMatch) {
                    if (err || !isMatch) {
                        return done(null, false);
                    } else {
                        return done(null, user);
                    }
                });
            });
        }
    ));
};