/**
	Holds application configurations
**/
var config = {};

// Web and DB configurations
config.web = {};
config.web.host = 'localhost';
config.web.port = '3000';
config.web.protocol = 'http';
config.web.sessionMaxAge = 3 * 24 * 60 * 60 * 1000;		// Default session expiry time = 3 days

config.db = {};
config.db.server = 'localhost';
config.db.port = '5432';
config.db.user = 'rlepsa';
config.db.password = '';
config.db.database = 'braingames';


module.exports = config;