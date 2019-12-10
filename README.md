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
```javascript
REACT_APP_EXTERNAL_API_URL (server url, e.g., http://localhost:5000)
REACT_APP_FILE_SIZE_LIMIT (image file size limit in byte to upload, e.g., 10000)
```

### **server:**
```javascript
PORT (e.g., 5000)
PAYLOAD_LIMIT (request payload size limit e.g., "200mb")

SALT_ROUNDS (for password hashing, e.g., 30)
SALT_TOKEN_ROUNDS (for JWT signing, e.g., 60)
FIXED_SALT (secret salt for user IP & user agent string hashing, preventing JWT hijacking, e.g., "$2b$10$m1VeKF0RKY/EPSPEIGyCY.")

// MYSQL credentials
HOST_DB
USER_DB
PASSWORD_DB
DATABASE

JWT_EXPIRATION (e.g., "10m")

FILE_SIZE_LIMIT (uploaded image size limit in byte, e.g, 10000)

PYTHON_SCRIPT="/absolute/path/to/neural_net.py/"

// Default arguments for training neural net
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
