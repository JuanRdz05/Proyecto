const config = require("../CONFIG/databaseConfig.js");
const mongoose = require("mongoose");

const connectDB = async () => {
	try {
		await mongoose.connect(config.db.url);
	} catch (error) {
		console.log(error);
	}
};

module.exports = connectDB;
