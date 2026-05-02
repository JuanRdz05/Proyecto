const Appointments = require("../../MODELS/appointment.js");
const Services = require("../../MODELS/services.js");
const { createLog } = require("../../MIDDLEWARES/logs.js");

const safeLog = async (action, resource, description, metadata, userId) => {
	try {
		await createLog(action, resource, description, metadata, userId);
	} catch (logError) {
		console.warn("[safeLog] Log no creado, pero operación continúa");
	}
};

const createAppointments = async (req, res) => {
	try {
		const user = req.user;

		if (user.role !== "client") {
			return res.status(403).json({ message: "Acceso denegado" });
		}

		const { date, time, pet, service: serviceId, notes } = req.body;
		const servicioDB = await Services.findById(serviceId);

		if (!servicioDB) {
			return res.status(404).json({ message: "Servicio no encontrado" });
		}

		const appointment = new Appointments({
			date,
			time,
			pet,
			service: serviceId,
			precioAlRegistrar: servicioDB.price,
			owner: user.id,
			status: "Pendiente",
			notes,
		});

		await appointment.save();

		await safeLog(
			"CREATE",
			"APPOINTMENT",
			`Solicitud de cita para el ${date} a las ${time}`,
			{
				appointmentId: appointment._id,
				serviceId: serviceId,
				serviceName: servicioDB.name,
				servicePrice: servicioDB.price,
				petId: pet,
				appointmentDate: date,
				appointmentTime: time,
			},
			user.id,
		);

		res.status(201).json({ message: "Cita creada", appointment });
	} catch (error) {
		console.error("Error al crear la cita: ", error);
		res
			.status(500)
			.json({ message: "Error al crear la cita", error: error.message });
	}
};

const getAllAppointments = async (req, res) => {
	try {
		const user = req.user;
		if (user.role !== "admin") {
			return res.status(403).json({ message: "Acceso denegado" });
		}

		const appointments = await Appointments.find({});
		if (appointments.length === 0) {
			return res
				.status(200)
				.json({
					message: "No hay citas en la base de datos",
					appointments: [],
				});
		}

		res.status(200).json({ message: "Citas obtenidas", appointments });
	} catch (error) {
		console.error("Error al obtener las citas: ", error);
		res.status(500).json({ message: "Error al obtener las citas", error });
	}
};

const getAppointmentsByUser = async (req, res) => {
	try {
		const userId = req.user._id || req.user.id;

		const appointments = await Appointments.find({ owner: userId })
			.populate("pet", "name petType")
			.populate("service", "name price")
			.sort({ date: 1, time: 1 });

		res.status(200).json({
			message: appointments.length
				? "Citas obtenidas"
				: "No tienes citas registradas",
			appointments,
		});
	} catch (error) {
		console.error("Error al obtener las citas:", error);
		res.status(500).json({ message: "Error al obtener las citas", error });
	}
};

const cancelAppointment = async (req, res) => {
	try {
		const { id } = req.params;
		const appointment = await Appointments.findById(id);

		if (!appointment) {
			return res.status(404).json({ message: "Cita no encontrada" });
		}

		const oldStatus = appointment.status;

		if (
			appointment.owner.toString() !== req.user.id &&
			req.user.role.toString() !== "admin"
		) {
			return res
				.status(403)
				.json({ message: "No tienes permiso para cancelar esta cita" });
		}

		if (
			appointment.status === "En proceso" ||
			appointment.status === "Rechazada"
		) {
			return res.status(400).json({
				message: `No se puede cancelar una cita con estado: ${appointment.status}`,
			});
		}

		appointment.status = "Cancelada";
		await appointment.save();

		await safeLog(
			"UPDATE",
			"APPOINTMENT",
			`Cancelación de la cita #${id} (estado anterior: ${oldStatus})`,
			{
				appointmentId: id,
				oldStatus: oldStatus,
				newStatus: "Cancelada",
			},
			req.user.id,
		);

		res
			.status(200)
			.json({ message: "La cita ha sido cancelada correctamente" });
	} catch (error) {
		console.error("Error al cancelar la cita: ", error);
		res
			.status(500)
			.json({
				message: "Error al procesar la cancelación",
				error: error.message,
			});
	}
};

module.exports = {
	createAppointments,
	getAllAppointments,
	getAppointmentsByUser,
	cancelAppointment,
};
