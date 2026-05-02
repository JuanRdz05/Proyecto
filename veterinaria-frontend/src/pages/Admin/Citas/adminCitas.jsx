import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import { getProfile } from "../../../services/Client/profile.js";
import {
	getAllAppointments,
	acceptAppointment,
	rejectAppointment,
} from "../../../services/Admin/citas.js";
import "./adminCitas.css";

const STATUS_CONFIG = {
	Pendiente: { label: "Pendiente", cls: "status-pendiente" },
	Aceptada: { label: "Aceptada", cls: "status-aceptada" },
	Rechazada: { label: "Rechazada", cls: "status-rechazada" },
	"En progreso": { label: "En progreso", cls: "status-progreso" },
	Cancelada: { label: "Cancelada", cls: "status-cancelada" },
	Terminada: { label: "Terminada", cls: "status-terminada" },
};

export function AdminCitas() {
	const navigate = useNavigate();

	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [filter, setFilter] = useState("Pendientes");
	const [processingId, setProcessingId] = useState(null);
	const [isActive, setIsActive] = useState(true);
	const [checking, setChecking] = useState(true);

	// Verificar estado del admin
	useEffect(() => {
		const checkStatus = async () => {
			try {
				const data = await getProfile();
				if (data.isActive === false) setIsActive(false);
			} catch (error) {
				console.error("Error al verificar estado:", error);
				toast.error("Error al verificar tu estado.", { autoClose: 4000 });
			} finally {
				setChecking(false);
			}
		};
		checkStatus();
	}, []);

	const fetchAppointments = async (showRefreshing = false) => {
		if (showRefreshing) setRefreshing(true);
		else setLoading(true);

		try {
			const data = await getAllAppointments();
			setAppointments(data.appointments || []);
		} catch (error) {
			console.error("Error cargando citas:", error);
			toast.error(error.message || "Error al cargar las citas", {
				autoClose: 4000,
			});
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchAppointments();
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
			setTimeout(() => navigate("/inicio-sesion"), 1500);
		}
	};

	const handleAceptar = async (id) => {
		setProcessingId(id);
		try {
			const result = await acceptAppointment(id);
			toast.success("Cita aceptada exitosamente", { autoClose: 3000 });
			// Reemplazar la cita actualizada en el estado
			setAppointments((prev) =>
				prev.map((a) => (a._id === id ? result.appointment : a)),
			);
		} catch (error) {
			toast.error(error.message || "Error al aceptar la cita", {
				autoClose: 4000,
			});
		} finally {
			setProcessingId(null);
		}
	};

	const handleRechazar = async (id) => {
		setProcessingId(id);
		try {
			const result = await rejectAppointment(id);
			toast.success("Cita rechazada exitosamente", { autoClose: 3000 });
			setAppointments((prev) =>
				prev.map((a) => (a._id === id ? result.appointment : a)),
			);
		} catch (error) {
			toast.error(error.message || "Error al rechazar la cita", {
				autoClose: 4000,
			});
		} finally {
			setProcessingId(null);
		}
	};

	const visibleCitas =
		filter === "Pendientes"
			? appointments.filter((c) => c.status === "Pendiente")
			: appointments;

	const formatDateTime = (dateStr, timeStr) => {
		if (!dateStr) return "N/A";
		const date = new Date(dateStr);
		const formattedDate = date.toLocaleDateString("es-ES", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
		return `${formattedDate} ${timeStr || ""}`;
	};

	// Helper para obtener nombre completo
	const getFullName = (person) => {
		if (!person) return "N/A";
		return `${person.name || ""} ${person.paternalLastName || ""}`.trim();
	};

	if (checking) {
		return (
			<div className="admin-citas-container">
				<div className="admin-loading-screen">
					<p>Verificando tu estado...</p>
				</div>
			</div>
		);
	}

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

				<div className="admin-citas-subheader">
					<p className="admin-citas-subtitle">
						{filter === "Pendientes"
							? `Citas pendientes (${visibleCitas.length})`
							: `Todas las citas (${visibleCitas.length})`}
					</p>

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
						<button
							className="btn-filter btn-refresh"
							onClick={() => fetchAppointments(true)}
							disabled={refreshing}
							title="Recargar citas"
						>
							{refreshing ? "⟳" : "↻"}
						</button>
					</div>
				</div>

				<div className="admin-citas-table-wrapper">
					{refreshing && <div className="refresh-overlay"></div>}

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
							{loading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<tr key={`skeleton-${i}`} className="skeleton-row">
										<td>
											<div className="skeleton skeleton-text"></div>
										</td>
										<td>
											<div className="skeleton skeleton-text"></div>
										</td>
										<td>
											<div className="skeleton skeleton-text"></div>
										</td>
										<td>
											<div className="skeleton skeleton-text"></div>
										</td>
										<td>
											<div className="skeleton skeleton-badge"></div>
										</td>
										<td>
											<div className="skeleton skeleton-actions"></div>
										</td>
									</tr>
								))
							) : visibleCitas.length === 0 ? (
								<tr>
									<td colSpan={6} className="empty-row">
										<div className="empty-content">
											<span className="empty-icon">📅</span>
											<p>No hay citas que mostrar.</p>
										</div>
									</td>
								</tr>
							) : (
								visibleCitas.map((cita) => {
									const cfg = STATUS_CONFIG[cita.status] || {
										label: cita.status,
										cls: "status-pendiente",
									};
									const isProcessing = processingId === cita._id;
									const isPending = cita.status === "Pendiente";

									return (
										<tr
											key={cita._id}
											className={`cita-row ${isProcessing ? "processing" : ""}`}
										>
											<td className="col-pet">
												<strong>{cita.pet?.name || "N/A"}</strong>
												{cita.pet?.petType && (
													<span className="pet-type">{cita.pet.petType}</span>
												)}
											</td>
											<td className="col-owner">{getFullName(cita.owner)}</td>
											<td className="col-service">
												{cita.service?.name || "N/A"}
											</td>
											<td className="col-datetime">
												{formatDateTime(cita.date, cita.time)}
											</td>
											<td className="col-status">
												<span className={`cita-status-badge ${cfg.cls}`}>
													{cfg.label}
												</span>
											</td>
											<td className="col-actions">
												{isPending && (
													<>
														<button
															className="btn-action btn-aceptar"
															onClick={() => handleAceptar(cita._id)}
															disabled={isProcessing}
															title="Aceptar cita"
														>
															{isProcessing ? "..." : "✓"}
														</button>
														<button
															className="btn-action btn-rechazar"
															onClick={() => handleRechazar(cita._id)}
															disabled={isProcessing}
															title="Rechazar cita"
														>
															{isProcessing ? "..." : "✕"}
														</button>
													</>
												)}
												{!isPending && <span className="no-actions">—</span>}
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
