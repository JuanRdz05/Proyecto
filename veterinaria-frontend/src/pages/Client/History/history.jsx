import { useState, useEffect } from "react";
import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import { getUserAppointments } from "../../../services/Client/appointment.js";
import "./history.css";

const ITEMS_PER_PAGE = 10;

// Badge de estado con colores
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

export function History() {
	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		const fetchAppointments = async () => {
			try {
				setLoading(true);
				const data = await getUserAppointments();
				setAppointments(data.appointments || []);
			} catch (err) {
				console.error("Error al cargar citas:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchAppointments();
	}, []);

	// Paginación
	const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const paginatedAppointments = appointments.slice(
		startIndex,
		startIndex + ITEMS_PER_PAGE,
	);

	const goToPage = (page) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	// Formatear fecha
	const formatDate = (dateString) => {
		const date = new Date(dateString);
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
				<main className="history-main">
					<div className="history-card">
						<h2 className="history-title">Historial de citas</h2>
						<p className="history-loading">Cargando citas...</p>
					</div>
				</main>
				<FooterGuest />
			</div>
		);
	}

	if (error) {
		return (
			<div className="history-page-container">
				<NavbarClient />
				<main className="history-main">
					<div className="history-card">
						<h2 className="history-title">Historial de citas</h2>
						<p className="history-error">❌ {error}</p>
					</div>
				</main>
				<FooterGuest />
			</div>
		);
	}

	return (
		<div className="history-page-container">
			<NavbarClient />

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
							<span>Agenda tu primera cita desde el menú principal</span>
						</div>
					) : (
						<>
							<ul className="history-list">
								{paginatedAppointments.map((item, index) => (
									<li
										key={item._id || item.id}
										className={`history-item ${index < paginatedAppointments.length - 1 ? "with-divider" : ""}`}
									>
										<div className="history-info">
											<span className="history-pet-label">
												{item.pet?.name || "Mascota"} -{" "}
												{item.pet?.petType || item.pet?.species || "N/A"}
											</span>
											<StatusBadge status={item.status} />
										</div>
										<div className="history-datetime">
											<span>{formatDate(item.date)}</span>
											<span>{item.time}</span>
										</div>
									</li>
								))}
							</ul>

							{/* Paginación */}
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
								Página {currentPage} de {totalPages}
							</div>
						</>
					)}
				</div>
			</main>

			<FooterGuest />
		</div>
	);
}
