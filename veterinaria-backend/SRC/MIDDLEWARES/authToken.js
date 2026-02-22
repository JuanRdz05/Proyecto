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

module.exports = {
	verificarToken,
};
