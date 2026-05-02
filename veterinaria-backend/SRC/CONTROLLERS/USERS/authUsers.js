const Users = require("../../MODELS/users.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { createLog } = require("../../MIDDLEWARES/logs.js");
dotenv.config();

// Helper para loguear de forma segura (no bloquea la operación principal)
const safeLog = async (action, resource, description, metadata, userId) => {
	try {
		await createLog(action, resource, description, metadata, userId);
	} catch (logError) {
		console.warn("[safeLog] Log no creado, pero operación continúa");
	}
};

const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;
		console.log("===================================================");
		console.log("Buscando usuario...");

		const user = await Users.findOne({ email });
		if (!user) {
			console.log("===================================================");
			console.log("Usuario no encontrado");
			return res.status(401).json({
				message: "La contraseña o el correo electrónico no son correctos",
			});
		}

		const passwordCompare = bcrypt.compareSync(password, user.password);
		if (!passwordCompare) {
			console.log("===================================================");
			console.log("La contraseña o el correo electrónico no son correctos");

			// Log de intento fallido de login
			await safeLog(
				"LOGIN",
				"USER",
				`Intento de inicio de sesión fallido para el email: ${email}`,
				{
					email: email,
					reason: "Contraseña incorrecta",
					ip: req.ip,
					userAgent: req.headers["user-agent"],
				},
				null,
			);

			return res.status(401).json({
				message: "La contraseña o el correo electrónico no son correctos",
			});
		}

		// Verificar que el usuario esté activo
		if (user.isActive === false) {
			console.log("===================================================");
			console.log("Usuario desactivado intentando iniciar sesión");

			await safeLog(
				"LOGIN",
				"USER",
				`Intento de inicio de sesión bloqueado: usuario ${user.username} está desactivado`,
				{
					userId: user._id,
					email: user.email,
					role: user.role,
					username: user.username,
					reason: "Usuario desactivado",
					ip: req.ip,
				},
				user._id,
			);

			return res.status(403).json({
				message: "Tu cuenta ha sido desactivada. Contacta al administrador.",
			});
		}

		const token = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_KEY,
			{ expiresIn: "1h" },
		);

		// Log de inicio de sesión exitoso (para todos los roles)
		await safeLog(
			"LOGIN",
			"USER",
			`El usuario ${user.name} (${user.username}) ha iniciado sesión exitosamente`,
			{
				userId: user._id,
				email: user.email,
				role: user.role,
				username: user.username,
				name: user.name,
				ip: req.ip,
				userAgent: req.headers["user-agent"],
			},
			user._id,
		);

		console.log("===================================================");
		console.log("Iniciando sesión...");

		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 3600000,
		});

		res.status(200).json({
			message: "Inicio de sesión exitoso",
			role: user.role,
			name: user.name,
		});

		console.log("===================================================");
	} catch (error) {
		console.error("Error al iniciar sesión: ", error);

		// Log del error del sistema
		await safeLog(
			"LOGIN",
			"USER",
			`Error del sistema durante intento de inicio de sesión para: ${email || "desconocido"}`,
			{
				email: email || null,
				error: error.message,
				ip: req.ip,
			},
			null,
		);

		res
			.status(500)
			.json({ message: "Error al iniciar sesión", error: error.message });
	}
};

const logoutUser = async (req, res) => {
	try {
		// Extraer el usuario del token antes de limpiar la cookie
		const token =
			req.cookies?.token || req.headers.authorization?.split(" ")[1];
		let userData = null;

		if (token) {
			try {
				userData = jwt.verify(token, process.env.JWT_KEY);
			} catch (err) {
				console.log(
					"[logout] Token inválido o expirado, logout sin log de usuario",
				);
			}
		}

		// Buscar usuario si tenemos datos del token
		let user = null;
		if (userData?.id) {
			user = await Users.findById(userData.id).select(
				"name username email role",
			);
		}

		// Log de cierre de sesión
		if (user) {
			await safeLog(
				"LOGOUT",
				"USER",
				`El usuario ${user.name} (${user.username}) ha cerrado sesión`,
				{
					userId: user._id,
					email: user.email,
					role: user.role,
					username: user.username,
					name: user.name,
					ip: req.ip,
					userAgent: req.headers["user-agent"],
				},
				user._id,
			);
		} else {
			await safeLog(
				"LOGOUT",
				"USER",
				`Cierre de sesión sin identificar usuario`,
				{
					ip: req.ip,
					userAgent: req.headers["user-agent"],
					reason: "Token inválido o expirado",
				},
				null,
			);
		}

		res.clearCookie("token", {
			httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
		});

		res.status(200).json({ message: "Sesión cerrada exitosamente" });
	} catch (error) {
		console.error("Error al cerrar sesión: ", error);

		await safeLog(
			"LOGOUT",
			"USER",
			`Error del sistema durante cierre de sesión`,
			{
				error: error.message,
				ip: req.ip,
			},
			null,
		);

		res
			.status(500)
			.json({ message: "Error al cerrar sesión", error: error.message });
	}
};

module.exports = {
	loginUser,
	logoutUser,
};
