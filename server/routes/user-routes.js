/**
 * Authentication-related Routes
**/

var config = require('../commons/config'),
    UserController = require('../controllers/user-controller'),
    User = require('../model/user-model');

/** USER INFORMATION **/

// Get user information
app.get('/secure/user', function (req, res) {
    UserController.getUserInformation(req, res);
});

// Update user information
app.put('/secure/user', function (req, res) {
    UserController.updateUserInformationRequest(req, res);
});

/** PAGES **/

// Get profile page
app.get('/secure/profile', function (req, res) {
    res.render('profile', {username: req.user.username});
});

// Login page
app.get('/signin', function (req, res) {
    res.render('signin', { error: req.flash('error'), nextUrl: '' } ); 
});

// Logout
app.get('/signout', function (req, res){
  req.logout();
  res.redirect('/');
});

// Register page
app.get('/signup', function (req, res) {
    res.render('signup', { error: req.flash('error') });
});


/** AUTHENTICATION **/

// Local authentication request
app.post('/auth/local',
    passport.authenticate('local', 
        { failureRedirect: '/signin', failureFlash: 'Invalid username or password' }
    )
    , authenticationSuccessfull
);

// Google authentication requests
app.get('/auth/google', passport.authenticate('google'));
app.get('/auth/google/return',
    passport.authenticate('google',
        { failureRedirect: '/signin', failureFlash: 'Invalid username or password' }
    )
    , authenticationSuccessfull
);

// Called if authentication is successful
function authenticationSuccessfull(req, res) {
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
        res.redirect('/secure/home');
    }
}

/** REGISTRATION **/

// Register request
app.post('/register', function (req, res) {
    UserController.register(req.body.email, req.body.password, req.body.firstname, req.body.lastname, null, function (err, response) {
        
        // If registered successfully, login. Else, display error message
        if (response.status === 200) {
            User.getByField('email', req.body.email, function (err, user) {

                // Login User
                req.login(user, function (err) {
                    if (err) {
                        req.flash('error', 'Server error on login. Please try again later.');
                        res.redirect('/signup');
                    } else {
                        res.redirect('/');
                    }
                });
            });
        } else {
            req.flash('error', response.errors);
            res.redirect('/signup');
        }
    });
});
