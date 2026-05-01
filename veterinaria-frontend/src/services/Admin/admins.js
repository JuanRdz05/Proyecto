const BASE_URL = "http://localhost:3050";

export const getAllAdmins = async () => {
	const response = await fetch(`${BASE_URL}/users/v1/admins`, {
		method: "GET",
		credentials: "include",
	});
	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			error.message || "No se pudieron cargar los administradores",
		);
	}
	return await response.json();
};

export const toggleAdminStatus = async (id) => {
	const response = await fetch(`${BASE_URL}/users/v1/admins/${id}`, {
		method: "PATCH",
		credentials: "include",
	});
	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "No se pudo cambiar el estado");
	}
	return await response.json();
};
