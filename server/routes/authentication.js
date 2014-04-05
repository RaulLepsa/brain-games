/**
 * Authentication-related Routes
**/

var config = require('../commons/config'),
    RegistrationController = require('../controllers/registration-controller'),
    User = require('../model/user-model');

// Login page
app.get('/signin', function (req, res) {
    res.render('signin', { error: req.flash('error'), nextUrl: '' } ); 
});

// Logout
app.get('/signout', function (req, res){
  req.logout();
  res.redirect('/');
});

// Resgister page
app.get('/signup', function (req, res) {
    res.render('signup', { error: req.flash('error') });
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
        
        if (req.body['next-url']) {
            res.redirect(req.body['next-url']);
        } else {
            res.redirect('/home');
        }
    }
);

// Register request
app.post('/register', function (req, res) {
    RegistrationController.register(req.body.email, req.body.password, req.body.firstname, req.body.lastname, function (err, response) {
        
        // If registered successfully, login. Else, display error message
        if (response.status === 200) {
            User.getByEmail(req.body.email, function (err, user) {
                req.login(user, function (err) {
                    res.redirect('/');
                });
            });
        } else {
            req.flash('error', response.errors);
            res.redirect('/signup');
        }
    });
});
