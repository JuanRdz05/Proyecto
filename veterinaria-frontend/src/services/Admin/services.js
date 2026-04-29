const BASE_URL = "http://localhost:3050";

export async function addService(serviceData) {
	const token = localStorage.getItem("token");

	const response = await fetch(`${BASE_URL}/services/v1/create`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			Authorization: token ? `Bearer ${token}` : "",
		},
		body: JSON.stringify(serviceData),
	});

	if (!response.ok) {
		const errorData = await response
			.json()
			.catch(() => ({ message: "Error desconocido" }));
		throw new Error(errorData.message || "No se pudo agregar el servicio");
	}

	return await response.json();
}
