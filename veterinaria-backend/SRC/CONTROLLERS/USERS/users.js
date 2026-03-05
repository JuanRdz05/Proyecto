const Users = require("../../MODELS/users.js");
const { hashPassword } = require("../../MIDDLEWARES/passwords.js");
const { validateEmail } = require("../../MIDDLEWARES/emailFormatter.js");

const getAllUsers = async (req, res) => {
	try {
		const users = await Users.find({});
		console.log("===================================================");
		console.log("Mostrando los usuarios registrados...");
		if (users.length === 0) {
			console.log("===================================================");
			console.log("No hay usuarios por mostrar");
			return res
				.status(404)
				.json({ message: "No hay usuarios en la base de datos" });
		}

		res.status(200).json({ message: "Usuarios encontrados", users });
	} catch (error) {
		console.error("Error al obtener los usuarios: ", error);
		res.status(500).json({ message: "Error al obtener los usuarios", error });
	}
};

//Registar un nuevo usuario
const registerUser = async (req, res) => {
	try {
		const { name, paternalLastName, maternalLastName, email, password } =
			req.body;
		//Hasheo de la contraseña
		const passwordHash = hashPassword(password);
		//Validar el formato del email
		if (!validateEmail(email)) {
			console.log("===================================================");
			console.log("El email no es valido");
			return res.status(400).json({ message: "El email no es valido" });
		}
		const user = new Users({
			name,
			paternalLastName,
			maternalLastName,
			email,
			password: passwordHash,
			role: "client",
		});
		//Guardamos el usuario en la base de datos
		await user.save();
		console.log("===================================================");
		console.log("Usuario registrado exitosamente");
		res.status(201).json({ message: "Usuario registrado exitosamente" });
	} catch (error) {
		console.error("Error al registrar el usuario: ", error);
		res.status(500).json({ message: "Error al registrar el usuario", error });
	}
};

//Función para obtener el usuerio por email
const getUser = async (req, res) => {
	try {
		const { email } = req.params;
		console.log("===================================================");
		console.log("Buscando usuario...");
		const user = await Users.findOne({ email }).select(
			"-_id name paternalLastName maternalLastName email role isActive",
		);
		if (!user) {
			console.log("===================================================");
			console.log("No hay usuario con ese email");
			return res.status(404).json({ message: "No hay usuario con ese email" });
		}
		console.log("===================================================");
		console.log("Usuario encontrado: ", user);
		res.status(200).json({ message: "Usuario encontrado: ", user });
	} catch (error) {
		console.error("Error al obtener el usuario: ", error);
		res.status(500).json({ message: "Error al obtener el usuario", error });
	}
};

//Funcion para obtener el perfil del usuario
const getProfile = async (req, res) => {
	const userId = req.user.id; // viene del token
	const user = await Users.findById(userId);
	res.json(user);
};

module.exports = {
	getAllUsers,
	registerUser,
	getUser,
	getProfile,
};
