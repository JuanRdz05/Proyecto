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
