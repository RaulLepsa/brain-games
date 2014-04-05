/**
 * Homepage-related Routes
**/

// Include game-related routes
require('./games');

// Home page
app.get('/secure/home', function (req, res) {
	var title = req.user.firstname + ' ' + req.user.lastname;
    res.render('home', {title: title} );
});