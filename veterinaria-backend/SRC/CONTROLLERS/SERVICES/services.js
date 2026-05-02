const Services = require("../../MODELS/services.js");
const { createLog } = require("../../MIDDLEWARES/logs.js");
const { formatoDinero } = require("../../MIDDLEWARES/formateoDinero.js");

// Helper para loguear de forma segura
const safeLog = async (action, resource, description, metadata, userId) => {
	try {
		await createLog(action, resource, description, metadata, userId);
	} catch (logError) {
		console.warn("[safeLog] Log no creado, pero operación continúa");
	}
};

const createService = async (req, res) => {
	try {
		console.log("===================================================");
		console.log("Comenzando el proceso para crear un servicio...");

		const user = req.user;

		console.log("===================================================");
		console.log("Intentando crear un servicio...");
		console.log("===================================================");
		console.log("Usuario: ", user?.username);
		console.log("Email: ", user?.email);
		console.log("Rol del usuario: ", user?.role);

		if (!user || user.role !== "admin") {
			console.log("===================================================");
			console.log("Acceso denegado");
			return res.status(403).json({ message: "Acceso denegado" });
		}

		const { name, description, price } = req.body;
		console.log("Datos del servicio: ", { name, description, price });

		if (!name || !description || price === undefined || price === null) {
			return res.status(400).json({ message: "Faltan datos requeridos" });
		}

		const priceNumber = parseFloat(price);
		if (isNaN(priceNumber) || priceNumber < 0) {
			return res
				.status(400)
				.json({ message: "El precio debe ser un número válido" });
		}

		const service = new Services({
			name,
			description,
			price: priceNumber,
		});

		const precioFormateado = formatoDinero(priceNumber);
		console.log("Precio formateado: ", precioFormateado);

		await service.save();
		console.log("===================================================");
		console.log("Servicio creado exitosamente");

		// Log de auditoría mejorado
		await safeLog(
			"CREATE",
			"SERVICE",
			`El administrador ${user.username} creó el servicio "${name}" con precio ${precioFormateado}`,
			{
				serviceId: service._id,
				serviceName: name,
				serviceDescription: description?.substring(0, 200),
				price: priceNumber,
				priceFormatted: precioFormateado,
				createdBy: user.username,
				createdByEmail: user.email,
			},
			user._id,
		);

		res.status(201).json({ message: "Servicio creado exitosamente", service });
	} catch (error) {
		console.error("Hubo un error al crear el servicio: ", error);
		res.status(500).json({ message: "Hubo un error al crear el servicio" });
	}
};

const getAllServices = async (req, res) => {
	try {
		console.log("===================================================");
		console.log("Comenzando el proceso para obtener todos los servicios...");

		const services = await Services.find({});

		if (services.length === 0) {
			console.log("===================================================");
			console.log("No hay servicios para mostrar");
			return res
				.status(200)
				.json({ message: "No hay servicios para mostrar", services: [] });
		}

		console.log("===================================================");
		console.log("Servicios obtenidos exitosamente");
		res
			.status(200)
			.json({ message: "Servicios obtenidos exitosamente", services });
	} catch (error) {
		console.error("Hubo un error al obtener los servicios: " + error);
		res.status(500).json({ message: "Hubo un error al obtener los servicios" });
	}
};

const changeStatus = async (req, res) => {
	try {
		console.log("===================================================");
		console.log(
			"Comenzando el proceso para cambiar el estado de un servicio...",
		);

		const serviceId = req.params.id;
		const user = req.user;

		console.log("===================================================");
		console.log("Buscando servicio...");
		const service = await Services.findById(serviceId);

		console.log("===================================================");
		console.log("Validando que el servicio existe...");
		if (!service) {
			console.log("===================================================");
			console.log("Servicio no encontrado");
			return res.status(404).json({ message: "Servicio no encontrado" });
		}

		console.log("===================================================");
		console.log("Validando el rol del usuario...");
		if (user.role !== "admin") {
			console.log("===================================================");
			console.log("Acceso denegado");
			return res.status(403).json({ message: "Acceso denegado" });
		}

		const oldStatus = service.isActive;
		const updatedService = await Services.findByIdAndUpdate(
			serviceId,
			{ isActive: !service.isActive },
			{ new: true },
		);

		const actionType = updatedService.isActive ? "activado" : "desactivado";

		// Log de auditoría
		await safeLog(
			"UPDATE",
			"SERVICE",
			`El administrador ${user.username} ${actionType} el servicio "${service.name}"`,
			{
				serviceId: serviceId,
				serviceName: service.name,
				oldStatus: oldStatus,
				newStatus: updatedService.isActive,
				actionBy: user.username,
				actionById: user.id,
			},
			user._id,
		);

		console.log("===================================================");
		console.log("Servicio actualizado exitosamente");
		res
			.status(200)
			.json({ message: "Estado del servicio cambiado", updatedService });
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ message: "Error", error: error.message });
	}
};

const getServiceById = async (req, res) => {
	try {
		console.log("===================================================");
		console.log("Buscando el servicio seleccionado...");

		const serviceId = req.params.id;
		const service = await Services.findById(serviceId);

		if (!service) {
			console.log("===================================================");
			console.log("Servicio no encontrado");
			return res.status(404).json({ message: "Servicio no encontrado" });
		}

		console.log("===================================================");
		console.log("Servicio encontrado exitosamente");
		res.status(200).json({ message: "Servicio encontrado", service });
	} catch (error) {
		console.error("Error al obtener el servicio: ", error);
		res.status(500).json({ message: "Error al obtener el servicio", error });
	}
};

const updateService = async (req, res) => {
	try {
		console.log("===================================================");
		console.log("Comenzando el proceso para actualizar un servicio...");

		const user = req.user;
		const serviceId = req.params.id;

		if (!user || user.role !== "admin") {
			console.log("Acceso denegado");
			return res.status(403).json({ message: "Acceso denegado" });
		}

		const { name, description, price } = req.body;

		const service = await Services.findById(serviceId);
		if (!service) {
			return res.status(404).json({ message: "Servicio no encontrado" });
		}

		if (!name?.trim() || !description?.trim() || price === undefined) {
			return res.status(400).json({ message: "Faltan datos requeridos" });
		}

		const priceNumber = parseFloat(price);
		if (isNaN(priceNumber) || priceNumber < 0) {
			return res
				.status(400)
				.json({ message: "El precio debe ser un número válido" });
		}

		// Guardar datos antiguos para el log
		const oldData = {
			name: service.name,
			description: service.description,
			price: service.price,
		};

		const updatedService = await Services.findByIdAndUpdate(
			serviceId,
			{
				name: name.trim(),
				description: description.trim(),
				price: priceNumber,
			},
			{ new: true },
		);

		const precioFormateado = formatoDinero(priceNumber);

		// Log de auditoría mejorado con datos antes/después
		await safeLog(
			"UPDATE",
			"SERVICE",
			`El administrador ${user.username} actualizó el servicio "${oldData.name}" → "${name}"`,
			{
				serviceId: serviceId,
				oldData: {
					name: oldData.name,
					description: oldData.description?.substring(0, 100),
					price: oldData.price,
				},
				newData: {
					name: updatedService.name,
					description: updatedService.description?.substring(0, 100),
					price: updatedService.price,
				},
				priceFormatted: precioFormateado,
				updatedBy: user.username,
				updatedByEmail: user.email,
			},
			user._id,
		);

		console.log("Servicio actualizado exitosamente");
		res.status(200).json({
			message: "Servicio actualizado exitosamente",
			service: updatedService,
		});
	} catch (error) {
		console.error("Error al actualizar el servicio:", error);
		res.status(500).json({ message: "Error al actualizar el servicio" });
	}
};

module.exports = {
	createService,
	getAllServices,
	changeStatus,
	getServiceById,
	updateService,
};
