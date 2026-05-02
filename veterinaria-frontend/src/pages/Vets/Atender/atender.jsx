import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageTransition } from "../../../components/PageTransition/PageTransition.jsx";
import { NavbarVet } from "../../../components/NavbarVet/navbarVet.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./atender.css";

// Datos dummy para la cita — se conectará al backend
const MOCK_CITAS = {
	1: {
		pet: "Max",
		date: "10/10/2024",
		time: "10:00 AM",
		vet: "Dr. García",
		service: "Chequeo Anual",
	},
	2: {
		pet: "Charlie",
		date: "10/10/2024",
		time: "11:30 AM",
		vet: "Dr. García",
		service: "Vacunación",
	},
	3: {
		pet: "Bella",
		date: "10/10/2024",
		time: "2:30 PM",
		vet: "Dr. García",
		service: "Consulta",
	},
};

// Medicamento vacío por defecto
const newMed = () => ({
	id: Date.now(),
	nombre: "",
	dosis: "",
	frecuencia: "",
	duracion: "",
	notas: "",
});

export function AtenderCita() {
const { id } = useParams();
	const navigate = useNavigate();
	const cita = MOCK_CITAS[id] || MOCK_CITAS[1];

	// Campos clínicos
	const [peso, setPeso] = useState("");
	const [temperatura, setTemperatura] = useState("");
	const [sintomas, setSintomas] = useState("");
	const [diagnostico, setDiagnostico] = useState("");
	const [tratamiento, setTratamiento] = useState("");

	// Lista dinámica de medicamentos (inicia con 1)
	const [medicamentos, setMedicamentos] = useState([newMed()]);

	// Actualizar un campo de un medicamento específico
	const handleMedChange = (medId, field, value) => {
		setMedicamentos((prev) =>
			prev.map((m) => (m.id === medId ? { ...m, [field]: value } : m)),
		);
	};

	// Agregar nuevo medicamento vacío
	const addMedicamento = () => {
		setMedicamentos((prev) => [...prev, newMed()]);
	};

	// Eliminar un medicamento por id
	const removeMedicamento = (medId) => {
		setMedicamentos((prev) => prev.filter((m) => m.id !== medId));
	};
const handleSubmit = (e) => {
		e.preventDefault();
		// TODO: conectar con backend
		console.log("Cita terminada:", {
			peso,
			temperatura,
			sintomas,
			diagnostico,
			tratamiento,
			medicamentos,
		});
		navigate("/veterinario");
	};

	return (
		<div className="atender-page-container">
			<NavbarVet />

			<PageTransition>
<main className="atender-main">
				<div className="atender-card">
					<h2 className="atender-title">Atender Cita</h2>

					<form onSubmit={handleSubmit} className="atender-form">
						{/* ---- FILA SUPERIOR: Info cita + Prescripción ---- */}
						<div className="atender-top-grid">
							{/* Columna izquierda: datos de la cita + clínicos */}
							<div className="atender-col-left">
								{/* Info de la cita (read-only) */}
								<div className="cita-info-box">
									<div className="cita-info-row">
										<span>Mascota:</span>
										<strong>{cita.pet}</strong>
									</div>
									<div className="cita-info-row">
										<span>Fecha:</span>
										<strong>
											{cita.date}, {cita.time}
										</strong>
									</div>
									<div className="cita-info-row">
										<span>Veterinario:</span>
										<strong>{cita.vet}</strong>
									</div>
									<div className="cita-info-row">
										<span>Servicio:</span>
										<strong>{cita.service}</strong>
									</div>
								</div>

								{/* Peso + Temperatura */}
								<div className="atender-row-two">
									<div className="atender-field">
										<label>PESO</label>
										<div className="input-unit-wrapper">
											<input
												type="number"
												step="0.1"
												min="0"
												value={peso}
												onChange={(e) => setPeso(e.target.value)}
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
												value={temperatura}
												onChange={(e) => setTemperatura(e.target.value)}
												placeholder="0.0"
											/>
											<span className="unit-badge">°C</span>
										</div>
									</div>
								</div>

								{/* Síntomas */}
								<div className="atender-field">
									<label>SÍNTOMAS</label>
									<textarea
										value={sintomas}
										onChange={(e) => setSintomas(e.target.value)}
										placeholder="Describe los síntomas..."
										rows={3}
									/>
								</div>

								{/* Diagnóstico */}
								<div className="atender-field">
									<label>DIAGNÓSTICO</label>
									<textarea
										value={diagnostico}
										onChange={(e) => setDiagnostico(e.target.value)}
										placeholder="Escribe el diagnóstico..."
										rows={3}
									/>
								</div>

								{/* Tratamiento */}
								<div className="atender-field">
									<label>TRATAMIENTO</label>
									<textarea
										value={tratamiento}
										onChange={(e) => setTratamiento(e.target.value)}
										placeholder="Describe el tratamiento..."
										rows={3}
									/>
								</div>
							</div>

							{/* Columna derecha: Prescripción (múltiples medicamentos) */}
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
									{medicamentos.map((med, index) => (
										<div key={med.id} className="medicamento-block">
											{/* Encabezado con número y botón eliminar */}
											<div className="med-block-header">
												<span className="med-block-num">
													Medicamento {index + 1}
												</span>
												{medicamentos.length > 1 && (
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

											{/* Nombre del medicamento */}
											<div className="atender-field">
												<label>MEDICAMENTO</label>
												<input
													type="text"
													value={med.nombre}
													onChange={(e) =>
														handleMedChange(med.id, "nombre", e.target.value)
													}
													placeholder="Nombre del medicamento"
												/>
											</div>

											{/* Dosis + Frecuencia */}
											<div className="atender-row-two">
												<div className="atender-field">
													<label>DOSIS</label>
													<input
														type="text"
														value={med.dosis}
														onChange={(e) =>
															handleMedChange(med.id, "dosis", e.target.value)
														}
														placeholder="Ej. 5mg"
													/>
												</div>
												<div className="atender-field">
													<label>FRECUENCIA</label>
													<div className="input-freq-wrapper">
														<input
															type="text"
															value={med.frecuencia}
															onChange={(e) =>
																handleMedChange(
																	med.id,
																	"frecuencia",
																	e.target.value,
																)
															}
															placeholder="Ej. 2"
														/>
														<span className="unit-badge">/ día</span>
													</div>
												</div>
											</div>

											{/* Duración */}
											<div className="atender-field">
												<label>DURACIÓN</label>
												<input
													type="text"
													value={med.duracion}
													onChange={(e) =>
														handleMedChange(med.id, "duracion", e.target.value)
													}
													placeholder="Ej. 7 días"
												/>
											</div>

											{/* Notas */}
											<div className="atender-field">
												<label>NOTAS</label>
												<textarea
													value={med.notas}
													onChange={(e) =>
														handleMedChange(med.id, "notas", e.target.value)
													}
													placeholder="Notas adicionales..."
													rows={3}
												/>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* ---- BOTONES ---- */}
						<div className="atender-actions">
							<button
								type="button"
								className="btn-cancelar-cita"
								onClick={() => navigate(-1)}
							>
								Cancelar
							</button>
							<button type="submit" className="btn-terminar-cita">
								Terminar cita
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
