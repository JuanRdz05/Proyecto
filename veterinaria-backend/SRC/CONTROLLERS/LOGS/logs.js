const Logs = require("../../MODELS/logs.js");

// Función para obtener logs con filtros, búsqueda y paginación
const getAllLogs = async (req, res) => {
	try {
		const {
			action, // Filtrar por acción: CREATE, UPDATE, DELETE, LOGIN, LOGOUT
			search, // Búsqueda en descripción o nombre de usuario
			page = 1, // Página actual (default 1)
			limit = 10, // Logs por página (default 10)
		} = req.query;

		// Construir el filtro base
		let query = {};

		// Filtro por acción
		if (
			action &&
			action !== "TODAS" &&
			["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"].includes(action)
		) {
			query.action = action;
		}

		// Búsqueda por texto en descripción
		if (search && search.trim() !== "") {
			query.description = { $regex: search.trim(), $options: "i" };
		}

		// Calcular skip para paginación
		const pageNum = Math.max(1, parseInt(page));
		const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Máximo 50 por página
		const skip = (pageNum - 1) * limitNum;

		// Obtener logs paginados con populate del usuario
		const [logs, totalCount] = await Promise.all([
			Logs.find(query)
				.populate("user", "name role")
				.sort({ createdAt: -1 }) // Más recientes primero
				.skip(skip)
				.limit(limitNum)
				.lean(),
			Logs.countDocuments(query),
		]);

		const totalPages = Math.ceil(totalCount / limitNum);

		console.log("===================================================");
		console.log(`Mostrando logs - Página ${pageNum} de ${totalPages}`);
		console.log(
			`Filtros: action=${action || "TODAS"}, search=${search || "ninguna"}`,
		);
		console.log(`Total logs: ${totalCount}`);

		if (logs.length === 0) {
			return res.status(200).json({
				message: "No hay logs que mostrar",
				logs: [],
				pagination: {
					currentPage: pageNum,
					totalPages: 0,
					totalCount: 0,
					hasNextPage: false,
					hasPrevPage: false,
				},
			});
		}

		res.status(200).json({
			message: "Logs encontrados",
			logs,
			pagination: {
				currentPage: pageNum,
				totalPages,
				totalCount,
				hasNextPage: pageNum < totalPages,
				hasPrevPage: pageNum > 1,
				limit: limitNum,
			},
		});
	} catch (error) {
		console.error("Error al obtener los logs: ", error);
		res
			.status(500)
			.json({ message: "Error al obtener los logs", error: error.message });
	}
};

module.exports = {
	getAllLogs,
};
