const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')

const user = require('./routes/user');


const app = express();
const port = 5000;

app.use(cors());
app.use( bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('Hello World!'));

app.post('/signup', user.signup);
app.post('/signin', user.signin);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
