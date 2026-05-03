import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageTransition } from "../../../components/PageTransition/PageTransition.jsx";
import { NavbarVet } from "../../../components/NavbarVet/navbarVet.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import {
	getAppointmentById,
	startAppointment,
	revertAppointment,
	createMedicalRecord,
} from "../../../services/Vet/records.js";
import { toast } from "react-toastify";
import "./atender.css";

// Medicamento vacío por defecto
const newMed = () => ({
	id: Date.now(),
	medication: "",
	dosage: "",
	frequency: "",
	duration: "",
	notes: "",
});

export function AtenderCita() {
	const { id } = useParams();
	const navigate = useNavigate();

	// Datos de la cita
	const [cita, setCita] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Campos clínicos
	const [weight, setWeight] = useState("");
	const [temperature, setTemperature] = useState("");
	const [symptoms, setSymptoms] = useState("");
	const [diagnosis, setDiagnosis] = useState("");
	const [treatment, setTreatment] = useState("");
	const [notes, setNotes] = useState("");
	const [nextVisitDate, setNextVisitDate] = useState("");

	// Lista dinámica de medicamentos
	const [prescriptions, setPrescriptions] = useState([newMed()]);

	// Cargar cita al montar
	useEffect(() => {
		const loadAppointment = async () => {
			try {
				setLoading(true);
				const data = await getAppointmentById(id);
				setCita(data.appointment);

				// Solo iniciar si está en "Aceptada", no si ya está "En progreso"
				if (data.appointment.status === "Aceptada") {
					await startAppointment(id);
					// Actualizar el estado local para reflejar el cambio
					setCita((prev) => (prev ? { ...prev, status: "En progreso" } : null));
					toast.info("Cita iniciada", { autoClose: 2000 });
				}
			} catch (error) {
				console.error("Error cargando cita:", error);
				toast.error(error.message || "Error al cargar la cita", {
					autoClose: 4000,
				});
				navigate("/veterinario");
			} finally {
				setLoading(false);
			}
		};

		loadAppointment();
	}, [id, navigate]);

	// Manejar salida sin terminar
	useEffect(() => {
		const handleBeforeUnload = (e) => {
			e.preventDefault();
			e.returnValue = "";
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, []);

	const handleCancel = async () => {
		try {
			await revertAppointment(id);
			toast.info("Cita revertida a pendiente", { autoClose: 2000 });
		} catch (error) {
			console.error("Error al revertir:", error);
		}
		navigate("/veterinario");
	};

	// Actualizar un campo de un medicamento específico
	const handleMedChange = (medId, field, value) => {
		setPrescriptions((prev) =>
			prev.map((m) => (m.id === medId ? { ...m, [field]: value } : m)),
		);
	};

	// Agregar nuevo medicamento vacío
	const addMedicamento = () => {
		setPrescriptions((prev) => [...prev, newMed()]);
	};

	// Eliminar un medicamento por id
	const removeMedicamento = (medId) => {
		setPrescriptions((prev) => prev.filter((m) => m.id !== medId));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!diagnosis.trim()) {
			toast.warning("El diagnóstico es obligatorio");
			return;
		}
		if (!treatment.trim()) {
			toast.warning("El tratamiento es obligatorio");
			return;
		}

		// Filtrar medicamentos vacíos y formatear para el backend
		const validMeds = prescriptions
			.filter((m) => m.medication.trim())
			.map((m) => ({
				medication: m.medication,
				dosage: m.dosage,
				frequency: m.frequency,
				duration: m.duration,
				notes: m.notes,
			}));

		const recordData = {
			appointmentId: id,
			diagnosis,
			treatment,
			prescriptions: validMeds,
			symptoms,
			weight: weight ? parseFloat(weight) : undefined,
			temperature: temperature ? parseFloat(temperature) : undefined,
			notes,
			nextVisitDate: nextVisitDate || undefined,
		};

		setIsSubmitting(true);
		try {
			await createMedicalRecord(recordData);
			toast.success("✅ Registro médico guardado y cita finalizada", {
				autoClose: 3000,
			});
			navigate("/veterinario");
		} catch (error) {
			console.error("Error al guardar:", error);
			toast.error(error.message || "Error al guardar el registro médico", {
				autoClose: 4000,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const formatDate = (dateStr) => {
		if (!dateStr) return "N/A";
		const [year, month, day] = dateStr.split("-");
		return `${day}/${month}/${year}`;
	};

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

	if (loading) {
		return (
			<div className="atender-page-container">
				<NavbarVet />
				<main className="atender-main">
					<div className="atender-card">
						<div className="atender-loading">
							<div className="spinner"></div>
							<p>Cargando información de la cita...</p>
						</div>
					</div>
				</main>
				<FooterGuest />
			</div>
		);
	}

	if (!cita) {
		return (
			<div className="atender-page-container">
				<NavbarVet />
				<main className="atender-main">
					<div className="atender-card">
						<p className="atender-error">No se encontró la cita</p>
						<button
							className="btn-terminar-cita"
							onClick={() => navigate("/veterinario")}
						>
							Volver al inicio
						</button>
					</div>
				</main>
				<FooterGuest />
			</div>
		);
	}

	return (
		<div className="atender-page-container">
			<NavbarVet />

			<PageTransition>
				<main className="atender-main">
					<div className="atender-card">
						<div className="atender-header">
							<h2 className="atender-title">Atender Cita</h2>
							<span
								className={`cita-status-badge status-${cita.status?.toLowerCase().replace(" ", "-")}`}
							>
								{cita.status === "En progreso" ? "   En curso" : cita.status}
							</span>
						</div>

						<form onSubmit={handleSubmit} className="atender-form">
							<div className="atender-top-grid">
								<div className="atender-col-left">
									<div className="cita-info-box">
										<div className="cita-info-row">
											<span>Mascota:</span>
											<strong>{cita.pet?.name || "N/A"}</strong>
											{cita.pet?.petType && (
												<span className="pet-type-tag">{cita.pet.petType}</span>
											)}
										</div>
										<div className="cita-info-row">
											<span>Dueño:</span>
											<strong>{getOwnerName(cita.owner)}</strong>
										</div>
										<div className="cita-info-row">
											<span>Fecha:</span>
											<strong>
												{formatDate(cita.date)}, {formatTime(cita.time)}
											</strong>
										</div>
										<div className="cita-info-row">
											<span>Servicio:</span>
											<strong>{cita.service?.name || "N/A"}</strong>
										</div>
										{cita.notes && (
											<div className="cita-info-row cita-notes">
												<span>Notas del cliente:</span>
												<p>{cita.notes}</p>
											</div>
										)}
									</div>

									<div className="atender-row-two">
										<div className="atender-field">
											<label>PESO</label>
											<div className="input-unit-wrapper">
												<input
													type="number"
													step="0.1"
													min="0"
													value={weight}
													onChange={(e) => setWeight(e.target.value)}
													placeholder="0.0"
												/>
												<span className="unit-badge">kg</span>
											</div>
										</div>
										<div className="atender-field">
											<label>TEMPERATURA</label>
											<div className="input-unit-wrapper">
												<input
													type="number"
													step="0.1"
													min="0"
													value={temperature}
													onChange={(e) => setTemperature(e.target.value)}
													placeholder="0.0"
												/>
												<span className="unit-badge">°C</span>
											</div>
										</div>
									</div>

									<div className="atender-field">
										<label>SÍNTOMAS</label>
										<textarea
											value={symptoms}
											onChange={(e) => setSymptoms(e.target.value)}
											placeholder="Describe los síntomas observados..."
											rows={3}
										/>
									</div>

									<div className="atender-field">
										<label>DIAGNÓSTICO *</label>
										<textarea
											value={diagnosis}
											onChange={(e) => setDiagnosis(e.target.value)}
											placeholder="Escribe el diagnóstico..."
											rows={3}
											required
										/>
									</div>

									<div className="atender-field">
										<label>TRATAMIENTO *</label>
										<textarea
											value={treatment}
											onChange={(e) => setTreatment(e.target.value)}
											placeholder="Describe el tratamiento recomendado..."
											rows={3}
											required
										/>
									</div>

									<div className="atender-field">
										<label>NOTAS ADICIONALES</label>
										<textarea
											value={notes}
											onChange={(e) => setNotes(e.target.value)}
											placeholder="Observaciones adicionales..."
											rows={2}
										/>
									</div>

									<div className="atender-field">
										<label>PRÓXIMA VISITA</label>
										<input
											type="date"
											value={nextVisitDate}
											onChange={(e) => setNextVisitDate(e.target.value)}
											min={cita.date}
										/>
									</div>
								</div>

								<div className="atender-col-right">
									<div className="prescripcion-header">
										<p className="prescripcion-title">Prescripción</p>
										<button
											type="button"
											className="btn-add-med"
											onClick={addMedicamento}
										>
											+ Agregar medicamento
										</button>
									</div>

									<div className="medicamentos-list">
										{prescriptions.map((med, index) => (
											<div key={med.id} className="medicamento-block">
												<div className="med-block-header">
													<span className="med-block-num">
														Medicamento {index + 1}
													</span>
													{prescriptions.length > 1 && (
														<button
															type="button"
															className="btn-remove-med"
															onClick={() => removeMedicamento(med.id)}
															title="Eliminar medicamento"
														>
															&times;
														</button>
													)}
												</div>

												<div className="atender-field">
													<label>MEDICAMENTO</label>
													<input
														type="text"
														value={med.medication}
														onChange={(e) =>
															handleMedChange(
																med.id,
																"medication",
																e.target.value,
															)
														}
														placeholder="Nombre del medicamento"
													/>
												</div>

												<div className="atender-row-two">
													<div className="atender-field">
														<label>DOSIS</label>
														<input
															type="text"
															value={med.dosage}
															onChange={(e) =>
																handleMedChange(
																	med.id,
																	"dosage",
																	e.target.value,
																)
															}
															placeholder="Ej. 5mg"
														/>
													</div>
													<div className="atender-field">
														<label>FRECUENCIA</label>
														<div className="input-freq-wrapper">
															<input
																type="text"
																value={med.frequency}
																onChange={(e) =>
																	handleMedChange(
																		med.id,
																		"frequency",
																		e.target.value,
																	)
																}
																placeholder="Ej. 2"
															/>
															<span className="unit-badge">/ día</span>
														</div>
													</div>
												</div>

												<div className="atender-field">
													<label>DURACIÓN</label>
													<input
														type="text"
														value={med.duration}
														onChange={(e) =>
															handleMedChange(
																med.id,
																"duration",
																e.target.value,
															)
														}
														placeholder="Ej. 7 días"
													/>
												</div>

												<div className="atender-field">
													<label>NOTAS</label>
													<textarea
														value={med.notes}
														onChange={(e) =>
															handleMedChange(med.id, "notes", e.target.value)
														}
														placeholder="Notas adicionales..."
														rows={2}
													/>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>

							<div className="atender-actions">
								<button
									type="button"
									className="btn-cancelar-cita"
									onClick={handleCancel}
									disabled={isSubmitting}
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="btn-terminar-cita"
									disabled={isSubmitting}
								>
									{isSubmitting ? "⏳ Guardando..." : "Terminar cita"}
								</button>
							</div>
						</form>
					</div>
				</main>
			</PageTransition>

			<FooterGuest />
		</div>
	);
}
