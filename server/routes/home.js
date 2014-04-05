/**
 * Homepage-related Routes
**/

// Home page
app.get('/secure/home', function (req, res) {
	var title = req.user.firstname + ' ' + req.user.lastname;
    res.render('home', {title: title} );
});