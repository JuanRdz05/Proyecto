import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { BlockedScreen } from "../BlockedScreen/blockedScreen.jsx";

export function ClientRoute() {
	const location = useLocation();
	const [status, setStatus] = useState("loading"); // "loading" | "active" | "inactive" | "other" | "guest"

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
				if (data.role === "client") {
					if (data.isActive === false) {
						setStatus("inactive");
					} else {
						setStatus("active");
					}
				} else {
					setStatus("other");
				}
			})
			.catch(() => setStatus("guest"));
	}, []);

	if (status === "loading") return null; // Espera sin mostrar nada
	if (status === "guest") return <Navigate to="/inicio-sesion" replace />;
	if (status === "other") return <Navigate to="/" replace />;
	
	if (status === "inactive") return <BlockedScreen role="cliente" />;

	return (
		<AnimatePresence mode="wait">
			<Outlet key={location.pathname} />
		</AnimatePresence>
	);
}
