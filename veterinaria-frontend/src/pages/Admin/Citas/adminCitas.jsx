import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import { getProfile } from "../../../services/Client/profile.js";
import "./adminCitas.css";

// Datos placeholder — se conectará al backend más adelante
const ALL_APPOINTMENTS = [
	{
		id: 1,
		pet: "Max",
		owner: "Juan Pérez",
		service: "Vacunación",
		datetime: "2024-01-15 10:00",
		status: "Pendiente",
	},
	{
		id: 2,
		pet: "Rocky",
		owner: "Carlos López",
		service: "Cirugía menor",
		datetime: "2024-01-15 14:00",
		status: "Pendiente",
	},
	{
		id: 3,
		pet: "Toby",
		owner: "Pedro Sánchez",
		service: "Revisión anual",
		datetime: "2024-01-16 16:30",
		status: "Pendiente",
	},
	{
		id: 4,
		pet: "Bella",
		owner: "Ana Martínez",
		service: "Consulta",
		datetime: "2024-01-17 09:00",
		status: "Aceptada",
	},
	{
		id: 5,
		pet: "Luna",
		owner: "Laura Vega",
		service: "Desparasitación",
		datetime: "2024-01-18 11:00",
		status: "Cancelada",
	},
];

const STATUS_CONFIG = {
	Pendiente: { label: "Pendiente", cls: "status-pendiente" },
	Aceptada: { label: "Aceptada", cls: "status-aceptada" },
	Cancelada: { label: "Cancelada", cls: "status-cancelada" },
	Rechazada: { label: "Rechazada", cls: "status-rechazada" },
};

export function AdminCitas() {
	const navigate = useNavigate();
	const [filter, setFilter] = useState("Pendientes"); // "Pendientes" | "Todas"

	// Estados para la validación de la cuenta
	const [isActive, setIsActive] = useState(true);
	const [checking, setChecking] = useState(true);

	// Verificar estado del administrador al cargar
	useEffect(() => {
		const checkStatus = async () => {
			try {
				const data = await getProfile();
				if (data.isActive === false) {
					setIsActive(false);
				}
			} catch (error) {
				console.error("Error al verificar estado:", error);
				toast.error("Error al verificar tu estado.", {
					position: "top-right",
					autoClose: 4000,
				});
			} finally {
				setChecking(false);
			}
		};
		checkStatus();
	}, []);

	const handleLogout = async () => {
		try {
			await fetch("http://localhost:3050/users/v1/logout", {
				method: "POST",
				credentials: "include",
			});
			toast.success("Sesión cerrada correctamente.");
		} catch (e) {
			toast.error("Error al cerrar sesión.");
		} finally {
			localStorage.clear();
			setTimeout(() => {
				navigate("/inicio-sesion");
			}, 1500);
		}
	};

	const visibleCitas =
		filter === "Pendientes"
			? ALL_APPOINTMENTS.filter((c) => c.status === "Pendiente")
			: ALL_APPOINTMENTS;

	const handleAceptar = (id) => {
		// TODO: llamar al backend para aceptar
		console.log("Aceptar cita:", id);
	};

	const handleRechazar = (id) => {
		// TODO: llamar al backend para rechazar
		console.log("Rechazar cita:", id);
	};

	// Mostrar loading mientras verifica
	if (checking) {
		return (
			<div className="admin-citas-container">
				<div className="admin-loading-screen">
					<p>Verificando tu estado...</p>
				</div>
			</div>
		);
	}

	// Si el admin está inactivo, mostrar pantalla de bloqueo
	if (!isActive) {
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

	return (
		<div className="admin-citas-container">
			<NavbarAdmin />

			<main className="admin-citas-main">
				<h1 className="admin-citas-title">Citas por aprobar</h1>

				{/* Subtítulo + filtros */}
				<div className="admin-citas-subheader">
					<p className="admin-citas-subtitle">Próximas citas</p>

					<div className="filter-group">
						<button
							className={`btn-filter ${filter === "Pendientes" ? "active" : ""}`}
							onClick={() => setFilter("Pendientes")}
						>
							<span className="filter-dot">●</span> Pendientes
						</button>
						<button
							className={`btn-filter ${filter === "Todas" ? "active" : ""}`}
							onClick={() => setFilter("Todas")}
						>
							Todas
						</button>
					</div>
				</div>

				{/* Tabla */}
				<div className="admin-citas-table-wrapper">
					<table className="admin-citas-table">
						<thead>
							<tr>
								<th>Paciente</th>
								<th>Dueño</th>
								<th>Servicio</th>
								<th>Fecha y hora</th>
								<th>Estado</th>
								<th>Acciones</th>
							</tr>
						</thead>
						<tbody>
							{visibleCitas.length === 0 ? (
								<tr>
									<td colSpan={6} className="empty-row">
										No hay citas que mostrar.
									</td>
								</tr>
							) : (
								visibleCitas.map((cita) => {
									const cfg = STATUS_CONFIG[cita.status] || {
										label: cita.status,
										cls: "status-pendiente",
									};
									return (
										<tr key={cita.id}>
											<td className="col-pet">
												<strong>{cita.pet}</strong>
											</td>
											<td className="col-owner">{cita.owner}</td>
											<td className="col-service">{cita.service}</td>
											<td className="col-datetime">{cita.datetime}</td>
											<td className="col-status">
												<span className={`cita-status-badge ${cfg.cls}`}>
													{cfg.label}
												</span>
											</td>
											<td className="col-actions">
												<button
													className="btn-action btn-aceptar"
													onClick={() => handleAceptar(cita.id)}
													title="Aceptar cita"
												>
													✓
												</button>
												<button
													className="btn-action btn-rechazar"
													onClick={() => handleRechazar(cita.id)}
													title="Rechazar cita"
												>
													✕
												</button>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</main>

			<FooterGuest />
		</div>
	);
}
