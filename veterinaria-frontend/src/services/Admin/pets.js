const BASE_URL = "http://localhost:3050";

export const getAllPets = async (page = 1, limit = 5) => {
	try {
		const response = await fetch(
			`${BASE_URL}/pets/v1/all?page=${page}&limit=${limit}`,
			{
				method: "GET",
				credentials: "include", // Permite el envío de cookies/token de sesión[cite: 7, 11]
			},
		);

		if (!response.ok) {
			// Intentamos obtener el mensaje de error del backend
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.message || "No se pudo obtener la lista de mascotas",
			);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		throw error;
	}
};

export const togglePetStatus = async (petId) => {
	try {
		const response = await fetch(`${BASE_URL}/pets/v1/${petId}/admin-toggle`, {
			method: "PATCH",
			credentials: "include",
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.message || "No se pudo cambiar el estado de la mascota",
			);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		throw error;
	}
};

export const deletePet = async (petId) => {
	try {
		const response = await fetch(`${BASE_URL}/pets/v1/${petId}`, {
			method: "DELETE",
			credentials: "include",
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.message || "No se pudo eliminar la mascota",
			);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		throw error;
	}
};

