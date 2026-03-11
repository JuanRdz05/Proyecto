const MedicalRecords = require("../../MODELS/medicalRecords.js");
const { createLog } = require("../../MIDDLEWARES/logs.js");

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

		//Verificamos que la cita exista.
		const appointmentDB = await Appointments.findById(appointmentId);
		if (!appointmentDB) {
			return res.status(404).json({ message: "Cita no encontrada" });
		}

		//Validamos que el usuario sea un veterinario
		if (user.role !== "vet") {
			return res
				.status(403)
				.json({ message: "Acceso denegado: Solo veterinarios" });
		}

		//Creamos el registro del rcord medico
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

		//Actualizamos el estatus de la cita
		appointmentDB.status = "Terminada";
		await appointmentDB.save();

		//Registro en el Log
		await createLog(
			"CREATE",
			"RECORD",
			`El veterinario ${user.username} ha completado la cita y creado un historial médico`,
			{
				username: user.username,
				id_record: record._id,
				pet_id: appointmentDB.pet,
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

//Ruta para mostrar todos los registros medicos
const getAllRecords = async (req, res) => {
	try {
		console.log("===================================================");
		console.log("Obteniendo todos los historiales médicos...");
		//Verificamos que el usuario sea un administrador
		const user = req.user;
		if (user.role !== "admin") {
			console.log("===================================================");
			console.log("Acceso denegado");
			return res.status(403).json({ message: "Acceso denegado" });
		}
		const records = await MedicalRecords.find({})
			.populate("pet", "name petType")
			.populate("vet", "username email")
			.populate("service", "name price")
			.sort({ createdAt: -1 });

		if (records.length === 0) {
			return res
				.status(404)
				.json({ message: "No hay registros en la base de datos" });
		}

		console.log(`Se encontraron ${records.length} registros.`);
		res.status(200).json({ message: "Registros obtenidos con éxito", records });
	} catch (error) {
		console.error("Error al obtener los registros: ", error);
		res.status(500).json({
			message: "Error al obtener los registros",
			error: error.message,
		});
	}
};
//Ruta para obtener los registros por usuario
const getRecordsByUser = async (req, res) => {
	try {
		const user = req.user;
		console.log("===================================================");
		console.log("Obteniendo todos los registros del usuario...");
		if (user.role !== "admin" && user.role !== "vet") {
			return res.status(403).json({ message: "Acceso denegado" });
		}
		const targetId = req.params.id || user.id;

		const records = await MedicalRecords.find({ vet: targetId })
			.populate("pet", "name petType")
			.populate("vet", "username email")
			.populate("service", "name price")
			.sort({ createdAt: -1 });
		console.log("===================================================");
		console.log("Verificando la existencia de los registros...");
		if (records.length === 0) {
			console.log("===================================================");
			console.log("No hay registros para mostrar");
			return res
				.status(404)
				.json({ message: "No hay registros para este usuario" });
		}
		console.log("===================================================");
		console.log("Registros obtenidos exitosamente");
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
