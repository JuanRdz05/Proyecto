const Users = require("../../MODELS/users.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
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
			{
				expiresIn: "1h",
			},
		);
		//Enviamos el token
		console.log("===================================================");
		console.log("Iniciando sesión...");
		res.status(200).json({ message: "Inicio de sesión exitoso", token });
		console.log("===================================================");
		console.log("¡Bienvenido " + user.name + "!");
	} catch (error) {
		console.error("Error al registrar el usuario: ", error);
		res.status(500).json({ message: "Error al registrar el usuario", error });
	}
};

module.exports = {
	loginUser,
};
