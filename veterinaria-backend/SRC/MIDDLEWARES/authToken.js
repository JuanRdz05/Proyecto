const verificarToken = async (req, res, next) => {
	const token = req.cookies.token; 

	if (!token) {
		return res.status(401).json({ message: "Acceso no autorizado" });
	}
	try {
		//Verificar el token
		const tokenDecoded = jwt.verify(token, process.env.JWT_KEY);
		req.user = tokenDecoded;
		next();
	} catch (error) {
		return res.status(401).json({ message: "Token invalido o expirado" });
	}
};

const authRole = (adminRol) => {
	return async (req, res, next) => {
		try {
			const token = req.cookies.token;

			if (!token) {
				return res.status(401).json({ message: "No tiene permiso de acceso a esta area" });
			}
            
			const decoded = jwt.verify(token, process.env.JWT_KEY);
			req.user = decoded;
            
			// ... (la lógica de verificación de rol se queda exactamente igual)
			if (decoded.role !== adminRol) {
				return res.status(401).json({ message: "No tiene permiso de acceso a esta area" });
			}
			next();
		} catch (error) {
			console.error("Error al autenticar al usuario: ", error);
			res.status(500).json({ message: "Error al autenticar al usuario", error });
		}
	};
};

module.exports = { verificarToken, authRole };