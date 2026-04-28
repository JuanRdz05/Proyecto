const recordsRouter = require("express").Router();
const {
	getAllRecords,
	createRecord,
	getRecordsByUser,
} = require("../../CONTROLLERS/MEDICAL_RECORD/records.js");
const { verificarToken } = require("../../MIDDLEWARES/authToken.js");

//Ruta para obtewner todos los registros medicos
recordsRouter.get("/all", verificarToken, getAllRecords);
//Ruta para obtener todos los registros por usuario
recordsRouter.get("/mis-registros", verificarToken, getRecordsByUser);
//Ruta para el administrador para ver los registros por usuario
recordsRouter.get("/admin/registros/:id", verificarToken, getRecordsByUser);
//Ruta para crear un registro medico
recordsRouter.post("/create/:id", verificarToken, createRecord);

module.exports = recordsRouter;
