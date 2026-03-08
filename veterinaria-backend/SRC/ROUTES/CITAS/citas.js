const citasRouter = require("express").Router();
const { createAppointments } = require("../../CONTROLLERS/CITAS/citas.js");
const { verificarToken } = require("../../MIDDLEWARES/authToken.js");

//Ruta para crear una cita
citasRouter.post("/create", verificarToken, createAppointments);

module.exports = citasRouter;
