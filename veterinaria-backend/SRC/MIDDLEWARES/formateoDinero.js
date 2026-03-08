const formatoDinero = (req, res, next) => {
	try {
		res.dineroFormateado = (numero) => {
			if (typeof numero !== "number") return numero;
			return new Intl.NumberFormat("es-MX", {
				style: "currency",
				currency: "MXN",
			}).format(numero);
		};
		next();
	} catch (error) {
		if (error instanceof TypeError) {
			console.error("Error al formatear el dinero: ", error);
			res.status(500).json({ message: "Error al formatear el dinero", error });
		}
	}
};

module.exports = {
	formatoDinero,
};
