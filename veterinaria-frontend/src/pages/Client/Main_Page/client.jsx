import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import { getPets } from "../../../services/Client/pet.js";
import { getUserAppointments } from "../../../services/Client/appointment.js";
import { getProfile } from "../../../services/Client/profile.js";
import "./client.css";

export function ClientHome() {
	const navigate = useNavigate();
	const userName = localStorage.getItem("userName") || "User";

	const [pets, setPets] = useState([]);
	const [appointments, setAppointments] = useState([]);
	const [loadingPets, setLoadingPets] = useState(true);
	const [loadingAppointments, setLoadingAppointments] = useState(true);
	const [petsError, setPetsError] = useState(false);
	const [appointmentsError, setAppointmentsError] = useState(false);
	const [isActive, setIsActive] = useState(true);
	const [checking, setChecking] = useState(true);

	useEffect(() => {
		// Verificar estado del cliente primero
		const checkStatus = async () => {
			try {
				const data = await getProfile();
				if (data.isActive === false) {
					setIsActive(false);
				}
			} catch (error) {
				console.error("Error al verificar estado:", error);
			} finally {
				setChecking(false);
			}
		};

		const fetchPets = async () => {
			try {
				setLoadingPets(true);
				setPetsError(false);
				const data = await getPets();
				if (Array.isArray(data)) {
					setPets(data);
				} else if (data && Array.isArray(data.pets)) {
					setPets(data.pets);
				} else {
					setPets([]);
				}
			} catch (error) {
				if (
					error.message &&
					!error.message.includes("No hay") &&
					!error.message.includes("no encontrado")
				) {
					toast.error("No se pudieron cargar las mascotas");
				}
				setPetsError(true);
				setPets([]);
			} finally {
				setLoadingPets(false);
			}
		};

		const fetchAppointments = async () => {
			try {
				setLoadingAppointments(true);
				setAppointmentsError(false);
				const data = await getUserAppointments();
				if (data && Array.isArray(data.appointments)) {
					setAppointments(data.appointments);
				} else if (Array.isArray(data)) {
					setAppointments(data);
				} else {
					setAppointments([]);
				}
			} catch (error) {
				if (
					error.message &&
					!error.message.includes("No hay") &&
					!error.message.includes("no encontrado")
				) {
					toast.error("No se pudieron cargar las citas");
				}
				setAppointmentsError(true);
				setAppointments([]);
			} finally {
				setLoadingAppointments(false);
			}
		};

		checkStatus();
		fetchPets();
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
			setTimeout(() => {
				navigate("/inicio-sesion");
			}, 1500);
		}
	};

	const petsToShow = pets.slice(0, 3);

	const todayStr = new Date().toISOString().split("T")[0];

	const upcomingAppointments = appointments
		.filter((apt) => apt.date >= todayStr && apt.status !== "Cancelada")
		.sort((a, b) => {
			const dateTimeA = `${a.date}T${a.time}`;
			const dateTimeB = `${b.date}T${b.time}`;
			return dateTimeA.localeCompare(dateTimeB);
		})
		.slice(0, 3);

	const formatDateTime = (dateStr, timeStr) => {
		if (!dateStr || !timeStr) return "Fecha no disponible";
		const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
		const [year, month, day] = cleanDate.split("-").map(Number);
		if (!year || !month || !day) return "Fecha no disponible";
		const date = new Date(year, month - 1, day);
		if (isNaN(date.getTime())) return "Fecha no disponible";
		return (
			date.toLocaleDateString("es-MX", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			}) + `, ${timeStr}`
		);
	};

	const StatusBadge = ({ status }) => {
		const colors = {
			Pendiente: "#ffc107",
			Aceptada: "#28a745",
			"En progreso": "#007bff",
			Terminada: "#6c757d",
			Cancelada: "#dc3545",
			Rechazada: "#dc3545",
		};
		const currentColor = colors[status] || "#6c757d";
		return (
			<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
				<span
					className="status-dot-home"
					style={{
						backgroundColor: currentColor,
						display: "inline-block",
						width: "12px",
						height: "12px",
						borderRadius: "50%",
					}}
					title={status}
				/>
				<span
					style={{
						color: currentColor,
						fontWeight: "600",
						fontSize: "0.85rem",
						textTransform: "capitalize",
					}}
				>
					{status}
				</span>
			</div>
		);
	};

	// ── Pantalla de carga mientras verifica ──────────────────────────────────
	if (checking) {
		return (
			<div className="client-page-container">
				<div className="client-loading-screen">
					<p>Cargando...</p>
				</div>
			</div>
		);
	}

	// ── Pantalla de cuenta desactivada ───────────────────────────────────────
	if (!isActive) {
		return (
			<div className="client-page-container">
				<div className="client-blocked-screen">
					<div className="client-blocked-card">
						<div className="blocked-icon">🚫</div>
						<h2>Cuenta desactivada</h2>
						<p>
							Tu cuenta ha sido desactivada temporalmente.
							<br />
							No puedes acceder a tus mascotas ni agendar citas en este momento.
						</p>
						<p className="blocked-contact">
							Si crees que esto es un error, comunícate con la clínica para
							recibir más información.
						</p>
						<button className="btn-logout-blocked" onClick={handleLogout}>
							Cerrar sesión
						</button>
					</div>
				</div>
			</div>
		);
	}

	// ── Vista normal ─────────────────────────────────────────────────────────
	return (
		<div className="client-page-container">
			<NavbarClient />

			<main className="client-main">
				<h1 className="welcome-text">¡Bienvenido, {userName}!</h1>

				<div className="dashboard-grid">
					{/* Columna Izquierda: Citas */}
					<section className="dashboard-section">
						<div className="section-header">
							<h2>Próximas citas</h2>
							<button
								className="btn-add"
								onClick={() => navigate("/agendar-cita")}
							>
								+ Agendar cita
							</button>
						</div>

						<div className="list-container">
							{loadingAppointments ? (
								<div className="item-card item-card-empty">
									<p>Cargando citas...</p>
								</div>
							) : appointmentsError ? (
								<div className="item-card item-card-empty">
									<p>Error al cargar citas. Intenta de nuevo.</p>
								</div>
							) : upcomingAppointments.length === 0 ? (
								<div className="item-card item-card-empty">
									<p>No tienes citas próximas</p>
								</div>
							) : (
								upcomingAppointments.map((apt) => (
									<div
										key={apt._id}
										className="item-card item-card-appointment"
									>
										<div className="appointment-status">
											<StatusBadge status={apt.status} />
										</div>
										<div className="item-info">
											<p className="appointment-service">
												{apt.service?.name || "Servicio"}
											</p>
											<p className="item-date">
												{formatDateTime(apt.date, apt.time)} -{" "}
												{apt.pet?.name || "Mascota"}
											</p>
										</div>
									</div>
								))
							)}
						</div>

						{appointments.length > 3 && (
							<div className="view-more-container">
								<button
									className="btn-view-all"
									onClick={() => navigate("/historial")}
								>
									Ver todas las citas
								</button>
							</div>
						)}
					</section>

					{/* Columna Derecha: Mascotas */}
					<section className="dashboard-section">
						<div className="section-header">
							<h2>Mis Mascotas</h2>
							<button
								className="btn-add"
								onClick={() => navigate("/nueva-mascota")}
							>
								+ Agregar nueva mascota
							</button>
						</div>

						<div className="list-container">
							{loadingPets ? (
								<div className="item-card item-card-empty">
									<p>Cargando mascotas...</p>
								</div>
							) : petsError ? (
								<div className="item-card item-card-empty">
									<p>Error al cargar mascotas. Intenta de nuevo.</p>
								</div>
							) : petsToShow.length === 0 ? (
								<div className="item-card item-card-empty">
									<p>No tienes mascotas registradas</p>
								</div>
							) : (
								petsToShow.map((pet) => (
									<div key={pet._id || pet.id} className="item-card">
										<div className="pet-icon">🐾</div>
										<div className="item-info">
											<p className="pet-name">{pet.name}</p>
											<p className="pet-type">{pet.petType}</p>
										</div>
										<button
											className="btn-edit"
											onClick={() =>
												navigate(`/detalles-mascota/${pet._id || pet.id}`)
											}
										>
											Detalles
										</button>
									</div>
								))
							)}
						</div>

						{pets.length > 3 && (
							<div className="view-more-container">
								<button
									className="btn-view-all"
									onClick={() => navigate("/mascotas")}
								>
									Ver todas las mascotas
								</button>
							</div>
						)}
					</section>
				</div>
			</main>

			<FooterGuest />
		</div>
	);
}
