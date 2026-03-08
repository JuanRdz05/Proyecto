const Appointments = require("../../MODELS/appointment.js");
const Services = require("../../MODELS/services.js");
const { createLog } = require("../../MIDDLEWARES/logs.js");

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
		//Extramos los datos del request
		const { date, time, pet, service: serviceId, notes } = req.body;
		//Buscamos el servicio
		const servicioDB = await Services.findById(serviceId);

		if (!servicioDB) {
			console.log("===================================================");
			console.log("Servicio no encontrado");
			return res.status(404).json({ message: "Servicio no encontrado" });
		}
		//Creamos la cita
		const appointment = new Appointments({
			date,
			time,
			pet, //Id de la mascota
			service: serviceId, //Id del servicio
			precioAlRegistrar: servicioDB.price, //Precio del servicio al momento de registrar la cita
			owner: user.id, //Id del dueño de la mascota
			status: "Pending",
			notes,
		});

		await appointment.save();

		// 4. Log de auditoría
		await createLog(
			"CREATE",
			"APPOINTMENT",
			`El cliente ${user.username} ha solicitado una cita`,
			{
				username: user.username,
				email: user.email,
				precioCapturado: servicioDB.price,
				id_appointment: appointment._id,
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
//Función para obtener todas las citas
const getAllAppointments = async (req, res) => {
	try {
		console.log("===================================================");
		console.log("Comenzando el proceso para obtener todas las citas...");
		//Verificar que el usuario tenga permisos para ver todas las citas
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
				.status(404)
				.json({ message: "No hay citas en la base de datos" });
		}
		res.status(200).json({ message: "Citas obtenidas", appointments });
	} catch (error) {
		console.error("Error al obtener las citas: ", error);
		res.status(500).json({ message: "Error al obtener las citas", error });
	}
};

//Función para mostrar las citas por usuario
const getAppointmentsByUser = async (req, res) => {
	try {
		console.log("===================================================");
		console.log("Comenzando el proceso para obtener las citas de usuario...");
		const userId = req.user.id;
		const userRole = req.user.role;
		//Verificar que el usuario sea un cliente
		if (userRole !== "client") {
			console.log("Acceso denegado");
			return res
				.status(403)
				.json({ message: "Acceso denegado: Servicio solo para clientes" });
		}
		console.log("===================================================");
		console.log("Procesando la solicitud de las citas de usuario...");
		//Mostramos las citas del usuario
		const appointments = await Appointments.find({ owner: userId })
			.populate("pet", "name species")
			.populate("service", "name price")
			.sort({ date: 1, time: 1 });
		if (appointments.length === 0) {
			console.log("===================================================");
			console.log("No hay citas para mostrar");
			return res
				.status(404)
				.json({ message: "No hay citas en la base de datos" });
		}
		console.log("===================================================");
		console.log("Citas obtenidas exitosamente");
		res.status(200).json({ message: "Citas obtenidas", appointments });
	} catch (error) {
		console.error("Error al obtener las citas de usuario: ", error);
		res
			.status(500)
			.json({ message: "Error al obtener las citas de usuario", error });
	}
};

//Función para cancelar una cita
const cancelAppointment = async (req, res) => {
	try {
		console.log("===================================================");
		console.log("Comenzando el proceso para cancelar una cita...");
		const { id } = req.params;
		//Buscamos la cita
		const appointment = await Appointments.findById(id);
		if (!appointment) {
			return res.status(404).json({ message: "Cita no encontrada" });
		}
		const oldStatus = appointment.status;
		//Verficamos que sea el dueño de la cita o un administrador
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
		//Verificamos que el estado de la cita que tenga sea un estado aceptable
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
		// 5. Registro en el Log
		await createLog(
			"UPDATE",
			"APPOINTMENT",
			`Cita cancelada por el usuario ${req.user.username}`,
			{
				user: req.user.username,
				old_status: oldStatus, // O el que tuviera
				new_status: "Cancelada",
			},
			req.user.id,
		);

		console.log("Cita cancelada exitosamente");
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

module.exports = {
	createAppointments,
	getAllAppointments,
	getAppointmentsByUser,
	cancelAppointment,
};
