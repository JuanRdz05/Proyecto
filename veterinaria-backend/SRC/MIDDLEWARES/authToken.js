const jwt = require("jsonwebtoken");

const verificarToken = async (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (!token) {
		return res.status(401).json({ message: "Acceso no autorizado" });
	}
	try {
		//Verificar el token
		const tokenDecoded = jwt.verify(token, process.env.JWT_KEY);
		//Le pasamos el token al usuario que hizo la pateición
		req.user = tokenDecoded;
		next();
	} catch (error) {
		return res.status(401).json({ message: "Token invalido o expirado" });
	}
};

const authRole = (adminRol) => {
	return async (req, res, next) => {
		try {
			//Autenticamos el token
			console.log("===================================================");
			console.log("Comenzando procesos de autenticación...");
			const authHeader = req.headers.authorization;
			if (!authHeader) {
				console.log("===================================================");
				console.log("No tiene permiso de acceso a esta area");
				return res
					.status(401)
					.json({ message: "No tiene permiso de acceso a esta area" });
			}
			//Limpiar el token
			const token = authHeader.split(" ")[1];
			const decoded = jwt.verify(token, process.env.JWT_KEY);
			req.user = decoded;
			console.log("===================================================");
			console.log("Rol del usuario: ", decoded.role);
			console.log("Rol requerido: ", adminRol);
			//Verificar el rol del usuario
			if (decoded.role !== adminRol) {
				console.log("===================================================");
				console.log("No tiene permiso de acceso a esta area");
				return res
					.status(401)
					.json({ message: "No tiene permiso de acceso a esta area" });
			}
			console.log("===================================================");
			console.log("Acceso concedido");
			next();
		} catch (error) {
			console.error("Error al autenticar al usuario: ", error);
			res
				.status(500)
				.json({ message: "Error al autenticar al usuario", error });
		}
	};
};

module.exports = {
	verificarToken,
	authRole,
};
