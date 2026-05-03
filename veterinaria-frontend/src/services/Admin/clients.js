const BASE_URL = "http://localhost:3050";

export const getAllClients = async () => {
	try {
		const response = await fetch(`${BASE_URL}/users/v1/clients`, {
			method: "GET",
			credentials: "include",
		});
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.message || "No se pudo obtener la lista de clientes",
			);
		}
		const data = await response.json();
		return data;
	} catch (error) {
		throw error;
	}
};

export const toggleClientStatus = async (clientId) => {
	try {
		const response = await fetch(`${BASE_URL}/users/v1/clients/${clientId}`, {
			method: "PATCH",
			credentials: "include",
		});
		if (!response.ok) {
			throw new Error("No se pudo cambiar el estado del cliente");
		}
		const data = await response.json();
		return data;
	} catch (error) {
		throw error;
	}
};
