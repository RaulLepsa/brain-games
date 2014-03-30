var express = require('express'),
    path = require('path'),
    config = require('./commons/config'),
    SECRET_KEY = 'Gee, Brain, what do you want to do tonight?';
    
// Create server and make variable available to other modules
app = module.exports = express.createServer();

// Make passport available to other modules
passport = require('passport');

// Configuration
app.configure(function() {
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: SECRET_KEY }));                 // Session support
  app.use(passport.initialize());                                   // Initialize passport.js
  app.use(passport.session());                                      // Passport Session
  app.use(app.router);                                              // Serve routes
  app.use(express.static(path.resolve(__dirname,'../public')));     // Set path to static public files such as scripts and stylesheets
  app.use(express.csrf());                                          // Ensure that page requests are coming from own site                             
  app.set('views', __dirname + '/views');                           // Set views directory
  app.set('view engine', 'ejs');                                    // View engine
  app.use(express.methodOverride());                                // Allow method override (put, delete)
});

// Passport authentication config file
require('./auth')(app, passport);

// Routes
require('./routes');

// Now less files with @import 'whatever.less' will work(https://github.com/senchalabs/connect/pull/174)
var TWITTER_BOOTSTRAP_PATH = '../vendor/twitter/bootstrap/less';
express.compiler.compilers.less.compile = function(str, fn) {
  try {
    var less = require('less');var parser = new less.Parser({paths: [TWITTER_BOOTSTRAP_PATH]});
    parser.parse(str, function(err, root){fn(err, root.toCSS());});
  } catch (err) {fn(err);}
}

// Start server
app.listen(config.web.port, function() {
  console.log("Brain Games server listening on port %d in %s mode", app.address().port, app.settings.env);
});
