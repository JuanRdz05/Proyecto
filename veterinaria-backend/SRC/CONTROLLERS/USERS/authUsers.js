const Users = require("../../MODELS/users.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { createLog } = require("../../MIDDLEWARES/logs.js");
dotenv.config();

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
		const user = await Users.findOne({ email });

		if (!user) {
			await safeLog(
				"LOGIN",
				"USER",
				`Intento de inicio de sesión fallido`,
				{
					email: email,
					reason: "Usuario no encontrado",
					ip: req.ip,
				},
				null,
			);
			return res.status(401).json({
				message: "La contraseña o el correo electrónico no son correctos",
			});
		}

		const passwordCompare = bcrypt.compareSync(password, user.password);
		if (!passwordCompare) {
			await safeLog(
				"LOGIN",
				"USER",
				`Intento de inicio de sesión fallido`,
				{
					email: email,
					reason: "Contraseña incorrecta",
					ip: req.ip,
				},
				user._id,
			);
			return res.status(401).json({
				message: "La contraseña o el correo electrónico no son correctos",
			});
		}

		if (user.isActive === false) {
			await safeLog(
				"LOGIN",
				"USER",
				`Intento de inicio de sesión bloqueado`,
				{
					userId: user._id,
					email: user.email,
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

		await safeLog(
			"LOGIN",
			"USER",
			`Inicio de sesión exitoso`,
			{
				userId: user._id,
				email: user.email,
				role: user.role,
				username: user.username,
				ip: req.ip,
			},
			user._id,
		);

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
	} catch (error) {
		console.error("Error al iniciar sesión: ", error);
		res
			.status(500)
			.json({ message: "Error al iniciar sesión", error: error.message });
	}
};

const logoutUser = async (req, res) => {
	try {
		const token =
			req.cookies?.token || req.headers.authorization?.split(" ")[1];
		let userData = null;

		if (token) {
			try {
				userData = jwt.verify(token, process.env.JWT_KEY);
			} catch (err) {
				console.log("[logout] Token inválido o expirado");
			}
		}

		let user = null;
		if (userData?.id) {
			user = await Users.findById(userData.id).select(
				"name username email role",
			);
		}

		if (user) {
			await safeLog(
				"LOGOUT",
				"USER",
				`Cierre de sesión`,
				{
					userId: user._id,
					email: user.email,
					role: user.role,
					username: user.username,
					ip: req.ip,
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
		res
			.status(500)
			.json({ message: "Error al cerrar sesión", error: error.message });
	}
};

module.exports = {
	loginUser,
	logoutUser,
};
