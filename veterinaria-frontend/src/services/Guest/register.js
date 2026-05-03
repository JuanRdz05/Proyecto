// src/services/Guest/register.js

const BASE_URL = "http://localhost:3050/users/v1";

/**
 * Registra un nuevo usuario con rol de cliente.
 * @param {FormData} formData - Objeto FormData que contiene texto y (opcionalmente) la foto
 */
export const registerClient = async (formData) => {
	try {
		// En lugar de hacer un "spread" (...), agregamos el rol directamente al objeto FormData
		formData.append("role", "client");

		const response = await fetch(`${BASE_URL}/register`, {
			method: "POST",
			// ⚠️ IMPORTANTE:
			// Eliminamos la cabecera "Content-Type": "application/json".
			// Al enviar un FormData (con fotos), el navegador detecta esto automáticamente
			// y pone el Content-Type correcto ("multipart/form-data") con sus fronteras.
			body: formData,
		});

		// Manejo de errores detallado
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			// Esto nos imprimirá en la consola exactamente qué le dolió al backend
			console.error("Detalle del error del backend:", errorData);
			throw new Error(errorData.message || "Error al registrar el usuario");
		}

		return await response.json();
	} catch (error) {
		console.error("Error en userService (register):", error);
		throw error;
	}
};

export const registerUser = async (formData) => {
	try {
		// ✅ NO tocamos el FormData, lo enviamos tal cual viene
		const response = await fetch(`${BASE_URL}/register`, {
			method: "POST",
			credentials: "include",
			body: formData,
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error("Detalle del error del backend:", errorData);
			throw new Error(errorData.message || "Error al registrar el usuario");
		}

		return await response.json();
	} catch (error) {
		console.error("Error en registerUser:", error);
		throw error;
	}
};

export const getUserProfile = async (token) => {
	try {
		const response = await fetch(`${BASE_URL}/profile`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) throw new Error("No se pudo obtener el perfil");
		return await response.json();
	} catch (error) {
		console.error("Error en userService (getProfile):", error);
		throw error;
	}
};
