var pg = require('pg'),
	db = require('./config').db;

// Connect to the PG instance
var url = 'postgres://' + db.user + ':' + db.password + '@' + db.server + ':' + db.port;
var client = new pg.Client(url + '/' + db.database);

client.connect(function (err) {
	if (err) {
		console.error('Error connecting to PostgreSQL server: ' + url + '\n' + err);
		throw err;
	}
});

// Export the connection to use it from other modules
module.exports = client;