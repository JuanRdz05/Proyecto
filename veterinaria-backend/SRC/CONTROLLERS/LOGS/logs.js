const Logs = require("../../MODELS/logs.js");

//Función para obtener todos los logs
//Actualmente no tiene medida de seguridad solo es para debuggear actualmente
const getAllLogs = async (req, res) => {
	try {
		const logs = await Logs.find({});
		console.log("===================================================");
		console.log("Mostrando todos los logs...");
		if (logs.length === 0) {
			console.log("===================================================");
			console.log("No hay logs por mostrar");
			return res
				.status(404)
				.json({ message: "No hay logs en la base de datos" });
		}
		res.status(200).json({ message: "Logs encontrados", logs });
	} catch (error) {
		console.error("Error al obtener los logs: ", error);
		res.status(500).json({ message: "Error al obtener los logs", error });
	}
};

module.exports = {
	getAllLogs,
};
