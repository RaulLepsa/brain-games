var express = require('express')
    , path = require('path')
    , flash = require('connect-flash')
    , config = require('./commons/config')
    , http = require('http');

// Create express application and make 'app' variable available to other modules
app = module.exports = express();

// Create Server
var server = http.createServer(app);

// Set a 'server' parameter to the application (required for socket.io)
app.server = server;

// Make passport available to other modules
passport = require('passport');

// Manage environment variables 
var env = require('habitat').load(path.resolve(__dirname, 'brain-games.env'));

// Configuration
app.configure(function () {
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({ key: 'brain-games.sid',
        secret: env.get('SESSION_SECRET'),
        cookie: {httpOnly: true, maxAge: null}
    }));                                                              // Session support
    app.use(flash());                                                 // Use flash messages
    app.use(passport.initialize());                                   // Initialize passport.js
    app.use(passport.session());                                      // Passport Session
    app.use(app.router);                                              // Serve routes
    app.use(express.static(path.resolve(__dirname, '../public')));    // Set path to static public files such as scripts and stylesheets
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
server.listen(config.web.port, config.web.host, function () {
    console.info("Brain Games server listening on port %d in %s mode", config.web.port, app.settings.env);
});
