const Appointments = require("../../MODELS/appointment.js");
const Services = require("../../MODELS/services.js");
const Users = require("../../MODELS/users.js");
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

		// Validar formato de fecha
		if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			return res
				.status(400)
				.json({ message: "La fecha debe tener formato YYYY-MM-DD" });
		}

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

		// POPULATE para traer datos completos
		const appointments = await Appointments.find({})
			.populate("pet", "name petType breed") // Datos de la mascota
			.populate("owner", "name paternalLastName email username") // Datos del dueño
			.populate("service", "name price description") // Datos del servicio
			.populate("vet", "name paternalLastName username") // Datos del veterinario asignado
			.sort({ date: 1, time: 1 });

		if (appointments.length === 0) {
			return res.status(200).json({
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
			`Cancelación de la cita #${id}`,
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
		res.status(500).json({
			message: "Error al procesar la cancelación",
			error: error.message,
		});
	}
};

const acceptAppointment = async (req, res) => {
	try {
		const { id } = req.params;
		const user = req.user;

		if (user.role !== "admin") {
			return res.status(403).json({
				message: "Acceso denegado: Solo administradores pueden aceptar citas",
			});
		}

		const appointment = await Appointments.findById(id);

		if (!appointment) {
			return res.status(404).json({ message: "Cita no encontrada" });
		}

		if (appointment.status !== "Pendiente") {
			return res.status(400).json({
				message: `No se puede aceptar una cita con estado: ${appointment.status}`,
			});
		}

		// Buscar veterinarios disponibles
		const allVets = await Users.find({ role: "vet", isActive: true }).select(
			"_id name paternalLastName",
		);

		if (allVets.length === 0) {
			return res.status(409).json({
				message:
					"No hay veterinarios disponibles en este momento. No se puede aceptar la cita.",
			});
		}

		// Buscar citas ocupadas en la MISMA fecha y hora (comparación exacta de strings)
		const busyVets = await Appointments.find({
			date: appointment.date, // ← String exacto
			time: appointment.time,
			status: { $in: ["Aceptada", "En progreso"] },
			vet: { $exists: true, $ne: null },
		}).select("vet");

		const busyVetIds = busyVets.map((a) => a.vet.toString());
		const availableVets = allVets.filter(
			(vet) => !busyVetIds.includes(vet._id.toString()),
		);

		if (availableVets.length === 0) {
			return res.status(409).json({
				message:
					"No hay veterinarios disponibles para este horario. Todos están ocupados.",
			});
		}

		const randomIndex = Math.floor(Math.random() * availableVets.length);
		const assignedVet = availableVets[randomIndex];

		const oldStatus = appointment.status;
		appointment.status = "Aceptada";
		appointment.vet = assignedVet._id;
		await appointment.save();

		const updatedAppointment = await Appointments.findById(id)
			.populate("pet", "name petType breed")
			.populate("owner", "name paternalLastName email username")
			.populate("service", "name price description")
			.populate("vet", "name paternalLastName username");

		await safeLog(
			"UPDATE",
			"APPOINTMENT",
			`Aceptación de la cita #${id} - Asignada al veterinario ${assignedVet.name} ${assignedVet.paternalLastName}`,
			{
				appointmentId: id,
				petName: updatedAppointment.pet?.name,
				ownerName: updatedAppointment.owner?.name,
				serviceName: updatedAppointment.service?.name,
				assignedVetId: assignedVet._id,
				assignedVetName: `${assignedVet.name} ${assignedVet.paternalLastName}`,
				oldStatus: oldStatus,
				newStatus: "Aceptada",
			},
			user._id || user.id,
		);

		res.status(200).json({
			message: `Cita aceptada y asignada al Dr. ${assignedVet.name} ${assignedVet.paternalLastName}`,
			appointment: updatedAppointment,
		});
	} catch (error) {
		console.error("Error al aceptar la cita:", error);
		res
			.status(500)
			.json({ message: "Error al aceptar la cita", error: error.message });
	}
};

const rejectAppointment = async (req, res) => {
	try {
		const { id } = req.params;
		const { rejectionReason } = req.body;
		const user = req.user;

		if (user.role !== "admin") {
			return res.status(403).json({
				message: "Acceso denegado: Solo administradores pueden rechazar citas",
			});
		}

		const appointment = await Appointments.findById(id);

		if (!appointment) {
			return res.status(404).json({ message: "Cita no encontrada" });
		}

		if (appointment.status !== "Pendiente") {
			return res.status(400).json({
				message: `No se puede rechazar una cita con estado: ${appointment.status}`,
			});
		}

		const oldStatus = appointment.status;
		appointment.status = "Rechazada";
		appointment.rejectionReason = rejectionReason || null;
		await appointment.save();

		// Volver a buscar con populate para devolver datos completos
		const updatedAppointment = await Appointments.findById(id)
			.populate("pet", "name petType breed")
			.populate("owner", "name paternalLastName email username")
			.populate("service", "name price description")
			.populate("vet", "name paternalLastName username");

		await safeLog(
			"UPDATE",
			"APPOINTMENT",
			`Rechazo de la cita #${id}`,
			{
				appointmentId: id,
				petName: updatedAppointment.pet?.name,
				ownerName: updatedAppointment.owner?.name,
				serviceName: updatedAppointment.service?.name,
				oldStatus: oldStatus,
				newStatus: "Rechazada",
				rejectionReason: rejectionReason || null,
			},
			user._id || user.id,
		);

		res.status(200).json({
			message: "Cita rechazada exitosamente",
			appointment: updatedAppointment,
		});
	} catch (error) {
		console.error("Error al rechazar la cita:", error);
		res
			.status(500)
			.json({ message: "Error al rechazar la cita", error: error.message });
	}
};

const getAppointmentsByVet = async (req, res) => {
	try {
		const user = req.user;

		if (user.role !== "vet") {
			return res.status(403).json({
				message: "Acceso denegado: Solo veterinarios pueden ver sus citas",
			});
		}

		const vetId = user._id || user.id;

		// Obtener fecha de hoy como string YYYY-MM-DD
		const now = new Date();
		const todayStr = [
			now.getFullYear(),
			String(now.getMonth() + 1).padStart(2, "0"),
			String(now.getDate()).padStart(2, "0"),
		].join("-");

		console.log("Buscando citas para fecha:", todayStr);
		console.log("Vet ID:", vetId);

		const appointments = await Appointments.find({
			vet: vetId,
			date: todayStr, // ← Comparación exacta de strings
			status: { $in: ["Aceptada", "En progreso", "Terminada"] },
		})
			.populate("pet", "name petType breed")
			.populate("owner", "name paternalLastName email phone")
			.populate("service", "name price description")
			.sort({ time: 1 });

		console.log("Citas encontradas:", appointments.length);

		res.status(200).json({
			message: appointments.length
				? "Citas obtenidas"
				: "No tienes citas asignadas para hoy",
			appointments,
		});
	} catch (error) {
		console.error("Error al obtener citas del veterinario:", error);
		res
			.status(500)
			.json({ message: "Error al obtener las citas", error: error.message });
	}
};

const getVetHistory = async (req, res) => {
	try {
		const user = req.user;

		if (user.role !== "vet") {
			return res.status(403).json({
				message: "Acceso denegado: Solo veterinarios pueden ver su historial",
			});
		}

		const vetId = user._id || user.id;

		const appointments = await Appointments.find({
			vet: vetId,
		})
			.populate("pet", "name petType breed")
			.populate("owner", "name paternalLastName email phone")
			.populate("service", "name price description")
			.sort({ date: -1, time: -1 });

		res.status(200).json({
			message: appointments.length
				? "Historial de citas obtenido"
				: "No tienes citas en tu historial",
			appointments,
		});
	} catch (error) {
		console.error("Error al obtener historial del veterinario:", error);
		res
			.status(500)
			.json({ message: "Error al obtener el historial", error: error.message });
	}
};

module.exports = {
	createAppointments,
	getAllAppointments,
	getAppointmentsByUser,
	cancelAppointment,
	acceptAppointment,
	rejectAppointment,
	getAppointmentsByVet,
	getVetHistory,
};
