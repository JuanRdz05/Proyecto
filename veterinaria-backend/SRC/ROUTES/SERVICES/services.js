const servicesRouter = require("express").Router();
const {
	createService,
	getAllServices,
	changeStatus,
	getServiceById,
	updateService,
	deleteService,
} = require("../../CONTROLLERS/SERVICES/services.js");
const { noNumbers } = require("../../MIDDLEWARES/noNumbers.js");
const { verificarToken, authRole } = require("../../MIDDLEWARES/authToken.js");

//Ruta para crear un servicio
servicesRouter.post(
	"/create",
	verificarToken,
	noNumbers(["name"]),
	createService,
);
//Ruta para desactivar un servicio
servicesRouter.patch("/:id/toggleActive", verificarToken, changeStatus);
//Ruta para obtener todos los servicios
servicesRouter.get("/all", verificarToken, getAllServices);
//Ruta para obtener un servicio por id
servicesRouter.get("/:id", verificarToken, getServiceById);
//Ruta para actualizar el servicio
servicesRouter.patch(
	"/:id",
	verificarToken,
	noNumbers(["name"]),
	updateService,
);
//Ruta para eliminar un servicio permanentemente
servicesRouter.delete("/:id/delete", verificarToken, authRole("admin"), deleteService);

module.exports = servicesRouter;

