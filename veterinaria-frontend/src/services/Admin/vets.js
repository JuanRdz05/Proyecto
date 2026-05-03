const BASE_URL = "http://localhost:3050";

export const getAllVets = async () => {
	const response = await fetch(`${BASE_URL}/users/v1/vets`, {
		method: "GET",
		credentials: "include",
	});
	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "No se pudieron cargar los veterinarios");
	}
	return await response.json();
};

export const toggleVetStatus = async (id) => {
	const response = await fetch(`${BASE_URL}/users/v1/vets/${id}`, {
		method: "PATCH",
		credentials: "include",
	});
	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "No se pudo cambiar el estado");
	}
	return await response.json();
};
