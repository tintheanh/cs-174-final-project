const db = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

exports.signup = function(req, res) {
  const credentials = {
    username: req.body.username,
    password: req.body.password
  }

  let sql = "SELECT * FROM users WHERE username=?";

  db.query(sql, [credentials.username], (err, result) => {
    if (err) console.log(err);
    if (result.length) {
      return res.status(400).send({ message: 'User already existed.' });
    } else {
      const hash = bcrypt.hashSync(credentials.password, 10);
      credentials.password = hash;

      sql = "INSERT INTO users (username, password) VALUES (?, ?);"
      
      db.query(sql, [credentials.username, credentials.password], (err, result) => {
        if (err) {
          console.log(err.sqlMessage);
          return res.status(400).send({ message: 'Error occured.' });
        }
        if (result) {
          return res.status(200).send({ message: 'Register successfully.' });
        } else {
          return res.status(400).send({ message: 'Error occured.' });
        }
      });
    }
  });
  
  
};

exports.signin = function(req, res) {
  const credentials = {
    username: req.body.username,
    password: req.body.password
  }

  let sql = "SELECT * FROM users WHERE username=?";
  db.query(sql, [credentials.username], (err, result) => {
    if (err) console.log(err);
    if (!result.length) return res.status(400).send({ message: 'User does not exist.' });
    else {
      const { password } = result[0];
      if (bcrypt.compareSync(credentials.password, password)) {
        const userData = {
          username: result[0].username
        }
        let token = jwt.sign(userData, '10', {
          expiresIn: '5m'
        })
        return res.status(200).send({ token });
      } else {
        return res.status(400).send({ message: 'Username or password incorrect.' });
      }
    }
  });
}
