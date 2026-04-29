const BASE_URL = "http://localhost:3050";

/**
 * Crea una nueva cita/appointment
 * @param {Object} appointmentData - Datos de la cita
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const createAppointment = async (appointmentData) => {
	const token = localStorage.getItem("token");

	const response = await fetch(`${BASE_URL}/appointments/v1/create`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			Authorization: token ? `Bearer ${token}` : "",
		},
		body: JSON.stringify(appointmentData),
	});

	if (!response.ok) {
		const errorData = await response
			.json()
			.catch(() => ({ message: "Error desconocido" }));
		throw new Error(errorData.message || "No se pudo agendar la cita");
	}

	return await response.json();
};
