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

// Crear registro médico y finalizar cita
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

		if (user.role !== "vet") {
			return res
				.status(403)
				.json({ message: "Acceso denegado: Solo veterinarios" });
		}

		const appointmentDB = await Appointments.findById(appointmentId);
		if (!appointmentDB) {
			return res.status(404).json({ message: "Cita no encontrada" });
		}

		const vetId = user._id || user.id;
		if (appointmentDB.vet?.toString() !== vetId.toString()) {
			return res
				.status(403)
				.json({ message: "Esta cita no está asignada a ti" });
		}

		if (!["Aceptada", "En progreso"].includes(appointmentDB.status)) {
			return res.status(400).json({
				message: `No se puede completar una cita con estado: ${appointmentDB.status}`,
			});
		}

		// Mapear prescriptions del frontend al formato del modelo
		const mappedPrescriptions = (prescriptions || []).map((p) => ({
			medication: p.medication || p.name || "",
			dosage: p.dosage || p.dose || "",
			frequency: p.frequency || "",
			duration: p.duration || "",
			notes: p.notes || "",
		}));

		const record = new MedicalRecords({
			pet: appointmentDB.pet,
			appointment: appointmentDB._id,
			vet: vetId,
			service: appointmentDB.service,
			diagnosis,
			treatment,
			prescriptions: mappedPrescriptions,
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
				weight,
				temperature,
				prescriptionsCount: mappedPrescriptions.length,
			},
			vetId,
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

// Cambiar estado de cita a "En progreso"
const startAppointment = async (req, res) => {
	try {
		const user = req.user;
		const { id } = req.params;

		if (user.role !== "vet") {
			return res
				.status(403)
				.json({ message: "Acceso denegado: Solo veterinarios" });
		}

		const appointment = await Appointments.findById(id);
		if (!appointment) {
			return res.status(404).json({ message: "Cita no encontrada" });
		}

		const vetId = user._id || user.id;
		if (appointment.vet?.toString() !== vetId.toString()) {
			return res
				.status(403)
				.json({ message: "Esta cita no está asignada a ti" });
		}

		if (appointment.status !== "Aceptada") {
			return res.status(400).json({
				message: `No se puede iniciar una cita con estado: ${appointment.status}`,
			});
		}

		const oldStatus = appointment.status;
		appointment.status = "En progreso";
		await appointment.save();

		await safeLog(
			"UPDATE",
			"APPOINTMENT",
			`Inicio de atención de la cita #${id}`,
			{
				appointmentId: id,
				oldStatus,
				newStatus: "En progreso",
				vetId,
			},
			vetId,
		);

		res.status(200).json({
			message: "Cita iniciada",
			appointment,
		});
	} catch (error) {
		console.error("Error al iniciar cita:", error);
		res
			.status(500)
			.json({ message: "Error al iniciar la cita", error: error.message });
	}
};

// Cancelar/revertir cita a "Aceptada"
const revertAppointment = async (req, res) => {
	try {
		const user = req.user;
		const { id } = req.params;

		if (user.role !== "vet") {
			return res
				.status(403)
				.json({ message: "Acceso denegado: Solo veterinarios" });
		}

		const appointment = await Appointments.findById(id);
		if (!appointment) {
			return res.status(404).json({ message: "Cita no encontrada" });
		}

		const vetId = user._id || user.id;
		if (appointment.vet?.toString() !== vetId.toString()) {
			return res
				.status(403)
				.json({ message: "Esta cita no está asignada a ti" });
		}

		if (appointment.status !== "En progreso") {
			return res.status(400).json({
				message: `No se puede revertir una cita con estado: ${appointment.status}`,
			});
		}

		const oldStatus = appointment.status;
		appointment.status = "Aceptada";
		await appointment.save();

		await safeLog(
			"UPDATE",
			"APPOINTMENT",
			`Reversión de cita #${id} a estado Aceptada`,
			{
				appointmentId: id,
				oldStatus,
				newStatus: "Aceptada",
				vetId,
			},
			vetId,
		);

		res.status(200).json({
			message: "Cita revertida a Aceptada",
			appointment,
		});
	} catch (error) {
		console.error("Error al revertir cita:", error);
		res
			.status(500)
			.json({ message: "Error al revertir la cita", error: error.message });
	}
};

// Obtener una cita específica con populate
const getAppointmentById = async (req, res) => {
	try {
		const user = req.user;
		const { id } = req.params;

		const appointment = await Appointments.findById(id)
			.populate("pet", "name petType breed")
			.populate("owner", "name paternalLastName email phone")
			.populate("service", "name price description")
			.populate("vet", "name paternalLastName username");

		if (!appointment) {
			return res.status(404).json({ message: "Cita no encontrada" });
		}

		const userId = user._id || user.id;
		const isOwner = appointment.owner?._id?.toString() === userId.toString();
		const isVet = appointment.vet?._id?.toString() === userId.toString();
		const isAdmin = user.role === "admin";

		if (!isOwner && !isVet && !isAdmin) {
			return res
				.status(403)
				.json({ message: "No tienes permiso para ver esta cita" });
		}

		res.status(200).json({ appointment });
	} catch (error) {
		console.error("Error al obtener cita:", error);
		res
			.status(500)
			.json({ message: "Error al obtener la cita", error: error.message });
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
			.populate("vet", "name paternalLastName username email")
			.populate("service", "name price")
			.populate("appointment", "date time status")
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
			.populate("vet", "name paternalLastName username email")
			.populate("service", "name price")
			.populate("appointment", "date time status")
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
	startAppointment,
	revertAppointment,
	getAppointmentById,
};
