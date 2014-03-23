/**
	Holds application configurations
**/
var config = {}

// Web and DB configurations
config.web = {};
config.web.port = '3000';

config.db = {};
config.db.server = 'localhost';
config.db.port = '5432';
config.db.user = 'rlepsa';
config.db.password = '';
config.db.database = 'braingames';


module.exports = config;