import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./blockedScreen.css";

export function BlockedScreen({ role = "cliente" }) {
	const navigate = useNavigate();

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

	const getRoleText = () => {
		if (role === "admin") {
			return "Tu cuenta de administrador ha sido desactivada. No puedes acceder al panel en este momento.";
		}
		if (role === "vet") {
			return "Tu cuenta de veterinario ha sido desactivada. No puedes acceder al sistema en este momento.";
		}
		return "Tu cuenta ha sido desactivada temporalmente. No puedes acceder a tus mascotas ni agendar citas en este momento.";
	};

	return (
		<div className="blocked-screen-container">
			<div className="blocked-screen-overlay">
				<div className="blocked-card">
					<div className="blocked-icon">🚫</div>
					<h2>Cuenta desactivada</h2>
					<p>{getRoleText()}</p>
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
