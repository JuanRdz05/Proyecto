const Services = require("../../MODELS/services.js");
const { createLog } = require("../../MIDDLEWARES/logs.js");
const { formatoDinero } = require("../../MIDDLEWARES/formateoDinero.js");
//Ruta para crear un servicio
const createService = async (req, res) => {
	try {
		console.log("===================================================");
		console.log("Comenzando el proceso para crear un servicio...");
		//Obtenemos los datos del usuario que esta creando el servicio
		const user = req.user;
		console.log("===================================================");
		console.log("Intentando crear un servicio...");
		console.log("===================================================");
		console.log("Usuario: ", user.username);
		console.log("Email: ", user.email);
		console.log("Rol del usuario: ", user.role);
		//Obtenemos los datos del servicio
		if (user.role !== "admin") {
			console.log("===================================================");
			console.log("Acceso denegado");
			return res.status(403).json({ message: "Acceso denegado" });
		}
		const { name, description, price } = req.body;
		console.log("Datos del servicio: ", { name, description, price });
		const service = new Services({
			name,
			description,
			price,
		});
		//Guardamos el servicio en la base de datos
		await service.save();
		console.log("===================================================");
		console.log("Servicio creado exitosamente");
		//Formateamos el precio
		const precioFormateado = formatoDinero(price);
		//Guardamos el log
		await createLog(
			"CREATE",
			"SERVICE",
			`El servicio ${name} ha sido creado`,
			{
				user: req.user.username,
				email: req.user.email,
				role: req.user.role,
				precioFinal: precioFormateado,
				id_service: service._id,
			},
			user._id,
		);
		res.status(201).json({ message: "Servicio creado exitosamente", service });
	} catch (error) {
		console.error("Hubo un error al crear el servicio: " + error);
		res.status(500).json({ message: "Hubo un error al crear el servicio" });
	}
};

//Función para obtener todos los servicios
const getAllServices = async (req, res) => {
	try {
		console.log("===================================================");
		console.log("Comenzando el proceso para obtener todos los servicios...");
		const services = await Services.find({}).select("-_id");
		if (services.length === 0) {
			console.log("===================================================");
			console.log("No hay servicios para mostrar");
			return res.status(404).json({ message: "No hay servicios para mostrar" });
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

//Función para cambiar el estado de un servicio
const changeStatus = async (req, res) => {
	try {
		console.log("===================================================");
		console.log(
			"Comenzando el proceso para cambiar el estado de un servicio...",
		);
		const serviceId = req.params.id;
		const user = req.user;
		//Buscamos el servicio
		console.log("===================================================");
		console.log("Buscando servicio...");
		const service = await Services.findById(serviceId);
		//Validamos que existe
		console.log("===================================================");
		console.log("Validando que el servicio existe...");
		if (!service) {
			console.log("===================================================");
			console.log("Servicio no encontrado");
			return res.status(404).json({ message: "Servicio no encontrado" });
		}
		//Validamos que sea un administrador quien intenta cambiar el estado
		console.log("===================================================");
		console.log("Validando el rol del usuario...");
		if (user.role !== "admin") {
			console.log("===================================================");
			console.log("Acceso denegado");
			return res.status(403).json({ message: "Acceso denegado" });
		}
		//Actualizamos el estado
		const updatedService = await Services.findByIdAndUpdate(
			serviceId,
			{ isActive: !service.isActive },
			{ new: true },
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

module.exports = {
	createService,
	getAllServices,
	changeStatus,
};
