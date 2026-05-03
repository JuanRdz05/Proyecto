const BASE_URL = "http://localhost:3050";

export const addPet = async (petData) => {
	const response = await fetch(`${BASE_URL}/pets/v1/add`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(petData),
	});
	if (!response.ok) {
		throw new Error("No se pudo agregar la mascota");
	}
	return await response.json();
};

export const getPets = async () => {
	const response = await fetch(`${BASE_URL}/pets/v1/get-user-pets`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("No se pudieron cargar las mascotas");
	}
	return await response.json();
};

//Obtener la mascota por ID
export const getPetById = async (id) => {
	const response = await fetch(`${BASE_URL}/pets/v1/${id}`, {
		method: "GET",
		credentials: "include",
	});
	if (!response.ok) {
		throw new Error("No se pudo obtener la mascota");
	}
	return await response.json();
};

//Modificar mascota
export const updatePet = async (id, petData) => {
	const response = await fetch(`${BASE_URL}/pets/v1/${id}`, {
		method: "PATCH",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(petData),
	});
	if (!response.ok) {
		throw new Error("No se pudo actualizar la mascota");
	}
	return await response.json();
};

// Función para activar/desactivar la mascota
export const togglePetStatus = async (id) => {
	const response = await fetch(`${BASE_URL}/pets/v1/${id}/toggleActive`, {
		method: "PATCH",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) {
		throw new Error("No se pudo cambiar el estado de la mascota");
	}
	return await response.json();
};

// Función para eliminar la mascota permanentemente
export const deletePet = async (id) => {
	const response = await fetch(`${BASE_URL}/pets/v1/${id}`, {
		method: "DELETE",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || "No se pudo eliminar la mascota");
	}
	return await response.json();
};

