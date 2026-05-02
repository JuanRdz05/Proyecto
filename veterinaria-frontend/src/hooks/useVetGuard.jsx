import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getProfile } from "../services/Client/profile.js";

export function useVetGuard() {
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
				console.error("Error al verificar estado del veterinario:", error);
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
				<div className="vet-page-container">
					<div className="vet-loading-screen">
						<p>Verificando tu estado...</p>
					</div>
				</div>
			);
		}

		return (
			<div className="vet-page-container">
				<div className="vet-blocked-screen">
					<div className="vet-blocked-card">
						<div className="blocked-icon">🚫</div>
						<h2>Cuenta desactivada</h2>
						<p>
							Tu cuenta ha sido desactivada por un administrador.
							<br />
							No puedes acceder al sistema en este momento.
						</p>
						<p className="blocked-contact">
							Si crees que esto es un error, contacta al administrador del
							sistema.
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
