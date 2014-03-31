var path = require('path');

/* Checks if user is authenticated. If not, it redirects to the login page */
function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
    	next();
    } else { 
    	res.render('signin', { error: '' });
	}
};

// Intercept all routes under /secure and check if the user is authenticated
app.all('/secure/*', checkAuthentication);

// Include authentication-related routes
require('./authentication');

// Home page
app.get('/', function (req, res) {
	res.sendfile('/views/index.html', {root:  path.resolve(__dirname, '..')} );
});

// Express default page
app.get('/express', function (req, res) {
	res.render('index', { title: 'Express' });
});