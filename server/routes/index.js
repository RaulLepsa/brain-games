var path = require('path');

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
