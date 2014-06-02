var UserController = require('./controllers/user-controller'),
    config = require('./commons/config'),
    hostLocation = config.web.protocol + '://' + config.web.host + ':' + config.web.port;

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
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        }
        , UserController.localAuthentication
    ));

    // Google strategy authentication
    var GoogleStrategy = require('passport-google').Strategy;
    passport.use(new GoogleStrategy({
            returnURL: hostLocation + '/auth/google/return'
        }
        , UserController.googleAuthentication
    ));
};