const BASE_URL = "http://localhost:3050";

export const getProfile = async () => {
	const response = await fetch(`${BASE_URL}/users/v1/profile`, {
		method: "GET",
		credentials: "include",
	});
	if (!response.ok) {
		throw new Error("No se pudo obtener el perfil");
	}
	const data = await response.json();

	// Convierte rutas relativas a URLs completas
	if (data.profilePicture && data.profilePicture.startsWith("/")) {
		data.profilePicture = `${BASE_URL}${data.profilePicture}`;
	}

	return data;
};

export const logoutUser = async () => {
	const response = await fetch(`${BASE_URL}/users/v1/logout`, {
		method: "POST",
		credentials: "include",
	});
	return response;
};

export const updateProfileData = async (profileData) => {
	try {
		const formData = new FormData();

		if (profileData.name) formData.append("name", profileData.name);
		if (profileData.paternalLastName)
			formData.append("paternalLastName", profileData.paternalLastName);
		if (profileData.maternalLastName)
			formData.append("maternalLastName", profileData.maternalLastName);
		if (profileData.email) formData.append("email", profileData.email);

		if (profileData.profilePicture instanceof File) {
			formData.append("profilePicture", profileData.profilePicture);
		}

		const response = await fetch(`${BASE_URL}/users/v1/profile`, {
			method: "PATCH",
			credentials: "include",
			body: formData,
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || "Error al actualizar el perfil");
		}

		if (
			data.user &&
			data.user.profilePicture &&
			data.user.profilePicture.startsWith("/")
		) {
			data.user.profilePicture = `${BASE_URL}${data.user.profilePicture}`;
		}

		return data;
	} catch (error) {
		throw error;
	}
};
