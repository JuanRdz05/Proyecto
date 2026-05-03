import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

export function GuestRoute() {
	const location = useLocation();
	const [status, setStatus] = useState("loading"); // "loading" | "guest" | "client" | "vet" | "admin"

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
	if (status === "admin") return <Navigate to="/admin/citas" replace />;

	return (
		<AnimatePresence mode="wait">
			<Outlet key={location.pathname} />
		</AnimatePresence>
	);
}
