const logsRouter = require("express").Router();
const { getAllLogs } = require("../../CONTROLLERS/LOGS/logs.js");

//Ruta para obtener todos los logs creados
logsRouter.get("/all", getAllLogs);

module.exports = logsRouter;
