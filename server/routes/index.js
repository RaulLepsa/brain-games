var path = require('path'),
    passport = require('passport');
    //GoogleStrategy = require('passport-google').Strategy,

// passport.use(new GoogleStrategy({
//         returnURL: 'http://localhost:3000/',                        // Redirect URL
//         realm: 'http://localhost:3000/'                             // Part of the website for which authentication is valid
//     },
//     function (identifier, profile, done) {
//         User.findOrCreate({ openId: identifier }, function (err, user) {
//             done(err, user);
//         });
//     }
// ));

// // Redirect the user to Google for authentication. When complete, Google will redirect the user back to the application at /auth/google/return
// app.get('/auth/google', passport.authenticate('google'));

// // Google will redirect the user to this URL after authentication. Finish the process by verifying the assertion. 
// // If valid, the user will be logged in.  Otherwise, authentication has failed.
// app.get('/auth/google/return', 
//     passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' })
// );

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
    RegistrationController.register(req.body.email, req.body.password, req.body.firstname, req.body.lastname, function(err, response) {
        //TODO: treat response
    });
});

// Express default page
app.get('/express', function (req, res) {
	res.render('index', { title: 'Express' });
});
