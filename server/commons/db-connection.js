var pg = require('pg'),
	db = require('./config').db;

// Connect to the PG instance
var client = new pg.Client('postgres://' + db.user + ':' + db.password + '@' + db.server + ':' + db.port + '/' + db.database);

try {
	client.connect();
} catch(err) {
	console.error('Error connecting to PostgreSQL server:\n\t' + err);
	throw err;
}

// Export the connection to use it from other modules
module.exports = client;