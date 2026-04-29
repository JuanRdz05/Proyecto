import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import { getPets } from "../../../services/Client/pet.js";
import { getAllServices } from "../../../services/Admin/services.js";
import "./appointment.css";

export function Appointment() {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		mascota: "",
		servicio: "",
		fecha: "",
		veterinario: "",
		horario: "",
		comentarios: "",
	});

	const [pets, setPets] = useState([]);
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);

	// Cargar mascotas y servicios al montar el componente
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);

				const [petsData, servicesData] = await Promise.all([
					getPets(),
					getAllServices(),
				]);

				// Ajusta según la estructura de tu backend
				const petsList = petsData.pets || petsData || [];
				const servicesList = servicesData.services || servicesData || [];

				setPets(petsList);
				setServices(servicesList);
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

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Cita agendada:", formData);
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
								<label htmlFor="mascota">Mascota</label>
								<div className="select-wrapper">
									<select
										id="mascota"
										name="mascota"
										value={formData.mascota}
										onChange={handleChange}
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
												<option
													key={pet._id || pet.id}
													value={pet._id || pet.id}
												>
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
								<label htmlFor="servicio">Servicio</label>
								<div className="select-wrapper">
									<select
										id="servicio"
										name="servicio"
										value={formData.servicio}
										onChange={handleChange}
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
												<option
													key={svc._id || svc.id}
													value={svc._id || svc.id}
												>
													{svc.name}
												</option>
											))
										)}
									</select>
									<span className="select-arrow">&#8964;</span>
								</div>
							</div>
						</div>

						{/* Fecha */}
						<div className="appointment-field full-width">
							<label htmlFor="fecha">Fecha</label>
							<div className="input-icon-wrapper">
								<input
									type="date"
									id="fecha"
									name="fecha"
									value={formData.fecha}
									onChange={handleChange}
								/>
							</div>
						</div>
						{/* Horarios disponibles */}
						<div className="appointment-field full-width">
							<label htmlFor="horario">Horarios disponibles</label>
							<div className="select-wrapper">
								<select
									id="horario"
									name="horario"
									value={formData.horario}
									onChange={handleChange}
								>
									<option value="" disabled></option>
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
							<label htmlFor="comentarios">Comentarios</label>
							<textarea
								id="comentarios"
								name="comentarios"
								placeholder="Describe los síntomas"
								value={formData.comentarios}
								onChange={handleChange}
								rows={4}
							/>
						</div>

						{/* Botones */}
						<div className="appointment-actions">
							<button
								type="button"
								className="btn-cancel-appointment"
								onClick={() => navigate(-1)}
							>
								Cancelar
							</button>
							<button type="submit" className="btn-submit-appointment">
								Agendar cita
							</button>
						</div>
					</form>
				</div>
			</main>

			<FooterGuest />
		</div>
	);
}
