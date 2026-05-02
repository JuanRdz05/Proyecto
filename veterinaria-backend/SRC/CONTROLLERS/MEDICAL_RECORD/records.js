const MedicalRecords = require("../../MODELS/medicalRecords.js");
const Appointments = require("../../MODELS/appointment.js");
const { createLog } = require("../../MIDDLEWARES/logs.js");

const safeLog = async (action, resource, description, metadata, userId) => {
	try {
		await createLog(action, resource, description, metadata, userId);
	} catch (logError) {
		console.warn("[safeLog] Log no creado, pero operación continúa");
	}
};

const createRecord = async (req, res) => {
	try {
		const user = req.user;
		const {
			appointmentId,
			diagnosis,
			treatment,
			prescriptions,
			symptoms,
			weight,
			temperature,
			notes,
			nextVisitDate,
		} = req.body;

		const appointmentDB = await Appointments.findById(appointmentId);
		if (!appointmentDB) {
			return res.status(404).json({ message: "Cita no encontrada" });
		}

		if (user.role !== "vet") {
			return res
				.status(403)
				.json({ message: "Acceso denegado: Solo veterinarios" });
		}

		const record = new MedicalRecords({
			pet: appointmentDB.pet,
			appointment: appointmentDB._id,
			vet: user.id,
			service: appointmentDB.service,
			diagnosis,
			treatment,
			prescriptions,
			symptoms,
			weight,
			temperature,
			notes,
			nextVisitDate,
		});

		await record.save();

		const oldStatus = appointmentDB.status;
		appointmentDB.status = "Terminada";
		await appointmentDB.save();

		await safeLog(
			"CREATE",
			"MEDICALRECORD",
			`Creación de historial médico #${record._id} para la cita #${appointmentId}`,
			{
				recordId: record._id,
				appointmentId: appointmentDB._id,
				petId: appointmentDB.pet,
				serviceId: appointmentDB.service,
				diagnosis: diagnosis?.substring(0, 100),
				oldAppointmentStatus: oldStatus,
				newAppointmentStatus: "Terminada",
				weight: weight,
				temperature: temperature,
			},
			user.id,
		);

		res.status(201).json({
			message: "Registro médico creado y cita finalizada",
			record,
		});
	} catch (error) {
		console.error("Error al crear el registro medico: ", error);
		res
			.status(500)
			.json({ message: "Error al crear el registro", error: error.message });
	}
};

const getAllRecords = async (req, res) => {
	try {
		const user = req.user;
		if (user.role !== "admin") {
			return res.status(403).json({ message: "Acceso denegado" });
		}

		const records = await MedicalRecords.find({})
			.populate("pet", "name petType")
			.populate("vet", "username email")
			.populate("service", "name price")
			.sort({ createdAt: -1 });

		if (records.length === 0) {
			return res
				.status(200)
				.json({ message: "No hay registros en la base de datos", records: [] });
		}

		res.status(200).json({ message: "Registros obtenidos con éxito", records });
	} catch (error) {
		console.error("Error al obtener los registros: ", error);
		res
			.status(500)
			.json({
				message: "Error al obtener los registros",
				error: error.message,
			});
	}
};

const getRecordsByUser = async (req, res) => {
	try {
		const user = req.user;

		if (user.role !== "admin" && user.role !== "vet") {
			return res.status(403).json({ message: "Acceso denegado" });
		}

		const targetId = req.params.id || user.id;

		const records = await MedicalRecords.find({ vet: targetId })
			.populate("pet", "name petType")
			.populate("vet", "username email")
			.populate("service", "name price")
			.sort({ createdAt: -1 });

		if (records.length === 0) {
			return res
				.status(200)
				.json({ message: "No hay registros para este usuario", records: [] });
		}

		res.status(200).json({ message: "Registros obtenidos", records });
	} catch (error) {
		res.status(500).json({ message: "Error", error: error.message });
	}
};

module.exports = {
	createRecord,
	getAllRecords,
	getRecordsByUser,
};
