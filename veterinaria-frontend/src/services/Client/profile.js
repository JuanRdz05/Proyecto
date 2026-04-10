const BASE_URL = "http://localhost:3050";

export const getProfile = async () => {
    const response = await fetch(`${BASE_URL}/users/v1/profile`, {
        method: "GET",
        credentials: "include", // Envía la cookie del token
    });
    if (!response.ok) {
        throw new Error("No se pudo obtener el perfil");
    }
    return await response.json();
};

export const logoutUser = async () => {
    const response = await fetch(`${BASE_URL}/users/v1/logout`, {
        method: "POST",
        credentials: "include",
    });
    return response;
};
