import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "../../../components/PageTransition/PageTransition.jsx";
import { NavbarVet } from "../../../components/NavbarVet/navbarVet.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import { getVetAppointmentsToday } from "../../../services/Vet/citas.js";
import { toast } from "react-toastify";
import "./vets.css";

const INITIAL_COUNT = 3;

export function VetHome() {
	const navigate = useNavigate();
	const userName = localStorage.getItem("userName") || "Doctor";
	const [showAll, setShowAll] = useState(false);
	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

	const fetchAppointments = async () => {
		setLoading(true);
		try {
			const data = await getVetAppointmentsToday();
			const apps = data.appointments || [];
			setAppointments(apps);

			// Calcular estadísticas
			const completed = apps.filter((a) => a.status === "Terminada").length;
			const pending = apps.filter(
				(a) => a.status === "Aceptada" || a.status === "En progreso",
			).length;
			setStats({
				total: apps.length,
				completed,
				pending,
			});
		} catch (error) {
			console.error("Error cargando citas:", error);
			toast.error(error.message || "Error al cargar las citas", {
				autoClose: 4000,
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAppointments();
	}, []);

	const visibleAppointments = showAll
		? appointments
		: appointments.slice(0, INITIAL_COUNT);

	const formatTime = (timeStr) => {
		if (!timeStr) return "N/A";
		const [hours, minutes] = timeStr.split(":");
		const hour = parseInt(hours, 10);
		const ampm = hour >= 12 ? "PM" : "AM";
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes} ${ampm}`;
	};

	const getOwnerName = (owner) => {
		if (!owner) return "N/A";
		return `${owner.name || ""} ${owner.paternalLastName || ""}`.trim();
	};

	const getStatusClass = (status) => {
		switch (status) {
			case "Aceptada":
				return "status-aceptada";
			case "En progreso":
				return "status-progreso";
			case "Terminada":
				return "status-terminada";
			default:
				return "status-aceptada";
		}
	};

	const getStatusLabel = (status) => {
		switch (status) {
			case "En progreso":
				return "En curso";
			default:
				return status;
		}
	};

	return (
		<div className="vet-page-container">
			<NavbarVet />

			<PageTransition>
				<main className="vet-main">
					<h1 className="vet-welcome">¡Bienvenido, Dr. {userName}!</h1>

					<div className="vet-stats-grid">
						<div className="vet-stat-card">
							<p className="stat-label">Citas del día de hoy</p>
							<span className="stat-value">{stats.total}</span>
						</div>
						<div className="vet-stat-card">
							<p className="stat-label">Completadas</p>
							<span className="stat-value">{stats.completed}</span>
						</div>
						<div className="vet-stat-card">
							<p className="stat-label">Pendientes</p>
							<span className="stat-value">{stats.pending}</span>
						</div>
					</div>

					<section className="vet-appointments-section">
						<div className="vet-appointments-header">
							<h2>Citas del día</h2>
							<button
								className="btn-ver-todas"
								onClick={() => setShowAll((prev) => !prev)}
							>
								{showAll ? "Ver menos" : "Ver todas"}
							</button>
						</div>

						<div className="vet-appointments-card">
							{loading ? (
								// Skeleton loading
								Array.from({ length: 3 }).map((_, i) => (
									<div
										key={`skeleton-${i}`}
										className={`vet-apt-row ${i < 2 ? "with-divider" : ""}`}
									>
										<div className="vet-apt-info">
											<div
												className="skeleton skeleton-text"
												style={{ width: "60%" }}
											></div>
											<div
												className="skeleton skeleton-text"
												style={{ width: "40%" }}
											></div>
										</div>
									</div>
								))
							) : appointments.length === 0 ? (
								<div className="empty-appointments">
									<span className="empty-icon">📅</span>
									<p>No tienes citas asignadas para hoy.</p>
								</div>
							) : (
								visibleAppointments.map((apt, index) => (
									<div
										key={apt._id}
										className={`vet-apt-row ${
											index < visibleAppointments.length - 1
												? "with-divider"
												: ""
										} ${apt.status === "Terminada" ? "completed" : ""}`}
									>
										<div className="vet-apt-info">
											<div className="vet-apt-header">
												<p className="vet-apt-time">
													{formatTime(apt.time)} —{" "}
													<strong>{getOwnerName(apt.owner)}</strong>
												</p>
												<span
													className={`vet-apt-status ${getStatusClass(
														apt.status,
													)}`}
												>
													{getStatusLabel(apt.status)}
												</span>
											</div>
											<p className="vet-apt-detail">
												{apt.pet?.name || "Mascota"} ·{" "}
												{apt.service?.name || "Servicio"}
											</p>
											{apt.owner?.phone && (
												<p className="vet-apt-owner-info">
													📞 {apt.owner.phone}
												</p>
											)}
										</div>
										<button
											className={`btn-atender ${
												apt.status === "Terminada" ? "status-completed" : ""
											}`}
											onClick={() => {
												if (apt.status !== "Terminada") {
													navigate(`/atender-cita/${apt._id}`);
												}
											}}
											disabled={apt.status === "Terminada"}
										>
											{apt.status === "Terminada" ? "✓ Completada" : "Atender"}
										</button>
									</div>
								))
							)}
						</div>
					</section>
				</main>
			</PageTransition>

			<FooterGuest />
		</div>
	);
}
