// Guard que protege rutas exclusivas de veterinarios.
// Consulta el backend con la cookie httpOnly para verificar que role === 'vet'.
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

export function VetRoute({ children }) {
    const [status, setStatus] = useState("loading"); // "loading" | "vet" | "other" | "guest"

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
                if (data.role === "vet") {
                    setStatus("vet");
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
