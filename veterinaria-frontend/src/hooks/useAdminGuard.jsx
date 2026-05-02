import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getProfile } from "../services/Client/profile.js"; // El mismo que usa el cliente

export function useAdminGuard() {
	const navigate = useNavigate();
	const [checking, setChecking] = useState(true);
	const [isActive, setIsActive] = useState(true);

	useEffect(() => {
		let cancelled = false;
		async function check() {
			try {
				const data = await getProfile();
				if (!cancelled && data.isActive === false) {
					setIsActive(false);
				}
			} catch (error) {
				console.error("Error al verificar estado del admin:", error);
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

	function BlockedScreen() {
		if (checking) {
			return (
				<div className="admin-citas-container">
					<div className="admin-loading-screen">
						<p>Verificando tu estado...</p>
					</div>
				</div>
			);
		}

		return (
			<div className="admin-citas-container">
				<div className="admin-blocked-screen">
					<div className="admin-blocked-card">
						<div className="blocked-icon">🚫</div>
						<h2>Cuenta desactivada</h2>
						<p>
							Tu cuenta de administrador ha sido desactivada.
							<br />
							No puedes acceder al panel en este momento.
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
