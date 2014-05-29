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

        if (firstname && email) {
            if (newPassword) {
                // If the user wants the password changed, check if the old one is specified
                if (!oldPassword) {
                    res.statusCode = 400;
                    res.end();
                } else {
                    // Check if the old password matches the DB
                    User.getById(req.user.id, function(err, user) {
                        utils.comparePassword(oldPassword, user.password, function (err, isMatch) {
                            if (!isMatch) {
                                res.json(200, {error: 'Incorrect value specified for Old password'});
                            } else {
                                // If everything is ok, crypt the new password and call the update function
                                utils.cryptPassword(newPassword, function(err, encryptedPassword) {
                                    UserController.updateUserInformation(req, res, firstname, lastname, email, encryptedPassword);
                                });
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
                req.user.firstname = updatedUser.firstname;
                req.user.lastname = updatedUser.lastname;
                req.user.email = updatedUser.email;
                res.statusCode = 200;
                res.end();
            }
        });
    },

    /** Register User **/
    register: function (email, password, firstname, lastname, callback) {

        // Validate
        var response = validate(email, password, firstname, lastname);
        if (response.status === 200) {

            // Check if the email is not already registered
            User.getByEmail(email, function (err, existingUser) {
                if (!existingUser) {

                    // Crypt password
                    utils.cryptPassword(password, function(err, encryptedPassword) {

                        if (err) {
                            console.error('Error encrypting password');
                            response.status = 400;
                            callback(null, response);
                        } else {

                            // Save the user
                            User.save(User.new(email, encryptedPassword, firstname, lastname), function (err, id) {
                                if (err) {
                                    response.status = 400;
                                    response.errors.push('Registration has failed: ' + err);
                                    callback(err, response);
                                } else {
                                    console.log('User registered: [ID = ' + id + ', email = ' + email + ']');
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