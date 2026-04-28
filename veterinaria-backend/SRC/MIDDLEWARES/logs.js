const Logs = require("../MODELS/logs.js");

const createLog = async (action, resource, description, metadata, userId) => {
	try {
		const log = new Logs({
			action,
			resource,
			description,
			metadata,
			user: userId,
		});
		await log.save();
	} catch (error) {
		console.error("Error al crear el log: " + error);
		res.status(500).json({ message: "Error al crear el log", error });
	}
};

module.exports = {
	createLog,
};
