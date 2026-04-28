const Users = require("../../MODELS/users.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { createLog } = require("../../MIDDLEWARES/logs.js");
dotenv.config();

const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;
		console.log("===================================================");
		console.log("Buscando usuario...");
		//Buscamos el usuario por el email
		const user = await Users.findOne({ email });
		if (!user) {
			console.log("===================================================");
			console.log("Usuario no encontrado");
			return res.status(401).json({
				message: "La contraseña o el correo electrónico no son correctos",
			});
		}
		//Comparar la contraseña
		const passwordCompare = bcrypt.compareSync(password, user.password);
		if (!passwordCompare) {
			console.log("===================================================");
			console.log("La contraseña o el correo electrónico no son correctos");
			return res.status(401).json({
				message: "La contraseña o el correo electrónico no son correctos",
			});
		}
		//Si todo sale bien, generamos el token jwt
		const token = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_KEY,
			{ expiresIn: "1h" }
		);
		
		//Guardamos el log
		if (user.role === "vet" || user.role === "admin") {
			await createLog(
				"LOGIN",
				"USER",
				`El usuario ${user.name} ha iniciado sesión`,
				{
					email: user.email,
					role: user.role,
					username: user.username,
				},
				user._id,
			);
		}
		console.log("===================================================");
		console.log("Iniciando sesión...");
		// cookie
        res.cookie("token", token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: "strict", 
            maxAge: 3600000 
        });

		res.status(200).json({ 
            message: "Inicio de sesión exitoso",
            role: user.role,
            name: user.name
        });
		console.log("===================================================");
		
	} catch (error) {
		console.error("Error al registrar el usuario: ", error);
		res.status(500).json({ message: "Error al registrar el usuario", error });
	}
};

const logoutUser = (req, res) => {
	res.clearCookie("token", {
		httpOnly: true,
		sameSite: "strict",
		secure: process.env.NODE_ENV === "production",
	});
	res.status(200).json({ message: "Sesión cerrada exitosamente" });
};

module.exports = {
	loginUser,
	logoutUser,
};
