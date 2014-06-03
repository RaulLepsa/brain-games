/**
 * User-related operations
 **/

var User = require('../model/user-model'),
    utils = require('../commons/utils');

var UserController = {

    /** Get Information about current user **/
    getUserInformation: function (req, res) {

        var userInformation = {};
        userInformation.firstname = req.user.firstname;
        userInformation.lastname = req.user.lastname;
        userInformation.email = req.user.email;
        userInformation.username = req.user.username;
        userInformation.id = req.user.id;

        res.json(200, userInformation);
    },

    /* Request to update the user information */
    updateUserInformationRequest: function (req, res) {
        var firstname = req.param('firstname');
        var lastname = req.param('lastname');
        var email = req.param('email');
        var oldPassword = req.param('oldPassword');
        var newPassword = req.param('newPassword');

        // First name and email are mandatory
        if (firstname && email) {
            if (newPassword) {
                // If the user wants the password changed, check if the old one is specified
                if (!oldPassword) {
                    res.statusCode = 400;
                    res.end();
                } else {
                    // Check if the old password matches the DB
                    User.getByField('id', req.user.id, function (err, user) {
                        utils.comparePassword(oldPassword, user.password, function (err, isMatch) {
                            if (isMatch) {

                                // If everything is ok, crypt the new password and call the update function
                                utils.cryptPassword(newPassword, function (err, encryptedPassword) {
                                    UserController.updateUserInformation(req, res, firstname, lastname, email, encryptedPassword);
                                });
                            } else {

                                // If they do not match, check if the user has registered with Google and has the default password set (i.e. the google_id)
                                if (user.google_id) {
                                    utils.comparePassword(user.google_id, user.password, function (err, isMatch) {
                                        if (isMatch) {
                                            // If everything is ok, crypt the new password and call the update function
                                            utils.cryptPassword(newPassword, function (err, encryptedPassword) {
                                                UserController.updateUserInformation(req, res, firstname, lastname, email, encryptedPassword);
                                            });
                                        } else {
                                            // If this does not match either, return an error
                                            res.json(200, {error: 'Incorrect value specified for Old password'});
                                        }
                                    });

                                // Check if the user has registered with facebook and has the default password set (i.e. the facebook_id)
                                } else if (user.facebook_id) {
                                    utils.comparePassword(user.facebook_id, user.password, function (err, isMatch) {
                                        if (isMatch) {
                                            // If everything is ok, crypt the new password and call the update function
                                            utils.cryptPassword(newPassword, function (err, encryptedPassword) {
                                                UserController.updateUserInformation(req, res, firstname, lastname, email, encryptedPassword);
                                            });
                                        } else {
                                            // If this does not match either, return an error
                                            res.json(200, {error: 'Incorrect value specified for Old password'});
                                        }
                                    });
                                } else {
                                    res.json(200, {error: 'Incorrect value specified for Old password'});
                                }
                            }
                        });
                    });
                }
            } else {
                UserController.updateUserInformation(req, res, firstname, lastname, email, null);
            }
        } else {
            res.statusCode = 400;
            res.end();
        }
    },

    /* Update the user information */
    updateUserInformation: function (req, res, firstname, lastname, email, password) {
        var user = User.new(email, null, firstname, null);
        user.id = req.user.id;

        if (password) {
            user.password = password;
        }
        if (lastname) {
            user.lastname = lastname;
        }

        User.update(user, function (err, updatedUser) {
            if (err) {
                res.statusCode = 400;
                res.end();
            } else {
                req.session.passport.user.firstname = updatedUser.firstname;
                req.session.passport.user.lastname = updatedUser.lastname;
                req.session.passport.user.email = updatedUser.email;
                req.session.passport.user.username = updatedUser.firstname + ' ' + updatedUser.lastname;
                res.statusCode = 200;
                res.end();
            }
        });
    },

    /** Register User **/
    register: function (email, password, firstname, lastname, google_id, facebook_id, callback) {

        // Validate
        var response = validate(email, password, firstname, lastname);
        if (response.status === 200) {

            // Check if the email is not already registered
            User.getByField('email', email, function (err, existingUser) {
                if (!existingUser) {

                    // Crypt password
                    utils.cryptPassword(password, function (err, encryptedPassword) {

                        if (err) {
                            console.error('Error encrypting password');
                            response.status = 400;
                            callback(null, response);
                        } else {

                            // Save the user
                            User.save(User.new(email, encryptedPassword, firstname, lastname, google_id, facebook_id), function (err, id) {
                                if (err) {
                                    response.status = 400;
                                    response.errors.push('Registration has failed: ' + err);
                                    callback(err, response);
                                } else {
                                    console.log('[Brain Games]\tUser registered: [ID = ' + id + ', email = ' + email + ']');
                                    callback(null, response);
                                }
                            });
                        }
                    });

                } else {
                    response.status = 400;
                    response.errors.push('Email is already registered');

                    callback(null, response);
                }
            });

        } else {
            callback(null, response);
        }
    },

    /* Login a user by the provided 'email' and 'password' */
    localAuthentication: function (email, password, done) {
        // Get user by email and try to log in
        User.getByField('email', email, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }

            UserController.login(user, password, done);
        });
    },

    /* Used by the Google Authentication. Gets a user by his identifier if he exists, or registers him based on his profile information otherwise. */
    googleAuthentication: function (identifier, profile, done) {

        // Get user by his google identifier and try to log in
        User.getByField('google_id', identifier, function (err, user) {
            if (err) {
                return done(err);
            }

            // If the user does not exist, register him and then log in
            if (user == null) {
                var email = profile.emails[0].value;
                var firstname = profile.name.givenName;
                var lastname = profile.name.familyName;
                // For the Google Authentication we use the Google Identifier as the default password
                var password = identifier;

                UserController.register(email, password, firstname, lastname, identifier, null, function (err) {
                    if (err) {
                        return done(err);
                    }

                    User.getByField('google_id', identifier, function (err, newUser) {
                        if (err) {
                            return done(err);
                        }

                        // Log in
                        UserController.login(newUser, password, done);
                    });
                });
            } else {
                // If he exists, just log in
                return done(null, user);
            }
        });
    },

    /* Used by the Facebook Authentication. Gets a user by his accessToken if he exists, or registers him based on his profile information otherwise. */
    facebookAuthentication: function(accessToken, refreshToken, profile, done) {

        if (accessToken) {
            var facebookId = profile.id;

            // Get user by his google identifier and try to log in
            User.getByField('facebook_id', facebookId, function (err, user) {
                if (err) {
                    return done(err);
                }

                // If the user does not exist, register him and then log in
                if (user == null) {
                    var email = profile.emails[0].value;
                    var firstname = profile.name.givenName;
                    var lastname = profile.name.familyName;
                    // For the Facebook Authentication we use the Facebook id as the password
                    var password = facebookId;

                    UserController.register(email, password, firstname, lastname, null, facebookId, function (err) {
                        if (err) {
                            return done(err);
                        }

                        User.getByField('facebook_id', facebookId, function (err, newUser) {
                            if (err) {
                                return done(err);
                            }

                            // Log in
                            UserController.login(newUser, password, done);
                        });
                    });
                } else {
                    // If he exists, just log in
                    return done(null, user);
                }
            });
        }
    },

    /* Login request */
    login: function (user, password, done) {
        utils.comparePassword(password, user.password, function (err, isMatch) {
            if (err || !isMatch) {
                return done(null, false);
            } else {
                return done(null, user);
            }
        });
    }
};


/** Validate registration data **/
function validate(email, password, firstname, lastname) {
    var response = {status: 200, errors: []};

    if (!email || email.trim() === '') {
        response.status = 400;
        response.errors.push('Must specify an email');
    }
    if (!password || password.trim() === '') {
        response.status = 400;
        response.errors.push('Must specify a password');
    }
    if (!firstname || firstname.trim() === '') {
        response.status = 400;
        response.errors.push('Must specify a firstname');
    }
    if (!lastname || lastname.trim() === '') {
        response.status = 400;
        response.errors.push('Must specify a lastname');
    }

    return response;
}

module.exports = UserController;