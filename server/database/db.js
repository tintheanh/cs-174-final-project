const mysql = require('mysql');

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'password',
	database: 'homework'
});

connection.connect();

const db = connection;

module.exports = db;
