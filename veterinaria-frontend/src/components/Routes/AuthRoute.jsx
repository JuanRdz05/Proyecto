import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { BlockedScreen } from "../BlockedScreen/blockedScreen.jsx";

export function AuthRoute() {
	const location = useLocation();
	const [status, setStatus] = useState("loading"); // "loading" | "active" | "inactive" | "guest"

	useEffect(() => {
		fetch("http://localhost:3050/users/v1/profile", {
			credentials: "include",
		})
			.then((res) => {
				if (!res.ok) {
					setStatus("guest");
					return null;
				}
				return res.json();
			})
			.then((data) => {
				if (!data) return;
				if (data.isActive === false) {
					setStatus("inactive");
				} else {
					setStatus("active");
				}
			})
			.catch(() => setStatus("guest"));
	}, []);

	if (status === "loading") return null;
	if (status === "guest") return <Navigate to="/inicio-sesion" replace />;

	// Si está inactivo pero no tiene rol definido explícito, usamos "cliente" o "tu cuenta" por defecto
	if (status === "inactive") return <BlockedScreen role="cliente" />;

	return (
		<AnimatePresence mode="wait">
			<Outlet key={location.pathname} />
		</AnimatePresence>
	);
}
