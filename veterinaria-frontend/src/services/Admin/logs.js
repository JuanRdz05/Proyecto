const BASE_URL = "http://localhost:3050";

/**
 * Obtiene logs con filtros, búsqueda y paginación
 * @param {Object} params - Parámetros de consulta
 * @param {string} params.action - Filtrar por acción (TODAS, CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
 * @param {string} params.search - Texto de búsqueda
 * @param {number} params.page - Número de página
 * @param {number} params.limit - Logs por página
 * @returns {Promise<{logs: Array, pagination: Object}>}
 */
export async function getAllLogs({
	action = "TODAS",
	search = "",
	page = 1,
	limit = 10,
} = {}) {
	const token = localStorage.getItem("token");

	// Construir query params
	const queryParams = new URLSearchParams();
	if (action && action !== "TODAS") queryParams.append("action", action);
	if (search && search.trim()) queryParams.append("search", search.trim());
	queryParams.append("page", page.toString());
	queryParams.append("limit", limit.toString());

	const response = await fetch(
		`${BASE_URL}/logs/v1/all?${queryParams.toString()}`,
		{
			method: "GET",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				Authorization: token ? `Bearer ${token}` : "",
			},
		},
	);

	if (!response.ok) {
		const errorData = await response
			.json()
			.catch(() => ({ message: "Error desconocido" }));
		throw new Error(errorData.message || "No se pudieron cargar los logs");
	}

	return await response.json();
}
