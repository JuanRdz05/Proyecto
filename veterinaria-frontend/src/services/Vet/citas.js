const BASE_URL = "http://localhost:3050";

const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({
	"Content-Type": "application/json",
	Authorization: `Bearer ${getToken()}`,
});

/**
 * Obtiene las citas asignadas al veterinario para el día actual
 */
export const getVetAppointmentsToday = async () => {
	try {
		const response = await fetch(`${BASE_URL}/appointments/v1/vet/today`, {
			method: "GET",
			credentials: "include",
			headers: getHeaders(),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || "Error al obtener las citas");
		}

		return await response.json();
	} catch (error) {
		console.error("Error en getVetAppointmentsToday:", error);
		throw error;
	}
};
