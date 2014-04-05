/**
 * Routes Index
**/


// Intercept all routes under /secure and check if the user is authenticated
app.all('/secure/*', checkAuthentication);

// Include authentication-related routes
require('./authentication');

// Home page
app.get('/', function (req, res) {
    if (req.isAuthenticated()) {
        console.log('Authenticated!: ' + req.session.passport.user.firstname);
    }
    console.log(req.session);
    console.log(req.cookies);
    res.render('index');
});

/* Checks if user is authenticated. If not, it redirects to the login page */
function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
    	next();
    } else { 
    	res.render('signin', { error: '' });
	}
};