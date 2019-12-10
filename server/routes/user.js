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

	const isValid = validation.validateCredentialsForm(credentials); // Server-side credentials validation
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
		const tokenSalt = bcrypt.genSaltSync(constants.SALT_TOKEN_ROUNDS); // Salt for JWT
		const neuralNetFile = uuidv4(); // neural net file name

		const passwordHashed = bcrypt.hashSync(credentials.password, salt);

		// Generate default neural net file
		const fileValues = JSON.stringify({
			num_hidden_layers: Number(constants.NUM_HIDDEN_LAYERS),
			width: Number(constants.WIDTH),
			activation_func: constants.ACTIVATION_FUNC,
			learning_rate: Number(constants.LEARNING_RATE),
			dropout: Number(constants.DROPOUT),
			epochs: Number(constants.EPOCHS)
		});

		sql =
			'INSERT INTO users (username, password, salt, tokenSalt, fileValues, neuralNetFile) VALUES (?, ?, ?, ?, ?, ?)';

		db.query(
			sql,
			[ credentials.username, passwordHashed, salt, tokenSalt, fileValues, neuralNetFile ],
			(err, result) => {
				if (err) {
					console.log(err.sqlMessage);
					return res.status(500).send({ message: 'Server error occured.' });
				}
				if (result) {
					// Run python script to create neural net file
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
			}
		);
	});
};

exports.login = function(req, res) {
	const credentials = {
		username: req.body.username,
		password: req.body.password
	};

	const isValid = validation.validateCredentialsForm(credentials); // Server-side credentials validation
	if (!isValid) return res.status(403).send({ message: 'Invalid input.' });

	const userIP = req.clientIp;
	const userAgent = req.headers['user-agent'];

	// Hash both user ip and user agent string and send back to client
	// for later verification as a way to prevent JWT hijacking
	const userIPHashed = bcrypt.hashSync(userIP, constants.FIXED_SALT);
	const userAgentHashed = bcrypt.hashSync(userAgent, constants.FIXED_SALT);

	const twoCombinedHash = userIPHashed.concat(userAgentHashed);

	const sql = 'SELECT * FROM users WHERE username=?';

	db.query(sql, [ credentials.username ], (err, result) => {
		if (err) {
			console.log(err.sqlMessage);
			return res.status(500).send({ message: 'Server error occured.' });
		}
		if (!result.length) return res.status(404).send({ message: 'User does not exist.' });

		const { username, password, salt, tokenSalt, fileValues } = result[0]; // Retrieve data values from row
		const passwordHashed = bcrypt.hashSync(credentials.password, salt);
		if (password === passwordHashed) {
			const userData = {
				username,
				fileValues,
				hash: twoCombinedHash
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

	// console.log(token + '\n');

	if (!username) {
		// Bash when body data does not come with username
		return res.status(403).send({ decoded: null, message: 'Invalid token.' });
	}

	const userIP = req.clientIp;
	const userAgent = req.headers['user-agent'];

	const userIPHashed = bcrypt.hashSync(userIP, constants.FIXED_SALT);
	const userAgentHashed = bcrypt.hashSync(userAgent, constants.FIXED_SALT);

	const twoCombinedHash = userIPHashed.concat(userAgentHashed);

	if (hash !== twoCombinedHash) {
		// Eventhough JWT is stolen
		// if the pass-down hash value is not the same as the hash based on current ip and agent string
		// cannot break through this security
		return res.status(403).send({ message: 'Invalid token.' });
	}

	const sql = 'SELECT * FROM users WHERE username=?';

	db.query(sql, [ username ], (err, result) => {
		if (err) {
			console.log(err.sqlMessage);
			return res.status(500).send({ message: 'Server error occured.' });
		}
		if (!result.length) {
			// Username does not exist in DB
			return res.status(403).send({ message: 'Invalid token.' });
		}

		const { tokenSalt } = result[0]; // Retrieve tokenSalt from row
		try {
			const decoded = jwt.verify(token, tokenSalt);
			if (decoded.username === username) return res.status(200).send({ message: 'Valid token.' });

			return res.status(403).send({ message: 'Invalid token.' });
		} catch (err) {
			return res.status(403).send({ message: 'Invalid token.' });
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

exports.updateFileValues = function(req, res) {
	const { token, username, hash, fileValues } = req.body;

	if (!username) {
		// Bash when body data does not come with username
		return res.status(403).send({ decoded: null, message: 'Not authorized.' });
	}

	const userIP = req.clientIp;
	const userAgent = req.headers['user-agent'];

	const userIPHashed = bcrypt.hashSync(userIP, constants.FIXED_SALT);
	const userAgentHashed = bcrypt.hashSync(userAgent, constants.FIXED_SALT);

	const twoCombinedHash = userIPHashed.concat(userAgentHashed);

	if (hash !== twoCombinedHash) {
		// Eventhough JWT is stolen
		// if the pass-down hash value is not the same as the hash based on current ip and agent string
		// cannot break through this security
		return res.status(403).send({ message: 'Not authorized.' });
	}

	let sql = 'SELECT * FROM users WHERE username=?';

	db.query(sql, [ username ], (err, result) => {
		if (err) {
			console.log(err.sqlMessage);
			return res.status(500).send({ message: 'Server error occured.' });
		}
		if (!result.length) {
			// Username does not exist in DB
			return res.status(403).send({ message: 'Not authorized.' });
		}

		const isValid = validation.validatFileValuesForm(fileValues);
		if (!isValid) return res.status(403).send({ message: 'Invalid input.' });

		const { tokenSalt, neuralNetFile } = result[0]; // Retrieve tokenSalt from row
		try {
			const decoded = jwt.verify(token, tokenSalt);
			if (decoded.username === username) {
				const update = JSON.stringify(fileValues);
				sql = 'UPDATE users SET fileValues=? WHERE username=?';

				db.query(sql, [ update, username ], (err, result) => {
					if (err) {
						console.log(err.sqlMessage);
						return res.status(500).send({ message: 'Server error occured.' });
					}
					if (result) {
						const newFileValues = { ...fileValues };

						const pythonProcess = spawn('python3', [
							constants.PYTHON_SCRIPT,
							String(newFileValues.num_hidden_layers),
							String(newFileValues.width),
							newFileValues.activation_func,
							String(newFileValues.learning_rate),
							String(newFileValues.dropout),
							String(newFileValues.epochs),
							neuralNetFile
						]);

						pythonProcess.stdout.on('data', (data) => {
							console.log('Neural net updated ' + data.toString());
							return res.status(200).send({ newFileValues });
						});
					} else return res.status(500).send({ message: 'Server error occured.' });
				});
			} else return res.status(403).send({ message: 'Not authorized.' });
		} catch (err) {
			return res.status(403).send({ message: 'Not authorized.' });
		}
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

	const twoCombinedHash = userIPHashed.concat(userAgentHashed);

	if (hash !== twoCombinedHash) {
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

		const { tokenSalt, neuralNetFile } = result[0]; // Retrieve tokenSalt and neuralNetFile from row
		try {
			const decoded = jwt.verify(token, tokenSalt);
			if (decoded.username === username) {
				// Calculate image file size
				const off = image[image.length - 2] === '=' ? 2 : 1;
				const fileSize = image.length * (3 / 4) - off;

				if (fileSize <= constants.FILE_SIZE_LIMIT) {
					// Only allow image <= 50KB
					// Run python script to predict the uploaded image
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
