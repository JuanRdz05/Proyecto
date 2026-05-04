const BASE_ULR = "http://localhost:3050";

export const loginUser = async (email, password) => {
	try {
		const response = await fetch(`${BASE_ULR}/users/v1/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
            //Permite que el navegador reciba y envíe la cookie
            credentials: "include" 
		});
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || "Error al iniciar sesión");
		}
		return await response.json();
	} catch (error) {
		console.error("Error al conectar con la API: ", error);
		throw error;
	}
};