const validateUsername = (field) => {
	if (field === '') return 'No Username was entered.\n';
	else if (field.length < 5) return 'Usernames must be at least 5 characters.\n';
	else if (/[^a-zA-Z0-9_-]/.test(field)) return 'Only a-z, A-Z, 0-9, - and _ allowed in Usernames.\n';
	return '';
};

const validatePassword = (field) => {
	if (field === '') return 'No Password was entered.\n';
	else if (field.length < 6) return 'Passwords must be at least 6 characters.\n';
	else if (!/[a-z]/.test(field) || !/[A-Z]/.test(field) || !/[0-9]/.test(field))
		return 'Passwords require one each of a-z, A-Z and 0-9.\n';
	return '';
};

const validateNumHiddenLayers = (field) => {
	if (field !== 1 && field !== 2) return 'Number of hidden layers only accepts 1 or 2.\n';
	return '';
};

const validateWidth = (field) => {
	if (field < 10 || field > 200) return 'Width only accepts values from 10 to 200.\n';
	return '';
};

const validateActivationFunc = (field) => {
	if (field !== 'ReLU' && field !== 'Sigmoid') return 'Activation function only accepts ReLU or Sigmoid.\n';
	return '';
};

const validateLearningRate = (rate, activationFunc) => {
	if (activationFunc === 'ReLU') {
		if (rate < 0.001 || rate > 0.01) return 'ReLU only accepts learning rate values from 0.001 to 0.01.\n';
	}
	if (activationFunc === 'Sigmoid') {
		if (rate < 0.1 || rate > 1) return 'Sigmoid only accepts learning rate values from 0.1 to 1.\n';
	}
	return '';
}

const validateDropout = (dropout, activationFunc) => {
	if (activationFunc === 'ReLU') {
		if (dropout < 0 || dropout > 0.7) return 'ReLU only accepts dropout values from 0 to 0.7.\n';
	}
	if (activationFunc === 'Sigmoid') {
		if (dropout !== 0) return 'Sigmoid only accepts dropout 0.\n';
	}
	return '';
}

const validateEpochs = (field) => {
	if (field < 10 || field > 150) return 'Epochs only accepts values from 10 to 150.\n';
	return '';
};

export const validateCredentialsForm = (data) => {
	let fail = validateUsername(data.username);
	fail += validatePassword(data.password);

	return fail;
};

export const validatFileValuesForm = (data) => {
	const { num_hidden_layers, width, activation_func, learning_rate, dropout, epochs } = data;
	let fail = validateNumHiddenLayers(num_hidden_layers);
	fail += validateWidth(width);
	fail += validateActivationFunc(activation_func);
	fail += validateLearningRate(learning_rate, activation_func);
	fail += validateDropout(dropout, activation_func);
	fail += validateEpochs(epochs)

	return fail;
}
