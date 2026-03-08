const citasRouter = require("express").Router();
const {
	createAppointments,
	getAllAppointments,
} = require("../../CONTROLLERS/CITAS/citas.js");
const { verificarToken } = require("../../MIDDLEWARES/authToken.js");

//Ruta para crear una cita
citasRouter.post("/create", verificarToken, createAppointments);
//Rutas para obtener todas las citas en general
citasRouter.get("/all", verificarToken, getAllAppointments);

module.exports = citasRouter;
