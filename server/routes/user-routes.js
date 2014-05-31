/**
 * Authentication-related Routes
**/

var config = require('../commons/config'),
    UserController = require('../controllers/user-controller'),
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

// Register page
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
            res.redirect('/secure/home');
        }
    }
);

// Register request
app.post('/register', function (req, res) {
    UserController.register(req.body.email, req.body.password, req.body.firstname, req.body.lastname, function (err, response) {
        
        // If registered successfully, login. Else, display error message
        if (response.status === 200) {
            User.getByEmail(req.body.email, function (err, user) {

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

// Get user information
app.get('/secure/user', function (req, res) {
    UserController.getUserInformation(req, res);
});

// Update user information
app.put('/secure/user', function (req, res) {
    UserController.updateUserInformationRequest(req, res);
});

// Get profile page
app.get('/secure/profile', function (req, res) {
    res.render('profile', {username: req.user.username});
});
