const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const requestIp = require('request-ip');
const dotenv = require('dotenv');

dotenv.config(); // .env configuration
const constants = require('./utils/constants');
const user = require('./routes/user');
const app = express();

app.use(cors()); // Cross-Origin Resource Sharing middleware
app.use(requestIp.mw()); // Client IP middleware

app.use(bodyParser.json({ limit: constants.PAYLOAD_LIMIT }));
app.use(bodyParser.urlencoded({ limit: constants.PAYLOAD_LIMIT, extended: true }));

app.get('/', (_, res) => res.send('Hello World!'));

app.post('/register', user.register);
app.post('/login', user.login);
app.post('/verify', user.verify);
app.post('/logout', user.logout);
app.post('/upload', user.upload);

app.listen(constants.PORT, () => console.log(`Listening on port ${constants.PORT}`));
