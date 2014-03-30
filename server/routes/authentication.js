var path = require('path');

// Home page
app.get('/', function (req, res) {
    if (req.isAuthenticated()) {
        console.log('Autheticated!: ' + req.session.passport.user.firstname);
    }
    console.log(req.session);
    console.log(req.cookies);
	res.sendfile('/views/index.html', {root:  path.resolve(__dirname, '..')} );
});

// Login page
app.get('/signin', function (req, res) {
	res.sendfile('/views/signin.html', {root: path.resolve(__dirname, '..')} );
});

// Authenticate request
app.post('/auth/local', 
    passport.authenticate('local', { failureRedirect: '/auth/failure' }),
    function (req, res) {
        res.redirect('/');
    }
);

// Logout
app.get('/logout', function (req, res){
  req.logout();
  res.redirect('/');
});

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
