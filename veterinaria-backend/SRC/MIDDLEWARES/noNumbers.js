//Función para validar que un campo no contenga números
const noNumbers = (fields) => {
	return (req, res, next) => {
		for (const field of fields) {
			const value = req.body[field];
			if (value && /[0-9!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~]/.test(value)) {
				return res.status(400).json({
					message: `El campo ${field} no puede contener números ni simbolos especiales`,
				});
			}
		}
		next();
	};
};
module.exports = {
	noNumbers,
};
