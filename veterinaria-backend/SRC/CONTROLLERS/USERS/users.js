const Users = require("../../MODELS/users.js");
const { hashPassword } = require("../../MIDDLEWARES/passwords.js");
const { validateEmail } = require("../../MIDDLEWARES/emailFormatter.js");

const getAllUsers = async (req, res) => {
	try {
		const users = await Users.find({}).select("-_id");
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

// Registrar un nuevo usuario
const registerUser = async (req, res) => {
	try {
		const {
			name,
			paternalLastName,
			maternalLastName,
			email,
			password,
			username,
			role,
		} = req.body;

		// Validar que la contraseña exista
		if (!password) {
			return res.status(400).json({ message: "La contraseña es requerida" });
		}

		const passwordHash = hashPassword(password);

		if (!validateEmail(email)) {
			return res.status(400).json({ message: "El email no es valido" });
		}

		// Validar que el rol sea válido
		const validRoles = ["client", "vet", "admin"];
		const userRole = validRoles.includes(role) ? role : "client";

		// --- Con diskStorage, la imagen se guarda en disco ---
		// req.file contiene path y filename, NO buffer
		let profilePictureUrl = null;

		if (req.file) {
			// Guardamos la ruta relativa para servirla con express.static
			profilePictureUrl = `/uploads/${req.file.filename}`;
		}

		const user = new Users({
			name,
			paternalLastName: paternalLastName || "",
			maternalLastName,
			email,
			password: passwordHash,
			username,
			role: userRole,
			profilePicture: profilePictureUrl,
		});

		await user.save();
		res.status(201).json({
			message: "Usuario registrado exitosamente",
			user: {
				_id: user._id,
				username: user.username,
				name: user.name,
				email: user.email,
				role: user.role,
				profilePicture: user.profilePicture,
			},
		});
	} catch (error) {
		console.error("Error al registrar el usuario: ", error);
		res.status(500).json({ message: "Error al registrar el usuario", error });
	}
};

// Función para obtener el usuario por email
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

// Funcion para obtener el perfil del usuario
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
