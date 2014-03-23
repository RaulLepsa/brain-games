var path = require('path'),
db=require('../commons/db-connection').db;

// Home page
app.get('/', function (req, res) {
	res.sendfile('/views/index.html', {root:  path.resolve(__dirname, '..')} );
});

// Login page
app.get('/signin', function (req, res) {
	db.query('SELECT * FROM users', 
        function (err, result) {
        	console.log(result.rowCount);
            if (err) {
                console.log(err);
                callback(err);
            } else if (result.rowCount > 0) {
                callback('Email is already registered');
            } 
        }
    );
	res.sendfile('/views/signin.html', {root: path.resolve(__dirname, '..')} );
});

// Resgister page
app.get('/signup', function (req, res) {
	res.sendfile('/views/signup.html', {root: path.resolve(__dirname, '..')} );
});

// Express default page
app.get('/express', function (req, res) {
	res.render('index', { title: 'Express' });
});
