/**
 * Game-related Routes
**/

// Games page
app.get('/secure/games', function (req, res) {
	var title = req.user.firstname + ' ' + req.user.lastname;
    res.render('games', {title: title} );
});