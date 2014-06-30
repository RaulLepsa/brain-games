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

// About page
app.get('/about', function (req, res) {
    res.render('about');
});

// Home page
app.get('/secure/home', function (req, res) {
    res.render('home', {username: req.user.username} );
});

// Include authentication-related routes
require('./user-routes');

// Include game-related routes
require('./game-routes');

// Include chat-related routes
require('./chat-routes');

// Include statistics-related routes
require('./stats-routes');

/* Checks if user is authenticated. If not, it redirects to the login page */
function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
    	next();
    } else { 
    	res.render('signin', { error: '' , nextUrl: req.url });
	}
}