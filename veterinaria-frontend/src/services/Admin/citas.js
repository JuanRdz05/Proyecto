const BASE_URL = "http://localhost:3050";

// Helper para obtener el token
const getToken = () => localStorage.getItem("token");

// Helper para headers comunes
const getHeaders = () => ({
	"Content-Type": "application/json",
	Authorization: `Bearer ${getToken()}`,
});

/**
 * Obtiene todas las citas (solo admin)
 */
export const getAllAppointments = async () => {
	try {
		const response = await fetch(`${BASE_URL}/appointments/v1/all`, {
			method: "GET",
			credentials: "include",
			headers: getHeaders(),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || "Error al obtener las citas");
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error en getAllAppointments:", error);
		throw error;
	}
};

/**
 * Acepta una cita (cambia estado a "Aceptada")
 * @param {string} appointmentId - ID de la cita
 * @param {string} vetId - ID del veterinario asignado (opcional por ahora)
 */
export const acceptAppointment = async (appointmentId, vetId = null) => {
	try {
		const response = await fetch(
			`${BASE_URL}/appointments/v1/accept/${appointmentId}`,
			{
				method: "PATCH",
				credentials: "include",
				headers: getHeaders(),
				body: JSON.stringify({ vetId }),
			},
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || "Error al aceptar la cita");
		}

		return await response.json();
	} catch (error) {
		console.error("Error en acceptAppointment:", error);
		throw error;
	}
};

/**
 * Rechaza una cita (cambia estado a "Rechazada")
 * @param {string} appointmentId - ID de la cita
 * @param {string} rejectionReason - Motivo del rechazo (opcional por ahora)
 */
export const rejectAppointment = async (
	appointmentId,
	rejectionReason = "",
) => {
	try {
		const response = await fetch(
			`${BASE_URL}/appointments/v1/reject/${appointmentId}`,
			{
				method: "PATCH",
				credentials: "include",
				headers: getHeaders(),
				body: JSON.stringify({ rejectionReason }),
			},
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || "Error al rechazar la cita");
		}

		return await response.json();
	} catch (error) {
		console.error("Error en rejectAppointment:", error);
		throw error;
	}
};
