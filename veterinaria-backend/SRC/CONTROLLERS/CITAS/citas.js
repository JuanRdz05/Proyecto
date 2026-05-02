const Appointments = require("../../MODELS/appointment.js");
const Services = require("../../MODELS/services.js");
const { createLog } = require("../../MIDDLEWARES/logs.js");

// Helper para loguear de forma segura (no bloquea la operación principal)
const safeLog = async (action, resource, description, metadata, userId) => {
	try {
		await createLog(action, resource, description, metadata, userId);
	} catch (logError) {
		// El error ya se imprime en createLog, aquí solo lo capturamos
		// para no interrumpir la operación principal
		console.warn("[safeLog] Log no creado, pero operación continúa");
	}
};

const createAppointments = async (req, res) => {
	try {
		console.log("===================================================");
		console.log("Comenzando el proceso para crear una cita...");

		const user = req.user;

		if (user.role !== "client") {
			return res.status(403).json({ message: "Acceso denegado" });
		}

		console.log("===================================================");
		console.log("Procesando la solicitud de la cita...");

		const { date, time, pet, service: serviceId, notes } = req.body;
		const servicioDB = await Services.findById(serviceId);

		if (!servicioDB) {
			console.log("===================================================");
			console.log("Servicio no encontrado");
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

		// Log de auditoría — AHORA CON AWAIT Y MANEJO DE ERRORES
		await safeLog(
			"CREATE",
			"APPOINTMENT",
			`El cliente ${user.username} ha solicitado una cita para el ${date} a las ${time}`,
			{
				appointmentId: appointment._id,
				serviceId: serviceId,
				serviceName: servicioDB.name,
				servicePrice: servicioDB.price,
				petId: pet,
				ownerId: user.id,
				ownerUsername: user.username,
				ownerEmail: user.email,
				appointmentDate: date,
				appointmentTime: time,
			},
			user.id,
		);

		console.log("Cita creada exitosamente");
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
		console.log("===================================================");
		console.log("Comenzando el proceso para obtener todas las citas...");

		const user = req.user;
		if (user.role !== "admin") {
			console.log("Acceso denegado");
			return res.status(403).json({ message: "Acceso denegado" });
		}

		const appointments = await Appointments.find({});

		if (appointments.length === 0) {
			console.log("===================================================");
			console.log("No hay citas para mostrar");
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
		console.log("===================================================");
		console.log("Comenzando el proceso para cancelar una cita...");

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
			console.log("===================================================");
			console.log("Acceso denegado, no tienes permiso para hacer esta acción");
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

		// Log de auditoría mejorado
		await safeLog(
			"UPDATE",
			"APPOINTMENT",
			`Cita #${id} cancelada por ${req.user.username} (estado anterior: ${oldStatus})`,
			{
				appointmentId: id,
				oldStatus: oldStatus,
				newStatus: "Cancelada",
				cancelledBy: req.user.username,
				cancelledByRole: req.user.role,
				cancelledById: req.user.id,
				ownerId: appointment.owner,
			},
			req.user.id,
		);

		console.log("Cita cancelada exitosamente");
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
