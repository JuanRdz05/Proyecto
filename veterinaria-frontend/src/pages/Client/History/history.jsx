import { useState, useEffect } from "react";
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

				const rawAppointments = data.appointments || [];

				// ORDENAMIENTO ASCENDENTE:
				// La cita más próxima a la fecha actual aparece primero.
				const sorted = [...rawAppointments].sort((a, b) => {
					const dateTimeA = new Date(`${a.date}T${a.time || "00:00"}`);
					const dateTimeB = new Date(`${b.date}T${b.time || "00:00"}`);
					return dateTimeA - dateTimeB;
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
				<main className="history-main">
					<div className="history-card">
						<h2 className="history-title">Historial de citas</h2>
						<p className="history-loading">Cargando tu historial...</p>
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
						<p className="history-error">❌ Hubo un problema: {error}</p>
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
										className={`history-item ${index < paginatedAppointments.length - 1 ? "with-divider" : ""}`}
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

			<FooterGuest />
		</div>
	);
}
