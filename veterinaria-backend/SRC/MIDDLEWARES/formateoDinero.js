const formatoDinero = (numero) => {
	if (typeof numero !== "number" || isNaN(numero)) {
		return "$0.00";
	}
	return new Intl.NumberFormat("es-MX", {
		style: "currency",
		currency: "MXN",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(numero);
};

module.exports = { formatoDinero };
