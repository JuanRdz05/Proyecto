const dotenv = require("dotenv");
dotenv.config();

const config = {
	app: {
		host: process.env.HOST,
		port: process.env.PORT,
	},
	db: {
		user: process.env.DB_USER,
		pass: process.env.DB_PASSWORD,
		name: process.env.DB_NAME,
		url: process.env.DB_URL,
	},
};

module.exports = config;
