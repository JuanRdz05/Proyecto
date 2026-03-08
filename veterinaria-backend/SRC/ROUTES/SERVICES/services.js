const servicesRouter = require("express").Router();
const { createService } = require("../../CONTROLLERS/SERVICES/services.js");
const { noNumbers } = require("../../MIDDLEWARES/noNumbers.js");
const { verificarToken } = require("../../MIDDLEWARES/authToken.js");

//Ruta para crear un servicio
servicesRouter.post(
	"/create",
	verificarToken,
	noNumbers(["name"]),
	createService,
);
module.exports = servicesRouter;
