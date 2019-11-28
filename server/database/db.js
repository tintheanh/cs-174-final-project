const mysql = require('mysql');

// Modify database login info here
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: ''
});

connection.connect();

const db = connection;

module.exports = db;
