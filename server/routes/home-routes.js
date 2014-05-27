/**
 * Homepage-related Routes
**/

// Home page
app.get('/secure/home', function (req, res) {
    res.render('home', {title: req.user.username} );
});