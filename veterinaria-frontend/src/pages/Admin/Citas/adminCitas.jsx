import { useState, useEffect } from "react";
import { PageTransition } from "../../../components/PageTransition/PageTransition.jsx";
import { toast } from "react-toastify";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
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

	// ── Guard: verifica si el administrador está activo ────────────────────
	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [filter, setFilter] = useState("Pendientes");
	const [processingId, setProcessingId] = useState(null);

	// Estados para los modales
	const [showReasonModal, setShowReasonModal] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [selectedCita, setSelectedCita] = useState(null);
	const [rejectionReason, setRejectionReason] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

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

	// ── Bloquear si está verificando o inactivo ────────────────────────────
	const handleAceptar = async (id) => {
		setProcessingId(id);
		try {
			const result = await acceptAppointment(id);

			// Toast de éxito con el nombre del veterinario asignado
			toast.success(result.message || "Cita aceptada exitosamente", {
				autoClose: 4000,
			});

			setAppointments((prev) =>
				prev.map((a) => (a._id === id ? result.appointment : a)),
			);
		} catch (error) {
			// Manejo específico de errores
			const errorMessage = error.message || "Error al aceptar la cita";

			if (errorMessage.includes("No hay veterinarios disponibles")) {
				toast.error(
					"❌ No hay veterinarios disponibles. No se puede aceptar la cita.",
					{
						autoClose: 5000,
					},
				);
			} else if (errorMessage.includes("ocupados")) {
				toast.error(
					"❌ Todos los veterinarios están ocupados en este horario.",
					{
						autoClose: 5000,
					},
				);
			} else {
				toast.error(errorMessage, {
					autoClose: 4000,
				});
			}
		} finally {
			setProcessingId(null);
		}
	};

	// Abrir modal de motivo
	const openReasonModal = (cita) => {
		setSelectedCita(cita);
		setRejectionReason("");
		setShowReasonModal(true);
	};

	// Cerrar modal de motivo
	const closeReasonModal = () => {
		setShowReasonModal(false);
		setSelectedCita(null);
		setRejectionReason("");
	};

	// Ir a confirmación
	const goToConfirm = () => {
		if (!rejectionReason.trim()) {
			toast.warning("Debes escribir un motivo de rechazo", { autoClose: 3000 });
			return;
		}
		setShowReasonModal(false);
		setShowConfirmModal(true);
	};

	// Volver al modal de motivo
	const backToReason = () => {
		setShowConfirmModal(false);
		setShowReasonModal(true);
	};

	// Ejecutar rechazo definitivo
	const confirmReject = async () => {
		if (!selectedCita) return;

		setIsSubmitting(true);
		try {
			const result = await rejectAppointment(
				selectedCita._id,
				rejectionReason.trim(),
			);
			toast.success("Cita rechazada exitosamente", { autoClose: 3000 });
			setAppointments((prev) =>
				prev.map((a) => (a._id === selectedCita._id ? result.appointment : a)),
			);
			setShowConfirmModal(false);
			setSelectedCita(null);
			setRejectionReason("");
		} catch (error) {
			toast.error(error.message || "Error al rechazar la cita", {
				autoClose: 4000,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const visibleCitas =
		filter === "Pendientes"
			? appointments.filter((c) => c.status === "Pendiente")
			: appointments;

	const formatDateTime = (dateStr, timeStr) => {
		if (!dateStr) return "N/A";
		// Parseo manual para evitar el desplazamiento UTC (new Date("YYYY-MM-DD") = UTC midnight)
		const [year, month, day] = dateStr.split("-");
		const formattedDate = `${day}/${month}/${year}`;
		return `${formattedDate} ${timeStr || ""}`.trim();
	};

	const getFullName = (person) => {
		if (!person) return "N/A";
		return `${person.name || ""} ${person.paternalLastName || ""}`.trim();
	};
	return (
		<div className="admin-citas-container">
			<NavbarAdmin />

			<PageTransition>
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
																onClick={() => openReasonModal(cita)}
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
			</PageTransition>

			<FooterGuest />

			{/* ===== MODAL: MOTIVO DE RECHAZO ===== */}
			{showReasonModal && (
				<div className="modal-overlay" onClick={closeReasonModal}>
					<div
						className="modal-content modal-reason"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="modal-header">
							<h3>Rechazar cita</h3>
							<button className="modal-close" onClick={closeReasonModal}>
								✕
							</button>
						</div>

						<div className="modal-body">
							<p className="modal-subtitle">
								Indica el motivo por el cual se rechaza esta cita:
							</p>

							{selectedCita && (
								<div className="modal-cita-info">
									<span>
										<strong>Paciente:</strong> {selectedCita.pet?.name || "N/A"}
									</span>
									<span>
										<strong>Dueño:</strong> {getFullName(selectedCita.owner)}
									</span>
									<span>
										<strong>Servicio:</strong>{" "}
										{selectedCita.service?.name || "N/A"}
									</span>
									<span>
										<strong>Fecha:</strong>{" "}
										{formatDateTime(selectedCita.date, selectedCita.time)}
									</span>
								</div>
							)}

							<textarea
								className="modal-textarea"
								placeholder="Escribe el motivo del rechazo..."
								value={rejectionReason}
								onChange={(e) => setRejectionReason(e.target.value)}
								rows={4}
								maxLength={500}
							/>
							<div className="modal-char-count">
								{rejectionReason.length}/500
							</div>
						</div>

						<div className="modal-footer">
							<button
								className="btn-modal btn-modal-secondary"
								onClick={closeReasonModal}
							>
								Cancelar
							</button>
							<button
								className="btn-modal btn-modal-primary"
								onClick={goToConfirm}
								disabled={!rejectionReason.trim()}
							>
								Continuar
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ===== MODAL: CONFIRMACIÓN FINAL ===== */}
			{showConfirmModal && (
				<div className="modal-overlay" onClick={backToReason}>
					<div
						className="modal-content modal-confirm"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="modal-header modal-header-warning">
							<div className="modal-icon-warning">⚠️</div>
							<h3>¿Estás seguro?</h3>
						</div>

						<div className="modal-body">
							<p className="modal-confirm-text">
								Estás a punto de <strong>rechazar</strong> la siguiente cita:
							</p>

							{selectedCita && (
								<div className="modal-cita-summary">
									<div className="summary-row">
										<span>Paciente:</span>
										<strong>{selectedCita.pet?.name || "N/A"}</strong>
									</div>
									<div className="summary-row">
										<span>Dueño:</span>
										<strong>{getFullName(selectedCita.owner)}</strong>
									</div>
									<div className="summary-row">
										<span>Servicio:</span>
										<strong>{selectedCita.service?.name || "N/A"}</strong>
									</div>
									<div className="summary-row">
										<span>Fecha:</span>
										<strong>
											{formatDateTime(selectedCita.date, selectedCita.time)}
										</strong>
									</div>
								</div>
							)}

							<div className="modal-reason-box">
								<span className="reason-label">Motivo de rechazo:</span>
								<p className="reason-text">{rejectionReason}</p>
							</div>

							<p className="modal-warning-text">
								Esta acción no se puede deshacer.
							</p>
						</div>

						<div className="modal-footer">
							<button
								className="btn-modal btn-modal-secondary"
								onClick={backToReason}
								disabled={isSubmitting}
							>
								Volver
							</button>
							<button
								className="btn-modal btn-modal-danger"
								onClick={confirmReject}
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<span className="spinner-small"></span>
										Procesando...
									</>
								) : (
									"Sí, rechazar cita"
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
