module.exports = {
	PORT: process.env.PORT,
	PAYLOAD_LIMIT: process.env.PAYLOAD_LIMIT,

	HOST_DB: process.env.HOST_DB,
	USER_DB: process.env.USER_DB,
	PASSWORD_DB: process.env.PASSWORD_DB,
	DATABASE: process.env.DATABASE,

	SALT_ROUNDS: Number(process.env.SALT_ROUNDS),
	SALT_TOKEN_ROUNDS: Number(process.env.SALT_TOKEN_ROUNDS),
	FIXED_SALT: process.env.FIXED_SALT,

	JWT_EXPIRATION: process.env.JWT_EXPIRATION,

	FILE_SIZE_LIMIT: Number(process.env.FILE_SIZE_LIMIT),
	PYTHON_SCRIPT: process.env.PYTHON_SCRIPT,
	NUM_HIDDEN_LAYERS: process.env.NUM_HIDDEN_LAYERS,
	WIDTH: process.env.WIDTH,
	ACTIVATION_FUNC: process.env.ACTIVATION_FUNC,
	LEARNING_RATE: process.env.LEARNING_RATE,
	DROPOUT: process.env.DROPOUT,
	EPOCHS: process.env.EPOCHS
};
