const servicesRouter = require("express").Router();
const {
	createService,
	getAllServices,
	changeStatus,
	getServiceById,
} = require("../../CONTROLLERS/SERVICES/services.js");
const { noNumbers } = require("../../MIDDLEWARES/noNumbers.js");
const { verificarToken } = require("../../MIDDLEWARES/authToken.js");

//Ruta para crear un servicio
servicesRouter.post("/create", noNumbers(["name"]), createService);
//Ruta para desactivar un servicio
servicesRouter.patch("/:id/toggleActive", verificarToken, changeStatus);
//Ruta para obtener todos los servicios
servicesRouter.get("/all", verificarToken, getAllServices);
//Ruta para obtener un servicio por id
servicesRouter.get("/:id", verificarToken, getServiceById);

module.exports = servicesRouter;
