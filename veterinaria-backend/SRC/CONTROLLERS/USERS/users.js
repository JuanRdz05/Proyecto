const Users = require("../../MODELS/users.js");
const { hashPassword } = require("../../MIDDLEWARES/passwords.js");
const { validateEmail } = require("../../MIDDLEWARES/emailFormatter.js");
const { createLog } = require("../../MIDDLEWARES/logs.js");

// Helper para loguear de forma segura (no bloquea la operación principal)
const safeLog = async (action, resource, description, metadata, userId) => {
	try {
		await createLog(action, resource, description, metadata, userId);
	} catch (logError) {
		console.warn("[safeLog] Log no creado, pero operación continúa");
	}
};

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

		if (!password) {
			return res.status(400).json({ message: "La contraseña es requerida" });
		}

		const passwordHash = hashPassword(password);

		if (!validateEmail(email)) {
			return res.status(400).json({ message: "El email no es valido" });
		}

		const validRoles = ["client", "vet", "admin"];
		const userRole = validRoles.includes(role) ? role : "client";

		let profilePictureUrl = null;
		if (req.file) {
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

		// Log de auditoría para registro
		await safeLog(
			"CREATE",
			"USER",
			`Nuevo usuario registrado: ${username} (${email}) con rol ${userRole}`,
			{
				userId: user._id,
				username: user.username,
				email: user.email,
				role: user.role,
				name: `${name} ${paternalLastName || ""} ${maternalLastName || ""}`.trim(),
				registeredBy: req.user?.id || "self-registration",
			},
			user._id,
		);

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

const getProfile = async (req, res) => {
	const userId = req.user.id;
	const user = await Users.findById(userId);
	res.json(user);
};

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

const toggleVetStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const vet = await Users.findOne({ _id: id, role: "vet" });

		if (!vet) {
			return res.status(404).json({
				message: "Veterinario no encontrado",
			});
		}

		const oldStatus = vet.isActive;
		vet.isActive = !vet.isActive;
		await vet.save();

		const actionType = vet.isActive ? "activado" : "desactivado";

		// Log de auditoría
		await safeLog(
			"UPDATE",
			"USER",
			`El administrador ${req.user?.username || "sistema"} ${actionType} al veterinario ${vet.name} (${vet.email})`,
			{
				vetId: vet._id,
				vetName: vet.name,
				vetEmail: vet.email,
				oldStatus: oldStatus,
				newStatus: vet.isActive,
				actionBy: req.user?.username,
				actionById: req.user?.id,
				actionByRole: req.user?.role,
			},
			req.user?.id,
		);

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

const getAllAdmins = async (req, res) => {
	try {
		const admins = await Users.find({ role: "admin" }).select("-password -__v");
		console.log("===================================================");
		console.log(`Mostrando ${admins.length} administradores`);
		res.status(200).json({
			message: "Administradores encontrados",
			admins,
		});
	} catch (error) {
		console.error("Error al obtener administradores:", error);
		res.status(500).json({
			message: "Error al obtener administradores",
			error,
		});
	}
};

const toggleAdminStatus = async (req, res) => {
	try {
		const { id } = req.params;

		if (req.user.id === id) {
			return res.status(403).json({
				message: "No puedes desactivar tu propia cuenta",
			});
		}

		const admin = await Users.findOne({ _id: id, role: "admin" });
		if (!admin) {
			return res.status(404).json({
				message: "Administrador no encontrado",
			});
		}

		const oldStatus = admin.isActive;
		admin.isActive = !admin.isActive;
		await admin.save();

		const actionType = admin.isActive ? "activado" : "desactivado";

		// Log de auditoría
		await safeLog(
			"UPDATE",
			"USER",
			`El administrador ${req.user?.username || "sistema"} ${actionType} al administrador ${admin.name} (${admin.email})`,
			{
				adminId: admin._id,
				adminName: admin.name,
				adminEmail: admin.email,
				oldStatus: oldStatus,
				newStatus: admin.isActive,
				actionBy: req.user?.username,
				actionById: req.user?.id,
				actionByRole: req.user?.role,
			},
			req.user?.id,
		);

		console.log("===================================================");
		console.log(
			`Administrador ${admin.name} ahora está ${admin.isActive ? "activo" : "inactivo"}`,
		);

		res.status(200).json({
			message: `Administrador ${admin.isActive ? "activado" : "desactivado"} exitosamente`,
			admin: {
				_id: admin._id,
				name: admin.name,
				email: admin.email,
				isActive: admin.isActive,
			},
		});
	} catch (error) {
		console.error("Error al cambiar estado del administrador:", error);
		res.status(500).json({
			message: "Error al cambiar estado del administrador",
			error,
		});
	}
};

const getAllClients = async (req, res) => {
	try {
		const clients = await Users.find({ role: "client" }).select(
			"-password -__v",
		);
		console.log("===================================================");
		console.log(`Mostrando ${clients.length} clientes`);
		res.status(200).json({
			message: "Clientes encontrados",
			clients,
		});
	} catch (error) {
		console.error("Error al obtener clientes:", error);
		res.status(500).json({ message: "Error al obtener clientes", error });
	}
};

const toggleClientStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const client = await Users.findOne({ _id: id, role: "client" });

		if (!client) {
			return res.status(404).json({ message: "Cliente no encontrado" });
		}

		const oldStatus = client.isActive;
		client.isActive = !client.isActive;
		await client.save();

		const actionType = client.isActive ? "activado" : "desactivado";

		// Log de auditoría
		await safeLog(
			"UPDATE",
			"USER",
			`El administrador ${req.user?.username || "sistema"} ${actionType} al cliente ${client.name} (${client.email})`,
			{
				clientId: client._id,
				clientName: client.name,
				clientEmail: client.email,
				oldStatus: oldStatus,
				newStatus: client.isActive,
				actionBy: req.user?.username,
				actionById: req.user?.id,
				actionByRole: req.user?.role,
			},
			req.user?.id,
		);

		res.status(200).json({
			message: `Cliente ${client.isActive ? "activado" : "desactivado"} exitosamente`,
			client: {
				_id: client._id,
				name: client.name,
				email: client.email,
				isActive: client.isActive,
			},
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error al cambiar estado del cliente", error });
	}
};

module.exports = {
	getAllUsers,
	registerUser,
	getUser,
	getProfile,
	getAllVets,
	toggleVetStatus,
	getAllAdmins,
	toggleAdminStatus,
	getAllClients,
	toggleClientStatus,
};
