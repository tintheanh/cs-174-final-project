const mysql = require('mysql');

// Modify database login info here
const connection = mysql.createConnection({
	host: process.env.HOST_DB,
	user: process.env.USER_DB,
	password: process.env.PASSWORD_DB,
	database: process.env.DATABASE
});

connection.connect((err) => {
	if (err) return console.log(err.message);

	const createUsers = `CREATE TABLE IF NOT EXISTS users(
		username VARCHAR(32) NOT NULL UNIQUE,
		password VARCHAR(255) NOT NULL,
		salt VARCHAR(32) NOT NULL,
		tokenSalt VARCHAR(32) NOT NULL,
		fileValues VARCHAR(128) NOT NULL,
		neuralNetFile VARCHAR(64) NOT NULL UNIQUE
	)`;

	connection.query(createUsers, (err) =>{
		if (err) return console.log(err.message);
	});
});

const db = connection;

module.exports = db;
