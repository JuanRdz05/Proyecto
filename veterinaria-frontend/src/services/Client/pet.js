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
