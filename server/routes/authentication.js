var path = require('path'),
    passport = require('passport');

require('../auth')(app, passport);

// Home page
app.get('/', function (req, res) {
	res.sendfile('/views/index.html', {root:  path.resolve(__dirname, '..')} );
});

// Login page
app.get('/signin', function (req, res) {
	res.sendfile('/views/signin.html', {root: path.resolve(__dirname, '..')} );
});

// Authenticate request
app.post('/auth/local', 
    passport.authenticate('local', { successRedirect: '/auth/success', failureRedirect: '/auth/failure' })
);

// Resgister page
app.get('/signup', function (req, res) {
	res.sendfile('/views/signup.html', {root: path.resolve(__dirname, '..')} );
});

// Register request
app.post('/register', function (req, res) {
    var RegistrationController = require('../controllers/registration-controller');
    RegistrationController.register(req.body.email, req.body.password, req.body.firstname, req.body.lastname, function (err, response) {
        if (response.status === 200) {
            // authenticate
        }
        res.redirect('/register?' + JSON.stringify(response));
    });
});

// Express default page
app.get('/express', function (req, res) {
	res.render('index', { title: 'Express' });
});
