const BASE_ULR = "http://localhost:3050";

export const loginUser = async (email, password) => {
	try {
		const response = await fetch(`${BASE_ULR}/users/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		});
		if (!response.ok) {
			throw new Error("Error al iniciar sesión");
		}
		return await response.json();
	} catch (error) {
		console.error("Error al conectar con la API: ", error);
		throw error;
	}
};
