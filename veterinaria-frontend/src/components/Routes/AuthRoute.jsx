// Protege rutas accesibles para cualquier usuario autenticado (client, vet, admin).
// Si no hay sesión válida, redirige al login.
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

export function AuthRoute({ children }) {
    const [status, setStatus] = useState("loading"); // "loading" | "ok" | "guest"

    useEffect(() => {
        fetch("http://localhost:3050/users/v1/profile", {
            credentials: "include",
        })
            .then((res) => {
                setStatus(res.ok ? "ok" : "guest");
            })
            .catch(() => setStatus("guest"));
    }, []);

    if (status === "loading") return null;
    if (status === "guest") return <Navigate to="/inicio-sesion" replace />;

    return children;
}
