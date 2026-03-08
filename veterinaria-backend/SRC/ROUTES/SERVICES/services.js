const servicesRouter = require("express").Router();
const {
	createService,
	getAllServices,
} = require("../../CONTROLLERS/SERVICES/services.js");
const { noNumbers } = require("../../MIDDLEWARES/noNumbers.js");
const { verificarToken } = require("../../MIDDLEWARES/authToken.js");

//Ruta para crear un servicio
servicesRouter.post(
	"/create",
	verificarToken,
	noNumbers(["name"]),
	createService,
);
//Ruta para obtener todos los servicios
servicesRouter.get("/all", verificarToken, getAllServices);
module.exports = servicesRouter;
