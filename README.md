# cs-174-final-project

This is the repository of CS 174 project

### **Members:**

- Anh Nguyen
- Gaston Garrido
- Maneek Dhillon

*This project has three modules:*
- client
- server
- Neural_Network - credit to [ggmonx](https://github.com/ggmonx) for the module

Each module has its own environment constants. Create `.env` files and assign constants to each module before running like the format below.

*List of needed constants in each `.env`*:

### **client:**
```
REACT_APP_EXTERNAL_API_URL (server url, e.g., http://localhost:5000)
REACT_APP_FILE_SIZE_LIMIT (image file size limit for upload, e.g., 10000)
```
### **server:**
```
PORT (e.g., 5000)
PAYLOAD_LIMIT (request payload size limit e.g., "200mb")

SALT_ROUNDS (e.g., 30)
SALT_TOKEN_ROUNDS (e.g., 60)
FIXED_SALT (e.g., "$2b$10$m1VeKF0RKY/EPSPEIGyCY.")

HOST_DB
USER_DB (username of database)
PASSWORD_DB
DATABASE

JWT_EXPIRATION (e.g., "10m")

FILE_SIZE_LIMIT (uploaded image size litmit, e.g, 10000)
PYTHON_SCRIPT="/path/to/neural_net.py/"

// args of training neural net for optimal output
NUM_HIDDEN_LAYERS=2
WIDTH=100
ACTIVATION_FUNC="ReLU"
LEARNING_RATE=0.005
DROPOUT=0.5
EPOCHS=50
```
### **Neural_Network:**
```
BASE_PATH="/path/to/folder/Neural_Network"
```

### **MYSQL table structure:**
| username    | password     | salt        | tokenSalt   | neuralNetFile (id) |
|-------------|--------------|-------------|-------------|--------------------|
| VARCHAR(32) | VARCHAR(255) | VARCHAR(32) | VARCHAR(32) | VARCHAR(64)        |


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
