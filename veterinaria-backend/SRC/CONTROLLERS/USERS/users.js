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

// Obtener todos los veterinarios (role: "vet")
const getAllVets = async (req, res) => {
	try {
		const vets = await Users.find({ role: "vet" }).select("-password -__v");
		console.log("===================================================");
		console.log(`Mostrando ${vets.length} veterinarios`);
		res.status(200).json({
			message: "Veterinarios encontrados",
			vets,
		});
	} catch (error) {
		console.error("Error al obtener veterinarios:", error);
		res.status(500).json({
			message: "Error al obtener veterinarios",
			error,
		});
	}
};

// Activar/Desactivar veterinario (toggle isActive)
const toggleVetStatus = async (req, res) => {
	try {
		const { id } = req.params;

		// Verificar que el usuario existe y es veterinario
		const vet = await Users.findOne({ _id: id, role: "vet" });
		if (!vet) {
			return res.status(404).json({
				message: "Veterinario no encontrado",
			});
		}

		// Toggle del estado
		vet.isActive = !vet.isActive;
		await vet.save();

		console.log("===================================================");
		console.log(
			`Veterinario ${vet.name} ahora está ${vet.isActive ? "activo" : "inactivo"}`,
		);

		res.status(200).json({
			message: `Veterinario ${vet.isActive ? "activado" : "desactivado"} exitosamente`,
			vet: {
				_id: vet._id,
				name: vet.name,
				email: vet.email,
				isActive: vet.isActive,
			},
		});
	} catch (error) {
		console.error("Error al cambiar estado del veterinario:", error);
		res.status(500).json({
			message: "Error al cambiar estado del veterinario",
			error,
		});
	}
};

// Funcion para obtener el perfil del usuario
const getProfile = async (req, res) => {
	const userId = req.user.id;
	const user = await Users.findById(userId);
	res.json(user); // debe incluir isActive
};

module.exports = {
	getAllUsers,
	registerUser,
	getUser,
	getProfile,
	getAllVets,
	toggleVetStatus,
};
