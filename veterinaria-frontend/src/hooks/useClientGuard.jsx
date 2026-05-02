import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getProfile } from "../services/Client/profile.js";

export function useClientGuard() {
	const navigate = useNavigate();
	const [checking, setChecking] = useState(true);
	const [isActive, setIsActive] = useState(true);

	useEffect(() => {
		let cancelled = false;
		async function check() {
			try {
				const data = await getProfile();
				if (!cancelled && data.isActive === false) setIsActive(false);
			} catch {
			} finally {
				if (!cancelled) setChecking(false);
			}
		}
		check();
		return () => {
			cancelled = true;
		};
	}, []);

	const handleLogout = async () => {
		try {
			await fetch("http://localhost:3050/users/v1/logout", {
				method: "POST",
				credentials: "include",
			});
			toast.success("Sesión cerrada correctamente.");
		} catch {
			toast.error("Error al cerrar sesión.");
		} finally {
			localStorage.clear();
			setTimeout(() => navigate("/inicio-sesion"), 1500);
		}
	};

	// Componente de pantalla bloqueada — se renderiza desde la página que lo llama
	function BlockedScreen() {
		if (checking) {
			return (
				<div className="client-page-container">
					<div className="client-loading-screen">
						<p>Cargando...</p>
					</div>
				</div>
			);
		}
		return (
			<div className="client-page-container">
				<div className="client-blocked-screen">
					<div className="client-blocked-card">
						<div className="blocked-icon">🚫</div>
						<h2>Cuenta desactivada</h2>
						<p>
							Tu cuenta ha sido desactivada temporalmente.
							<br />
							No puedes acceder a tus mascotas ni agendar citas en este momento.
						</p>
						<p className="blocked-contact">
							Si crees que esto es un error, comunícate con la clínica para
							recibir más información.
						</p>
						<button className="btn-logout-blocked" onClick={handleLogout}>
							Cerrar sesión
						</button>
					</div>
				</div>
			</div>
		);
	}

	return { checking, isActive, BlockedScreen };
}
