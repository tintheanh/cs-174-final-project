const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const { spawn } = require('child_process');

const db = require('../database/db');
const constants = require('../utils/constants');
const validation = require('../utils/validation');

exports.register = function(req, res) {
	const credentials = {
		username: req.body.username,
		password: req.body.password
	};

	const isValid = validation.validate(credentials); // Server-side validation

	if (!isValid) return res.status(403).send({ message: 'Invalid input.' });

	let sql = 'SELECT * FROM users WHERE username=?';

	// node-mysql library automatically performs escaping (sanitizing) when using '?' placeholder.
	// See https://github.com/felixge/node-mysql#escaping-query-values
	db.query(sql, [ credentials.username ], (err, result) => {
		if (err) {
			console.log(err.sqlMessage);
			return res.status(500).send({ message: 'Server error occured.' });
		}
		if (result.length) {
			return res.status(406).send({ message: 'User already existed.' });
		}
		const salt = bcrypt.genSaltSync(constants.SALT_ROUNDS); // Salt for password
		const tokenSalt = bcrypt.genSaltSync(constants.SALT_TOKEN_ROUNDS); // Salt for jwt
		const neuralNetFile = uuidv4(); // neural net file name

		const passwordHashed = bcrypt.hashSync(credentials.password, salt);

		sql = 'INSERT INTO users (username, password, salt, tokenSalt, neuralNetFile) VALUES (?, ?, ?, ?, ?)';

		db.query(sql, [ credentials.username, passwordHashed, salt, tokenSalt, neuralNetFile ], (err, result) => {
			if (err) {
				console.log(err.sqlMessage);
				return res.status(500).send({ message: 'Server error occured.' });
			}
			if (result) {
				// Run python script
				const pythonProcess = spawn('python3', [
					constants.PYTHON_SCRIPT,
					constants.NUM_HIDDEN_LAYERS,
					constants.WIDTH,
					constants.ACTIVATION_FUNC,
					constants.LEARNING_RATE,
					constants.DROPOUT,
					constants.EPOCHS,
					neuralNetFile
				]);

				pythonProcess.stdout.on('data', (data) => {
					console.log('Neural net created ' + data.toString());
				});

				return res.status(200).send({ message: 'Register successfully.' });
			}
			return res.status(500).send({ message: 'Server error occured.' });
		});
	});
};

exports.login = function(req, res) {
	const credentials = {
		username: req.body.username,
		password: req.body.password
	};

	const isValid = validation.validate(credentials); // Server-side validation

	if (!isValid) return res.status(403).send({ message: 'Invalid input.' });

	const userIP = req.clientIp;
	const userAgent = req.headers['user-agent'];

	// Hash both user ip and user agent string and send back to client
	// for later verification as a way to prevent JWT hijacking
	const userIPHashed = bcrypt.hashSync(userIP, constants.FIXED_SALT);
	const userAgentHashed = bcrypt.hashSync(userAgent, constants.FIXED_SALT);

	const totalHash = userIPHashed.concat(userAgentHashed);

	const sql = 'SELECT * FROM users WHERE username=?';

	db.query(sql, [ credentials.username ], (err, result) => {
		if (err) {
			console.log(err.sqlMessage);
			return res.status(500).send({ message: 'Server error occured.' });
		}
		if (!result.length) return res.status(404).send({ message: 'User does not exist.' });

		const { password, salt, tokenSalt } = result[0]; // Retrieve data values from row
		const passwordHashed = bcrypt.hashSync(credentials.password, salt);
		if (password === passwordHashed) {
			const userData = {
				username: result[0].username,
				hash: totalHash
			};

			// Signing token and send to client
			const token = jwt.sign(userData, tokenSalt, {
				expiresIn: constants.JWT_EXPIRATION
			});

			return res.status(200).send({ token });
		}

		return res.status(403).send({ message: 'Username or password incorrect.' });
	});
};

// Verify JWT
exports.verify = function(req, res) {
	const { token, username, hash } = req.body;

	if (!username) {
		// Bash when body data does not come with username
		return res.status(403).send({ decoded: null, message: 'Invalid token.' });
	}

	const userIP = req.clientIp;
	const userAgent = req.headers['user-agent'];

	const userIPHashed = bcrypt.hashSync(userIP, constants.FIXED_SALT);
	const userAgentHashed = bcrypt.hashSync(userAgent, constants.FIXED_SALT);

	const totalHash = userIPHashed.concat(userAgentHashed);

	if (hash !== totalHash) {
		// Eventhough JWT is stolen
		// if the pass-down hash value is not the same as the hash based on current ip and agent string
		// cannot break through this security
		return res.status(403).send({ decoded: null, message: 'Invalid token.' });
	}

	const sql = 'SELECT * FROM users WHERE username=?';

	db.query(sql, [ username ], (err, result) => {
		if (err) {
			console.log(err.sqlMessage);
			return res.status(500).send({ message: 'Server error occured.' });
		}
		if (!result.length) {
			// Username does not exist in DB
			return res.status(403).send({ decoded: null, message: 'Invalid token.' });
		}

		const { tokenSalt } = result[0]; // Retrieve tokenSalt from row
		try {
			const decoded = jwt.verify(token, tokenSalt);
			if (decoded.username === username) return res.status(200).send({ decoded, message: 'Valid token.' });

			return res.status(403).send({ decoded: null, message: 'Invalid token.' });
		} catch (err) {
			return res.status(403).send({ decoded: null, message: 'Invalid token.' });
		}
	});
};

exports.logout = function(req, res) {
	const { username } = req.body;

	// Update user's salt as a way to invalidate unexpired JWT when user log out
	const sql = 'UPDATE users SET tokenSalt=? WHERE username=?';
	const newTokenSalt = bcrypt.genSaltSync(constants.SALT_TOKEN_ROUNDS);

	db.query(sql, [ newTokenSalt, username ], (err, result) => {
		if (err) {
			console.log(err.sqlMessage);
			return res.status(500).send({ message: 'Server error occured.' });
		}
		if (result) return res.status(200).send({ message: 'Log out successfully.' });

		return res.status(500).send({ message: 'Server error occured.' });
	});
};

exports.upload = function(req, res) {
	const { token, username, image, hash } = req.body;

	if (!username) {
		// Bash when body data does not come with username
		return res.status(403).send({ message: 'Not authorized.' });
	}

	const userIP = req.clientIp;
	const userAgent = req.headers['user-agent'];

	const userIPHashed = bcrypt.hashSync(userIP, constants.FIXED_SALT);
	const userAgentHashed = bcrypt.hashSync(userAgent, constants.FIXED_SALT);

	const totalHash = userIPHashed.concat(userAgentHashed);

	if (hash !== totalHash) {
		// Eventhough JWT is stolen
		// if the pass-down hash value is not the same as the hash based on current ip and agent string
		// cannot break through this security
		return res.status(403).send({ message: 'Not authorized.' });
	}

	if (!image) {
		// Receive no image
		return res.status(406).send({ message: 'No image uploaded.' });
	}

	const sql = 'SELECT * FROM users WHERE username=?';

	db.query(sql, [ username ], (err, result) => {
		if (err) {
			console.log(err.sqlMessage);
			return res.status(500).send({ message: 'Server error occured.' });
		}
		if (!result.length) {
			// Username does not exist in DB
			return res.status(403).send({ message: 'Not authorized.' });
		}
		const { tokenSalt, neuralNetFile } = result[0]; // Retrieve tokenSalt from row
		try {
			const decoded = jwt.verify(token, tokenSalt);
			if (decoded.username === username) {
				// Calculate image file size
				const off = image[image.length - 2] === '=' ? 2 : 1;
				const fileSize = image.length * (3 / 4) - off;

				if (fileSize <= constants.FILE_SIZE_LIMIT) {
					// Only allow image <= 50KB
					const pythonProcess = spawn('python3', [ constants.PYTHON_SCRIPT, image, neuralNetFile ]);
					pythonProcess.stdout.on('data', (data) => {
						const result = data.toString().split(',');
						return res.status(200).send({ number: result[0], prob: result[1] });
					});
				} else return res.status(406).send({ message: 'Image is too big.' });
			} else return res.status(403).send({ message: 'Not authorized.' });
		} catch (err) {
			return res.status(403).send({ message: 'Not authorized.' });
		}
	});
};
