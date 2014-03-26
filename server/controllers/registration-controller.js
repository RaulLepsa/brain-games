var User = require('../model/user-model');

/** Register User **/
function register(email, password, firstname, lastname, callback) {

	// Validate
	var response = validate(email, password, firstname, lastname);
	if (response.status === 200) {

		// Check if the email is not already registered
		User.getByEmail(email, function (err, existingUser) {
			if (!existingUser) {
				//TODO: crypt password
				User.save(User.new(email, password, firstname, lastname), function (err, id) {
					if (err) {
						response.status = 400;
						response.errors.push('Registration has failed: ' + err);
						callback(err, response);
					} else {
						console.log('User registered: [ID = ' + id + ', email = ' + email + ']');
						callback(null, response);
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

/** Validate registration data **/
function validate(email, password, firstname, lastname) {
	var	response = {status: 200, errors: []};
	
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

module.exports.register = register;