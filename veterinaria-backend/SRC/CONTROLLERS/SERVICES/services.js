const Services = require("../../MODELS/services.js");
const Users = require("../../MODELS/users.js");
const { createLog } = require("../../MIDDLEWARES/logs.js");
const { formatoDinero } = require("../../MIDDLEWARES/formateoDinero.js");

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

		if (!user || user.role !== "admin") {
			return res.status(403).json({ message: "Acceso denegado" });
		}

		const { name, description, price } = req.body;

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
		await service.save();

		await safeLog(
			"CREATE",
			"SERVICE",
			`Creación del servicio "${name}" con precio ${precioFormateado}`,
			{
				serviceId: service._id,
				serviceName: name,
				serviceDescription: description?.substring(0, 200),
				price: priceNumber,
				priceFormatted: precioFormateado,
			},
			user._id || user.id,
		);

		res.status(201).json({ message: "Servicio creado exitosamente", service });
	} catch (error) {
		console.error("Hubo un error al crear el servicio: ", error);
		res.status(500).json({ message: "Hubo un error al crear el servicio" });
	}
};

const getAllServices = async (req, res) => {
	try {
		const services = await Services.find({});
		if (services.length === 0) {
			return res
				.status(200)
				.json({ message: "No hay servicios para mostrar", services: [] });
		}
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
		const serviceId = req.params.id;
		const user = req.user;
		const service = await Services.findById(serviceId);

		if (!service) {
			return res.status(404).json({ message: "Servicio no encontrado" });
		}

		if (user.role !== "admin") {
			return res.status(403).json({ message: "Acceso denegado" });
		}

		const oldStatus = service.isActive;
		const updatedService = await Services.findByIdAndUpdate(
			serviceId,
			{ isActive: !service.isActive },
			{ new: true },
		);

		const actionType = updatedService.isActive ? "Activación" : "Desactivación";

		await safeLog(
			"UPDATE",
			"SERVICE",
			`${actionType} del servicio "${service.name}"`,
			{
				serviceId: serviceId,
				serviceName: service.name,
				oldStatus: oldStatus,
				newStatus: updatedService.isActive,
			},
			user._id || user.id,
		);

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
		const service = await Services.findById(req.params.id);
		if (!service) {
			return res.status(404).json({ message: "Servicio no encontrado" });
		}
		res.status(200).json({ message: "Servicio encontrado", service });
	} catch (error) {
		console.error("Error al obtener el servicio: ", error);
		res.status(500).json({ message: "Error al obtener el servicio", error });
	}
};

const updateService = async (req, res) => {
	try {
		const user = req.user;
		const serviceId = req.params.id;

		if (!user || user.role !== "admin") {
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

		// Log por cada campo cambiado — descripción sin nombre de usuario
		if (oldData.name !== updatedService.name) {
			await safeLog(
				"UPDATE",
				"SERVICE",
				`Cambio de nombre del servicio de "${oldData.name}" a "${updatedService.name}"`,
				{
					serviceId: serviceId,
					serviceName: updatedService.name,
					campoModificado: "nombre",
					valorAnterior: oldData.name,
					valorNuevo: updatedService.name,
				},
				user._id || user.id,
			);
		}

		if (oldData.description !== updatedService.description) {
			await safeLog(
				"UPDATE",
				"SERVICE",
				`Actualización de la descripción del servicio "${updatedService.name}"`,
				{
					serviceId: serviceId,
					serviceName: updatedService.name,
					campoModificado: "descripción",
					valorAnterior: oldData.description,
					valorNuevo: updatedService.description,
				},
				user._id || user.id,
			);
		}

		if (oldData.price !== updatedService.price) {
			const precioAnteriorFormateado = formatoDinero(oldData.price);
			await safeLog(
				"UPDATE",
				"SERVICE",
				`Cambio de precio del servicio "${updatedService.name}" de ${precioAnteriorFormateado} a ${precioFormateado}`,
				{
					serviceId: serviceId,
					serviceName: updatedService.name,
					campoModificado: "precio",
					valorAnterior: oldData.price,
					valorAnteriorFormatted: precioAnteriorFormateado,
					valorNuevo: updatedService.price,
					valorNuevoFormatted: precioFormateado,
				},
				user._id || user.id,
			);
		}

		res.status(200).json({
			message: "Servicio actualizado exitosamente",
			service: updatedService,
		});
	} catch (error) {
		console.error("Error al actualizar el servicio:", error);
		res.status(500).json({ message: "Error al actualizar el servicio" });
	}
};

const deleteService = async (req, res) => {
	try {
		const user = req.user;
		const serviceId = req.params.id;

		if (!user || user.role !== "admin") {
			return res.status(403).json({ message: "Acceso denegado" });
		}

		const service = await Services.findById(serviceId);

		if (!service) {
			return res.status(404).json({ message: "Servicio no encontrado" });
		}

		const serviceData = {
			serviceId: service._id,
			serviceName: service.name,
			serviceDescription: service.description?.substring(0, 200),
			servicePrice: service.price,
			priceFormatted: formatoDinero(service.price),
		};

		await Services.findByIdAndDelete(serviceId);

		await safeLog(
			"DELETE",
			"SERVICE",
			`Eliminación permanente del servicio "${serviceData.serviceName}" (${serviceData.priceFormatted})`,
			serviceData,
			user._id || user.id,
		);

		res
			.status(200)
			.json({ message: "Servicio eliminado permanentemente" });
	} catch (error) {
		console.error("Error al eliminar el servicio:", error);
		res
			.status(500)
			.json({ message: "Error al eliminar el servicio", error: error.message });
	}
};

module.exports = {
	createService,
	getAllServices,
	changeStatus,
	getServiceById,
	updateService,
	deleteService,
};

