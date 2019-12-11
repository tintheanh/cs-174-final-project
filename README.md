# cs-174-final-project

This is the repository of CS 174 project

### **Members:**

- Anh Nguyen
- Gaston Garrido

*This project has three modules:*
- client
- server
- Neural_Network - credit to [ggmonx](https://github.com/ggmonx) for the module

## **Setup**
Each module has its own environment constants. Creating `.env` files and assigning constants to each file before running.

*List of needed constants in each `.env`*:

### **client:**
```python
REACT_APP_EXTERNAL_API_URL (server url, e.g., http://localhost:5000)
REACT_APP_FILE_SIZE_LIMIT (uploaded image file size limit in byte, e.g., 10000)
```

### **server:**
```python
PORT (e.g., 5000)
PAYLOAD_LIMIT (request payload size limit e.g., "200mb")

# Salt rounds is recommended using low values, it takes longer to hash with larger rounds
# See https://www.npmjs.com/package/bcrypt#a-note-on-rounds
SALT_ROUNDS (for password hashing, e.g., 6)
SALT_TOKEN_ROUNDS (for JWT signing, e.g., 6)

FIXED_SALT (secret salt for user IP & agent string hashing, preventing fake JWT and JWT hijacking, e.g., "$2b$10$m1VeKF0RKY/EPSPEIGyCY.")

# MYSQL credentials
HOST_DB
USER_DB
PASSWORD_DB
DATABASE

JWT_EXPIRATION (e.g., "10m")

FILE_SIZE_LIMIT (uploaded image size limit in byte, e.g, 10000)

PYTHON_SCRIPT="/absolute/path/to/neural_net.py/"

# Default arguments for training neural net
NUM_HIDDEN_LAYERS=2
WIDTH=100
ACTIVATION_FUNC="ReLU"
LEARNING_RATE=0.005
DROPOUT=0.5
EPOCHS=50
```

### **Neural_Network:**
```
BASE_PATH="/absolute/path/to/folder/Neural_Network"
```

### **MYSQL user table structure:**
| username    | password     | salt        | tokenSalt   | fileValues   | neuralNetFile (id) |
|-------------|--------------|-------------|-------------|--------------|--------------------|
| VARCHAR(32) | VARCHAR(255) | VARCHAR(32) | VARCHAR(32) | VARCHAR(128) | VARCHAR(64)        |


## **How to run**
Run client side
```
cd client
npm i && npm start
```

Run server
```
cd server
npm i && npm run dev
```

## **Application features**
### Secure authentication:
This application supports basic authentication in the most secure way. Using JWT containing hashed payload from both user IP and agent string which is generated from the server preventing JWT hijacking as well as fake JWT presented by malicious user.

#### Code highlight
```javascript
exports.verify = function(req, res) {
	const { token, username, hash } = req.body;

	if (!username) {
		// Bash when body data does not come with username
		return res.status(403).send({ message: 'Invalid token.' });
	}

	const userIP = req.clientIp;
	const userAgent = req.headers['user-agent'];

	const userIPHashed = bcrypt.hashSync(userIP, constants.FIXED_SALT);
	const userAgentHashed = bcrypt.hashSync(userAgent, constants.FIXED_SALT);

	const twoCombinedHash = userIPHashed.concat(userAgentHashed);

	if (hash !== twoCombinedHash) {
		// Even though JWT is stolen
		// if the pass-down hash value is not the same as the hash based on current ip and agent string
		// cannot break through this security
		return res.status(403).send({ message: 'Invalid token.' });
	}

	const sql = 'SELECT * FROM users WHERE username=?';

	// node-mysql library automatically performs escaping (sanitizing) when using '?' placeholder.
	// See https://github.com/felixge/node-mysql#escaping-query-values
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
```
User verification is run in protected routes as well as when unauthorized user tries to navigate to protected routes or send data to server.

### Image analysis and prediction:
Registered user can upload their image (carefully validated on both client and server sides) to have it analyzed.
![Alt text](images/gif-1.gif?raw=true "App")

### Neural network configuration:
Registered user can configure their own neural network for better analysis and prediction.
![Alt text](images/img-1.jpg?raw=true "App")
