const recordsRouter = require("express").Router();
const {
	getAllRecords,
	createRecord,
	getRecordsByUser,
	startAppointment,
	revertAppointment,
	getAppointmentById,
} = require("../../CONTROLLERS/MEDICAL_RECORD/records.js");
const { verificarToken } = require("../../MIDDLEWARES/authToken.js");

recordsRouter.get("/all", verificarToken, getAllRecords);
recordsRouter.get("/mis-registros", verificarToken, getRecordsByUser);
recordsRouter.get("/admin/registros/:id", verificarToken, getRecordsByUser);
recordsRouter.get("/appointment/:id", verificarToken, getAppointmentById);
recordsRouter.patch("/appointment/:id/start", verificarToken, startAppointment);
recordsRouter.patch(
	"/appointment/:id/revert",
	verificarToken,
	revertAppointment,
);
recordsRouter.post("/create", verificarToken, createRecord);

module.exports = recordsRouter;
