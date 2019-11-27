import axios from 'axios';

export const login = (user) => {
  return new Promise((resolve, reject) => {
    axios.post('http://localhost:5000/signin', user).then(res => {
      localStorage.setItem('usertoken', res.data.token);
      resolve(res.data);
    }).catch(err => {
      reject(new Error(err.response.data.message));
    });
  })
}

export const signup = (user) => {
  return new Promise((resolve, reject) => {
    axios.post('http://localhost:5000/signup', user).then(_ => {
      resolve();
    }).catch(err => {
      reject(new Error(err.response.data.message));
    });
  })
}

export const logout = (callback) => {
  localStorage.removeItem('usertoken');
  callback();
}