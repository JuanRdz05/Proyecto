const citasRouter = require("express").Router();
const {
	createAppointments,
	getAllAppointments,
	getAppointmentsByUser,
	cancelAppointment,
	acceptAppointment,
	rejectAppointment,
} = require("../../CONTROLLERS/CITAS/citas.js");
const { verificarToken } = require("../../MIDDLEWARES/authToken.js");

// Crear una cita
citasRouter.post("/create", verificarToken, createAppointments);
// Obtener todas las citas (admin)
citasRouter.get("/all", verificarToken, getAllAppointments);
// Obtener citas del usuario logueado
citasRouter.get("/user/me", verificarToken, getAppointmentsByUser);
// Cancelar una cita
citasRouter.patch("/cancel/:id", verificarToken, cancelAppointment);
// ACEPTAR cita (nueva)
citasRouter.patch("/accept/:id", verificarToken, acceptAppointment);
// RECHAZAR cita (nueva)
citasRouter.patch("/reject/:id", verificarToken, rejectAppointment);

module.exports = citasRouter;
