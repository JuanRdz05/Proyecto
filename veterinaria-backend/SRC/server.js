const app = require("./app.js");
const connectDB = require("./DATABASE/database.js");
const config = require("./CONFIG/databaseConfig.js");
const dotenv = require("dotenv");
dotenv.config();

//Controladores de eventos
process.on("unhandledRejection", (reason, promise) => {
	console.error("Promesa no controlada en: ", promise, "Razón: ", reason);
});

async function startServer() {
	try {
		//Conexion con la base de datos
		await connectDB();
		console.log("Base de datos conectada exitosamente");
		//Conexion con el servidor
		await app.listen(config.app.port, () => {
			console.log(
				`Servidor corriendo en http://${config.app.host}:${config.app.port}`,
			);
		});
	} catch (error) {
		console.error(error);
	}
}

startServer();
