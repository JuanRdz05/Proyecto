const app = require("./app.js");
const dotenv = require("dotenv");
dotenv.config();
//Controladores de eventos
process.on("unhandledRejection", (reason, promise) => {
	console.error("Promesa no controlada en: ", promise, "Razón: ", reason);
});

//Función para iniciar el servidor
async function startServer() {
	try {
		await app.listen(process.env.PORT);
		console.log(`Server is running on port ${process.env.PORT}`);
	} catch (error) {
		console.error(error);
	}
}

startServer();
