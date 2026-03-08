const citasRouter = require("express").Router();
const {
	createAppointments,
	getAllAppointments,
	getAppointmentsByUser,
	cancelAppointment,
} = require("../../CONTROLLERS/CITAS/citas.js");
const { verificarToken } = require("../../MIDDLEWARES/authToken.js");

//Ruta para crear una cita
citasRouter.post("/create", verificarToken, createAppointments);
//Rutas para obtener todas las citas en general
citasRouter.get("/all", verificarToken, getAllAppointments);
//Rutas para obtener las citas por usuario
citasRouter.get("/user/:id", verificarToken, getAppointmentsByUser);
//Ruta para cancelar una cita
citasRouter.delete("/:id", verificarToken, cancelAppointment);

module.exports = citasRouter;
