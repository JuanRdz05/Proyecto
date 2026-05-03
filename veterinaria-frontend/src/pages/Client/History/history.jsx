import { useState, useEffect } from "react";
import { PageTransition } from "../../../components/PageTransition/PageTransition.jsx";
import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import { getUserAppointments } from "../../../services/Client/appointment.js";
import "./history.css";
const ITEMS_PER_PAGE = 6;

function StatusBadge({ status }) {
	const statusConfig = {
		Pendiente: { class: "status-pendiente", label: "Pendiente" },
		Aceptada: { class: "status-aceptada", label: "Aceptada" },
		"En progreso": { class: "status-progreso", label: "En progreso" },
		Terminada: { class: "status-terminada", label: "Terminada" },
		Cancelada: { class: "status-cancelada", label: "Cancelada" },
		Rechazada: { class: "status-rechazada", label: "Rechazada" },
	};
	const config = statusConfig[status] || {
		class: "status-default",
		label: status,
	};
	return <span className={`status-badge ${config.class}`}>{config.label}</span>;
}

// ── Modal de detalles ────────────────────────────────────────────────────────
function AppointmentModal({ appointment, onClose, formatDate }) {
	if (!appointment) return null;

	const { status, pet, service, date, time, price, rejectionReason } =
		appointment;

	// Qué secciones mostrar según el estado
	const showDateTime = status !== "Rechazada" && status !== "Cancelada";
	const showPrice = service?.price != null || price != null;
	const servicePrice = service?.price ?? price ?? null;

	return (
		<div className="history-modal-overlay" onClick={onClose}>
			<div
				className="history-modal-content"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="history-modal-header">
					<h3>Detalles de la cita</h3>
					<button className="history-modal-close" onClick={onClose}>
						✕
					</button>
				</div>

				{/* Body */}
				<div className="history-modal-body">
					{/* Estado siempre visible */}
					<div className="history-modal-status">
						<span>Estado actual:</span>
						<StatusBadge status={status} />
					</div>

					<div className="history-modal-details">
						{/* Mascota */}
						<div className="detail-row">
							<span className="detail-label">Mascota:</span>
							<span className="detail-value">
								{pet?.name || "N/A"}
								{pet?.petType ? ` (${pet.petType})` : ""}
							</span>
						</div>

						{/* Servicio */}
						<div className="detail-row">
							<span className="detail-label">Servicio:</span>
							<span className="detail-value">
								{service?.name || service || "N/A"}
							</span>
						</div>

						{/* Precio — visible en todos los estados si existe */}
						{showPrice && (
							<div className="detail-row">
								<span className="detail-label">Precio:</span>
								<span className="detail-value">
									${Number(servicePrice).toFixed(2)} MXN
								</span>
							</div>
						)}

						{/* Fecha y hora — solo si no está rechazada/cancelada */}
						{showDateTime && (
							<div className="detail-row">
								<span className="detail-label">Fecha y hora:</span>
								<span className="detail-value">
									{formatDate(date)} · {time || "N/A"}
								</span>
							</div>
						)}

						{/* Motivo de rechazo */}
						{status === "Rechazada" && (
							<div className="history-modal-reason">
								<span className="reason-title">Motivo de rechazo:</span>
								<p className="reason-text">
									{rejectionReason || "No se especificó un motivo."}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

// ── Componente principal ─────────────────────────────────────────────────────
export function History() {
const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedAppointment, setSelectedAppointment] = useState(null);

	useEffect(() => {
		const fetchAppointments = async () => {
			try {
				setLoading(true);
				const data = await getUserAppointments();
				const raw = data.appointments || [];
				const sorted = [...raw].sort((a, b) => {
					const cleanA = a.date ? a.date.split("T")[0] : null;
					const cleanB = b.date ? b.date.split("T")[0] : null;
					const dtA = cleanA
						? new Date(`${cleanA}T${a.time || "00:00"}`)
						: new Date(0);
					const dtB = cleanB
						? new Date(`${cleanB}T${b.time || "00:00"}`)
						: new Date(0);
					if (isNaN(dtA)) return 1;
					if (isNaN(dtB)) return -1;
					return dtA - dtB;
				});
				setAppointments(sorted);
			} catch (err) {
				console.error("Error al cargar citas:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};
		fetchAppointments();
	}, []);

	const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const paginatedAppointments = appointments.slice(
		startIndex,
		startIndex + ITEMS_PER_PAGE,
	);

	const goToPage = (page) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return "Fecha no disponible";
		const cleanDate = dateString.includes("T")
			? dateString.split("T")[0]
			: dateString;
		const [year, month, day] = cleanDate.split("-").map(Number);
		const date = new Date(year, month - 1, day);
		return date.toLocaleDateString("es-MX", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	if (loading) {
		return (
			<div className="history-page-container">
				<NavbarClient />
				<PageTransition>
<main className="history-main">
					<div className="history-card">
						<h2 className="history-title">Historial de citas</h2>
						<p className="history-loading">Cargando tu historial...</p>
					</div>
				</main>
			</PageTransition>
				<FooterGuest />
			</div>
		);
	}

	if (error) {
		return (
			<div className="history-page-container">
				<NavbarClient />
				<PageTransition>
<main className="history-main">
					<div className="history-card">
						<h2 className="history-title">Historial de citas</h2>
						<p className="history-error">❌ Hubo un problema: {error}</p>
					</div>
				</main>
			</PageTransition>
				<FooterGuest />
			</div>
		);
	}
return (
		<div className="history-page-container">
			<NavbarClient />

			<PageTransition>
<main className="history-main">
				<div className="history-card">
					<div className="history-header">
						<h2 className="history-title">Historial de citas</h2>
						<span className="history-count">
							{appointments.length} cita{appointments.length !== 1 ? "s" : ""}
						</span>
					</div>

					{appointments.length === 0 ? (
						<div className="history-empty">
							<div className="empty-icon">📅</div>
							<p>No tienes citas registradas</p>
							<span>
								Agenda una cita desde el menú principal para verla aquí.
							</span>
						</div>
					) : (
						<>
							<ul className="history-list">
								{paginatedAppointments.map((item, index) => (
									<li
										key={item._id || item.id}
										className={`history-item clickable ${index < paginatedAppointments.length - 1 ? "with-divider" : ""}`}
										onClick={() => setSelectedAppointment(item)}
									>
										<div className="history-info">
											<span className="history-pet-label">
												<strong>{item.pet?.name || "Mascota"}</strong> —{" "}
												{item.pet?.petType || "N/A"}
											</span>
											<StatusBadge status={item.status} />
										</div>
										<div className="history-datetime">
											<span>{formatDate(item.date)}</span>
											<span className="history-time">{item.time}</span>
										</div>
									</li>
								))}
							</ul>

							{totalPages > 1 && (
								<div className="pagination">
									<button
										className="pagination-btn"
										onClick={() => goToPage(currentPage - 1)}
										disabled={currentPage === 1}
									>
										← Anterior
									</button>
									<div className="pagination-pages">
										{Array.from({ length: totalPages }, (_, i) => i + 1).map(
											(page) => (
												<button
													key={page}
													className={`pagination-page ${page === currentPage ? "active" : ""}`}
													onClick={() => goToPage(page)}
												>
													{page}
												</button>
											),
										)}
									</div>
									<button
										className="pagination-btn"
										onClick={() => goToPage(currentPage + 1)}
										disabled={currentPage === totalPages}
									>
										Siguiente →
									</button>
								</div>
							)}

							<div className="pagination-info">
								Mostrando página {currentPage} de {totalPages}
							</div>
						</>
					)}
				</div>
			</main>
			</PageTransition>

			<FooterGuest />

			{/* Modal de detalles */}
			{selectedAppointment && (
				<AppointmentModal
					appointment={selectedAppointment}
					onClose={() => setSelectedAppointment(null)}
					formatDate={formatDate}
				/>
			)}
		</div>
	);
}
