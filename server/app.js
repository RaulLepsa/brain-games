var express = require('express'),
    path = require('path'),
    flash = require('connect-flash'),
    config = require('./commons/config');                          

// Create server and make variable available to other modules
app = module.exports = express();

// Make passport available to other modules
passport = require('passport');

// Manage environment variables 
var env = require('habitat').load(path.resolve(__dirname, 'brain-games.env'));

// Configuration
app.configure(function() {
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ key: 'brain-games.sid', 
                            secret: env.get('SESSION_SECRET'), 
                            cookie: {httpOnly: true, maxAge: 0} 
  }));                                                              // Session support
  app.use(passport.initialize());                                   // Initialize passport.js
  app.use(passport.session());                                      // Passport Session
  app.use(flash());
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

// Start server
app.listen(config.web.port, function() {
  console.log("Brain Games server listening on port %d in %s mode", config.web.port, app.settings.env);
});