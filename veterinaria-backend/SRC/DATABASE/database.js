const config = require("../CONFIG/databaseConfig.js");
const mongoose = require("mongoose");

const connectDB = async () => {
	try {
		//Conexion con la base de datos
		console.log("===================================================");
		console.log("Intentando conectar con la base de datos...");
		await mongoose.connect(config.db.url);
	} catch (error) {
		console.log(error);
	}
};

module.exports = connectDB;
