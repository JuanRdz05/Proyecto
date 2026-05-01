import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import { getPets } from "../../../services/Client/pet.js";
import { getAllServices } from "../../../services/Admin/services.js";
import { createAppointment } from "../../../services/Client/appointment.js";
import "./appointment.css";

export function Appointment() {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		pet: "",
		service: "",
		date: "",
		time: "",
		notes: "",
	});

	const [pets, setPets] = useState([]);
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Cargar mascotas y servicios
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const [petsData, servicesData] = await Promise.all([
					getPets(),
					getAllServices(),
				]);

				setPets(petsData.pets || petsData || []);
				setServices(servicesData.services || servicesData || []);
			} catch (error) {
				console.error("Error al cargar datos:", error);
				toast.error("No se pudieron cargar los datos necesarios", {
					position: "top-right",
					autoClose: 4000,
				});
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	// Obtener precio del servicio seleccionado
	const selectedService = services.find((svc) => svc._id === formData.service);
	const servicePrice = selectedService ? selectedService.price : null;

	// Calcular fechas límite
	const getToday = () => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return today.toISOString().split("T")[0];
	};

	const getMaxDate = () => {
		const maxDate = new Date();
		maxDate.setMonth(maxDate.getMonth() + 2);
		maxDate.setHours(0, 0, 0, 0);
		return maxDate.toISOString().split("T")[0];
	};

	// Validar fecha
	const validateDate = (dateString) => {
		const selected = new Date(dateString);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const maxDate = new Date();
		maxDate.setMonth(maxDate.getMonth() + 2);
		maxDate.setHours(0, 0, 0, 0);

		if (selected < today) {
			return { valid: false, message: "La fecha no puede ser en el pasado" };
		}
		if (selected > maxDate) {
			return {
				valid: false,
				message: "Solo puedes agendar hasta 2 meses en adelante",
			};
		}
		return { valid: true };
	};

	const validateForm = () => {
		if (!formData.pet) {
			toast.warning("Selecciona una mascota");
			return false;
		}
		if (!formData.service) {
			toast.warning("Selecciona un servicio");
			return false;
		}
		if (!formData.date) {
			toast.warning("Selecciona una fecha");
			return false;
		}
		const dateValidation = validateDate(formData.date);
		if (!dateValidation.valid) {
			toast.warning(dateValidation.message);
			return false;
		}
		if (!formData.time) {
			toast.warning("Selecciona un horario");
			return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) return;

		const appointmentData = {
			date: formData.date,
			time: formData.time,
			pet: formData.pet,
			service: formData.service,
			notes: formData.notes || undefined,
		};

		try {
			setIsSubmitting(true);
			await createAppointment(appointmentData);

			toast.success("Cita agendada exitosamente", {
				position: "top-right",
				autoClose: 2000,
				onClose: () => navigate("/historial"),
			});

			setFormData({
				pet: "",
				service: "",
				date: "",
				time: "",
				notes: "",
			});
		} catch (error) {
			console.error("Error al agendar cita:", error);
			toast.error(`❌ ${error.message || "No se pudo agendar la cita"}`, {
				position: "top-right",
				autoClose: 4000,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		if (formData.pet || formData.service || formData.date) {
			toast.info("Formulario cancelado");
		}
		navigate(-1);
	};

	if (loading) {
		return (
			<div className="appointment-page-container">
				<NavbarClient />
				<main className="appointment-main">
					<div className="appointment-card">
						<h2 className="appointment-title">Información de la cita</h2>
						<p>Cargando datos...</p>
					</div>
				</main>
				<FooterGuest />
			</div>
		);
	}

	return (
		<div className="appointment-page-container">
			<NavbarClient />

			<main className="appointment-main">
				<div className="appointment-card">
					<h2 className="appointment-title">Información de la cita</h2>

					<form onSubmit={handleSubmit} className="appointment-form">
						{/* Fila: Mascota + Servicio */}
						<div className="appointment-row">
							{/* Mascota */}
							<div className="appointment-field">
								<label htmlFor="pet">
									Mascota <span className="required-asterisk">*</span>
								</label>
								<div className="select-wrapper">
									<select
										id="pet"
										name="pet"
										value={formData.pet}
										onChange={handleChange}
										required
									>
										<option value="" disabled>
											Selecciona una mascota
										</option>
										{pets.length === 0 ? (
											<option value="" disabled>
												No tienes mascotas registradas
											</option>
										) : (
											pets.map((pet) => (
												<option key={pet._id} value={pet._id}>
													{pet.name}
												</option>
											))
										)}
									</select>
									<span className="select-arrow">&#8964;</span>
								</div>
							</div>

							{/* Servicio */}
							<div className="appointment-field">
								<label htmlFor="service">
									Servicio <span className="required-asterisk">*</span>
								</label>
								<div className="select-wrapper">
									<select
										id="service"
										name="service"
										value={formData.service}
										onChange={handleChange}
										required
									>
										<option value="" disabled>
											Selecciona un servicio
										</option>
										{services.length === 0 ? (
											<option value="" disabled>
												No hay servicios disponibles
											</option>
										) : (
											services.map((svc) => (
												<option key={svc._id} value={svc._id}>
													{svc.name}
												</option>
											))
										)}
									</select>
									<span className="select-arrow">&#8964;</span>
								</div>
							</div>
						</div>

						{/* Precio del servicio seleccionado */}
						{servicePrice !== null && (
							<div className="appointment-price-box">
								<span className="price-label">Precio del servicio:</span>
								<span className="price-value">
									${servicePrice.toFixed(2)} MXN
								</span>
							</div>
						)}

						{/* Fecha */}
						<div className="appointment-field full-width">
							<label htmlFor="date">
								Fecha <span className="required-asterisk">*</span>
							</label>
							<div className="input-icon-wrapper">
								<input
									type="date"
									id="date"
									name="date"
									value={formData.date}
									onChange={handleChange}
									min={getToday()}
									max={getMaxDate()}
									required
								/>
							</div>
						</div>

						{/* Horarios disponibles */}
						<div className="appointment-field full-width">
							<label htmlFor="time">
								Horarios disponibles{" "}
								<span className="required-asterisk">*</span>
							</label>
							<div className="select-wrapper">
								<select
									id="time"
									name="time"
									value={formData.time}
									onChange={handleChange}
									required
								>
									<option value="" disabled>
										Selecciona un horario
									</option>
									<option value="09:00">09:00 AM</option>
									<option value="10:00">10:00 AM</option>
									<option value="11:00">11:00 AM</option>
									<option value="12:00">12:00 PM</option>
									<option value="15:00">03:00 PM</option>
									<option value="16:00">04:00 PM</option>
								</select>
								<span className="select-arrow">&#8964;</span>
							</div>
						</div>

						{/* Comentarios */}
						<div className="appointment-field full-width">
							<label htmlFor="notes">Comentarios</label>
							<textarea
								id="notes"
								name="notes"
								placeholder="Describe los síntomas o motivo de la consulta"
								value={formData.notes}
								onChange={handleChange}
								rows={4}
							/>
						</div>

						{/* Botones */}
						<div className="appointment-actions">
							<button
								type="button"
								className="btn-cancel-appointment"
								onClick={handleCancel}
								disabled={isSubmitting}
							>
								Cancelar
							</button>
							<button
								type="submit"
								className="btn-submit-appointment"
								disabled={isSubmitting}
							>
								{isSubmitting ? "⏳ Agendando..." : "Agendar cita"}
							</button>
						</div>
					</form>
				</div>
			</main>

			<FooterGuest />
		</div>
	);
}
