const mysql = require('mysql');

// Modify database login info here
const connection = mysql.createConnection({
	host: process.env.HOST_DB,
	user: process.env.USER_DB,
	password: process.env.PASSWORD_DB,
	database: process.env.DATABASE
});

connection.connect();

const db = connection;

module.exports = db;
