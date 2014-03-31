var path = require('path'),
    config = require('../commons/config'),
    User = require('../model/user-model');

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
    console.log(req.session);
    console.log(req.cookies);
    res.render('signin', { error: req.flash('error') } );      // Display an error message if it's the case (e.g. redirected from invalid login)
});

// Authenticate request
app.post('/auth/local',
    passport.authenticate('local', 
        { failureRedirect: '/signin', failureFlash: 'Invalid username or password' }
    ),
    
    // Called if authentication is successful
    function (req, res) {
        if (req.body.remember) {
            // If remember-me was checked, set a max age for the session
            req.session.cookie.maxAge = config.web.sessionMaxAge;
        } else {
            // Else, session expires when closing the browser
            req.session.cookie.maxAge = null;
        }
        
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
    console.log(req.flash());
	res.render('signup', { error: req.flash('info') });
});

// Register request
app.post('/register', function (req, res) {
    var RegistrationController = require('../controllers/registration-controller');
    RegistrationController.register(req.body.email, req.body.password, req.body.firstname, req.body.lastname, function (err, response) {
        // If registered successfully, login 
        if (response.status === 200) {
            User.getByEmail(req.body.email, function (err, user) {
                req.login(user, function (err) {
                    res.redirect('/');
                });
            });
        } else {
            req.flash('info', 'aa');
            res.redirect('/signup');
        }
    });
});

// Express default page
app.get('/express', function (req, res) {
	res.render('index', { title: 'Express' });
});
