/**
 * Routes Index
**/


// Intercept all routes under /secure and check if the user is authenticated
app.all('/secure/*', checkAuthentication);

// Include authentication-related routes
require('./authentication');

// Include home-related routes
require('./home');

// Default page
app.get('/', function (req, res) {
    if (req.isAuthenticated()) {
        console.log('Authenticated!: ' + req.session.passport.user.firstname);
    }
    res.render('index');
});

/* Checks if user is authenticated. If not, it redirects to the login page */
function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
    	next();
    } else { 
    	res.render('signin', { error: '' });
    	//TODO: After signing in from an intercepted /secure page, it should take the user to that page
	}
};