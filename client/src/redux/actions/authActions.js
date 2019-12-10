import axios from 'axios';
import jwt from 'jsonwebtoken';

import { BASE_URL } from '../../utils/constants';
import { LOGIN, REGISTER, VERIFY, LOGOUT, UPLOAD, UPDATE, CLEAR_RESULT, CLEAR } from './types';

export const login = (user) => (dispatch) => {
	return new Promise((resolve, reject) => {
		axios
			.post(`${BASE_URL}/login`, user)
			.then((res) => {
				if (res.data) {
					localStorage.setItem('usertoken', res.data.token);
					const decoded = jwt.decode(res.data.token);
					const userData = {
						username: decoded.username,
						hash: decoded.hash,
						fileValues: JSON.parse(decoded.fileValues)
					};
					dispatch({
						type: LOGIN,
						payload: userData
					});
					resolve();
				} else reject(new Error('Error occured.'));
			})
			.catch((err) => {
				reject(new Error(err.response.data.message));
			});
	});
};

export const logout = (userData) => (dispatch) => {
	localStorage.removeItem('usertoken');
	const { username } = userData;

	return new Promise((resolve, reject) => {
		axios
			.post(`${BASE_URL}/logout`, { username })
			.then((res) => {
				if (res.data) {
					dispatch({
						type: LOGOUT,
						payload: null
					});
					resolve();
				} else reject(new Error('Error occured.'));
			})
			.catch((err) => reject(new Error(err.response.data.message)));
	});
};

export const register = (user) => (dispatch) => {
	return new Promise((resolve, reject) => {
		axios
			.post(`${BASE_URL}/register`, user)
			.then((_) => {
				dispatch({
					type: REGISTER,
					payload: null
				});
				resolve();
			})
			.catch((err) => {
				reject(new Error(err.response.data.message));
			});
	});
};

export const verify = () => (dispatch) => {
	const token = localStorage.getItem('usertoken');
	return new Promise(async (resolve, reject) => {
		try {
			const decoded = jwt.decode(token);
			const { username, hash } = decoded;

			try {
				const res = await axios.post(`${BASE_URL}/verify`, { token, username, hash });
				if (res.data) {
					dispatch({
						type: VERIFY,
						payload: null
					});
					resolve();
				} else {
					localStorage.clear();
					reject(new Error('Error occured.'));
				}
			} catch (err) {
				localStorage.clear();
				reject(new Error(err.response.data.message));
			}
		} catch (err) {
			localStorage.clear();
			reject(new Error('Invalid token.'));
		}
	});
};

export const updateFileValues = (data) => (dispatch) => {
	return new Promise(async (resolve, reject) => {
		try {
			const res = await axios.post(`${BASE_URL}/update`, data);
			if (res.data) {
				dispatch({
					type: UPDATE,
					payload: res.data.newFileValues
				});
				resolve();
			} else reject(new Error('Error occured.'));
		} catch (err) {
			let error;
			if (err.response.data.message === 'Invalid input.') {
				error = new Error(err.response.data.message);
			} else if (err.response.data.message === 'Not authorized.') {
				localStorage.clear();
				error = new Error('Please login again.');
			}
			reject(error);
		}
	});
};

export const upload = (data) => (dispatch) => {
	return new Promise(async (resolve, reject) => {
		try {
			const res = await axios.post(`${BASE_URL}/upload`, data);
			if (res.data) {
				dispatch({
					type: UPLOAD,
					payload: res.data
				});
				resolve();
			} else {
				reject(new Error('Error occured.'));
			}
		} catch (err) {
			let error;
			if (err.response.status === 413 || err.response.status === 406) {
				error = new Error('Image is invalid.');
			} else {
				localStorage.clear();
				error = new Error('Please login again.');
			}
			reject(error);
		}
	});
};

export const clearResult = () => (dispatch) => {
	dispatch({
		type: CLEAR_RESULT,
		payload: null
	});
};

export const clear = () => (dispatch) => {
	dispatch({
		type: CLEAR,
		payload: null
	});
};
