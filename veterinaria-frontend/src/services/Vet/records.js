const BASE_URL = "http://localhost:3050";

const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({
	"Content-Type": "application/json",
	Authorization: `Bearer ${getToken()}`,
});

/**
 * Obtiene una cita por ID
 */
export const getAppointmentById = async (id) => {
	try {
		const response = await fetch(`${BASE_URL}/records/v1/appointment/${id}`, {
			method: "GET",
			credentials: "include",
			headers: getHeaders(),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || "Error al obtener la cita");
		}

		return await response.json();
	} catch (error) {
		console.error("Error en getAppointmentById:", error);
		throw error;
	}
};

/**
 * Inicia una cita (cambia estado a "En progreso")
 */
export const startAppointment = async (id) => {
	try {
		const response = await fetch(
			`${BASE_URL}/records/v1/appointment/${id}/start`,
			{
				method: "PATCH",
				credentials: "include",
				headers: getHeaders(),
			},
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || "Error al iniciar la cita");
		}

		return await response.json();
	} catch (error) {
		console.error("Error en startAppointment:", error);
		throw error;
	}
};

/**
 * Revierte una cita (vuelve a "Aceptada")
 */
export const revertAppointment = async (id) => {
	try {
		const response = await fetch(
			`${BASE_URL}/records/v1/appointment/${id}/revert`,
			{
				method: "PATCH",
				credentials: "include",
				headers: getHeaders(),
			},
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || "Error al revertir la cita");
		}

		return await response.json();
	} catch (error) {
		console.error("Error en revertAppointment:", error);
		throw error;
	}
};

/**
 * Crea un registro médico y finaliza la cita
 */
export const createMedicalRecord = async (recordData) => {
	try {
		const response = await fetch(`${BASE_URL}/records/v1/create`, {
			method: "POST",
			credentials: "include",
			headers: getHeaders(),
			body: JSON.stringify(recordData),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || "Error al crear el registro médico");
		}

		return await response.json();
	} catch (error) {
		console.error("Error en createMedicalRecord:", error);
		throw error;
	}
};
