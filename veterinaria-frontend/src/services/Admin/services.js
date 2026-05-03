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
//Obtener todos los servicios
export async function getAllServices() {
	const token = localStorage.getItem("token");

	const response = await fetch(`${BASE_URL}/services/v1/all`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			Authorization: token ? `Bearer ${token}` : "",
		},
	});

	if (!response.ok) {
		const errorData = await response
			.json()
			.catch(() => ({ message: "Error desconocido" }));
		throw new Error(errorData.message || "No se pudieron cargar los servicios");
	}
	return await response.json();
}

//Cambiar estado activo/inactivo
export async function toggleServiceStatus(id) {
	const token = localStorage.getItem("token");

	const response = await fetch(`${BASE_URL}/services/v1/${id}/toggleActive`, {
		method: "PATCH",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			Authorization: token ? `Bearer ${token}` : "",
		},
	});

	if (!response.ok) {
		const errorData = await response
			.json()
			.catch(() => ({ message: "Error desconocido" }));
		throw new Error(errorData.message || "No se pudo cambiar el estado");
	}
	return await response.json();
}

export async function updateService(id, serviceData) {
	const token = localStorage.getItem("token");
	const response = await fetch(`${BASE_URL}/services/v1/${id}`, {
		method: "PATCH",
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
		throw new Error(errorData.message || "No se pudo actualizar el servicio");
	}
	return await response.json();
}

export async function deleteService(id) {
	const token = localStorage.getItem("token");
	const response = await fetch(`${BASE_URL}/services/v1/${id}/delete`, {
		method: "DELETE",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			Authorization: token ? `Bearer ${token}` : "",
		},
	});

	if (!response.ok) {
		const errorData = await response
			.json()
			.catch(() => ({ message: "Error desconocido" }));
		throw new Error(errorData.message || "No se pudo eliminar el servicio");
	}
	return await response.json();
}

