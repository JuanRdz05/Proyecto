// Protege rutas de clientes: consulta el backend con la cookie httpOnly.
// Solo permite acceso si el token es válido Y el rol es 'client'.
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

export function ClientRoute({ children }) {
    const [status, setStatus] = useState("loading"); // "loading" | "client" | "other" | "guest"

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
                } else {
                    setStatus("other");
                }
            })
            .catch(() => setStatus("guest"));
    }, []);

    if (status === "loading") return null; // Espera sin mostrar nada
    if (status === "guest") return <Navigate to="/inicio-sesion" replace />;
    if (status === "other") return <Navigate to="/" replace />;

    return children;
}
