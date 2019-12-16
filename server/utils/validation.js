const validateUsername = (field) => {
	if (field === '') return false;
	else if (field.length < 5) return false;
	else if (/[^a-zA-Z0-9_-]/.test(field)) return false;
	return true;
};

const validateEmail = (field) => {
	if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(field)) {
		return true;
	}
	return false;
};

const validatePassword = (field) => {
	if (field === '') return false;
	else if (field.length < 6) return false;
	else if (!/[a-z]/.test(field) || !/[A-Z]/.test(field) || !/[0-9]/.test(field)) return false;
	return true;
};

const validateNumHiddenLayers = (field) => {
	if (field !== 1 && field !== 2) return false;
	return true;
};

const validateWidth = (field) => {
	if (field < 10 || field > 200) return false;
	return true;
};

const validateActivationFunc = (field) => {
	if (field !== 'ReLU' && field !== 'Sigmoid') return false;
	return true;
};

const validateLearningRate = (rate, activationFunc) => {
	if (activationFunc === 'ReLU') {
		if (rate < 0.001 || rate > 0.01) return false;
	}
	if (activationFunc === 'Sigmoid') {
		if (rate < 0.1 || rate > 1) return false;
	}
	return true;
};

const validateDropout = (dropout, activationFunc) => {
	if (activationFunc === 'ReLU') {
		if (dropout < 0 || dropout > 0.7) return false;
	}
	if (activationFunc === 'Sigmoid') {
		if (dropout !== 0) return false;
	}
	return true;
};

const validateEpochs = (field) => {
	if (field < 10 || field > 150) return false;
	return true;
};

exports.validateImage = function(imageURL) {
	const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
	return base64regex.test(imageURL);
}

exports.validatFileValuesForm = function(data) {
	const { num_hidden_layers, width, activation_func, learning_rate, dropout, epochs } = data;

	const isNumHiddenLayersValie = validateNumHiddenLayers(num_hidden_layers);
	const isWidthValid = validateWidth(width);
	const isActivationFuncValid = validateActivationFunc(activation_func);
	const isLearningRateValid = validateLearningRate(learning_rate, activation_func);
	const isDropoutValid = validateDropout(dropout, activation_func);
	const isEpochsValid = validateEpochs(epochs);

	if (
		isNumHiddenLayersValie &&
		isWidthValid &&
		isActivationFuncValid &&
		isLearningRateValid &&
		isDropoutValid &&
		isEpochsValid
	)
		return true;
	return false;
};

exports.validateCredentialsForm = function(data, isLogin) {
	const isUsernameValid = validateUsername(data.username);
	const isPasswordValid = validatePassword(data.password);
	if (!isLogin) {
		const isEmailValid = validateEmail(data.email);
		if (isUsernameValid && isEmailValid && isPasswordValid) return true;
		return false;
	}

	if (isUsernameValid && isPasswordValid) return true;
	return false;
};
