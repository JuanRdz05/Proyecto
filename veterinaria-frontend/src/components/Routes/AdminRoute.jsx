// Guard que protege rutas exclusivas de administradores.
// Consulta el backend con la cookie httpOnly para verificar que role === 'admin'.
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

export function AdminRoute({ children }) {
    const [status, setStatus] = useState("loading"); // "loading" | "admin" | "other" | "guest"

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
                if (data.role === "admin") {
                    setStatus("admin");
                } else {
                    setStatus("other");
                }
            })
            .catch(() => setStatus("guest"));
    }, []);

    if (status === "loading") return null;
    if (status === "guest") return <Navigate to="/inicio-sesion" replace />;
    if (status === "other") return <Navigate to="/" replace />;

    return children;
}
