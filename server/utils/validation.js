const validateUsername = (field) => {
	if (field === '') return false;
	else if (field.length < 5) return false;
	else if (/[^a-zA-Z0-9_-]/.test(field)) return false;
	return true;
};

const validatePassword = (field) => {
	if (field === '') return false;
	else if (field.length < 6) return false;
	else if (!/[a-z]/.test(field) || !/[A-Z]/.test(field) || !/[0-9]/.test(field))
		return false;
	return true;
};

exports.validate = function(data) {
	const isUsernameValid = validateUsername(data.username);
	const isPasswordValid = validatePassword(data.password);

	if (isUsernameValid && isPasswordValid) return true;
	return false;
};
