/**
 * Routes Index
**/


// Intercept all routes under /secure and check if the user is authenticated
app.all('/secure/*', checkAuthentication);

// Default page
app.get('/', function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/secure/home');
    } else {
        res.render('index');
    }
});

// Include authentication-related routes
require('./authentication-routes');

// Include home-related routes
require('./home-routes');

// Include game-related routes
require('./game-routes');

// Include chat-related routs
require('./chat-routes');

/* Checks if user is authenticated. If not, it redirects to the login page */
function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
    	next();
    } else { 
    	res.render('signin', { error: '' , nextUrl: req.url });
	}
}