const Services = require("../../MODELOS/SERVICES/services.js");
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

module.exports = {
	createService,
};
