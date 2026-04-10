// Protege rutas de invitado: consulta el backend con la cookie httpOnly.
// Si el usuario ya tiene sesión activa, lo redirige a su home según rol.
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

export function GuestRoute({ children }) {
    const [status, setStatus] = useState("loading"); // "loading" | "guest" | "client" | "staff"

    useEffect(() => {
        fetch("http://localhost:3050/users/v1/profile", {
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) {
                    setStatus("guest");
                    return;
                }
                return res.json();
            })
            .then((data) => {
                if (!data) return;
                if (data.role === "client") {
                    setStatus("client");
                } else if (data.role === "vet") {
                    setStatus("vet");
                } else if (data.role === "admin") {
                    setStatus("admin");
                }
            })
            .catch(() => setStatus("guest"));
    }, []);

    if (status === "loading") return null;
    if (status === "client") return <Navigate to="/cliente" replace />;
    if (status === "vet") return <Navigate to="/veterinario" replace />;
    if (status === "admin") return <Navigate to="/admin/home" replace />;

    return children;
}
