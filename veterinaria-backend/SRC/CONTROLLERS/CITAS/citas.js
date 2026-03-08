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

module.exports = {
	createAppointments,
};
