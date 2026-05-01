import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NavbarVet } from "../../../components/NavbarVet/navbarVet.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import { getProfile } from "../../../services/Client/profile.js";
import "./vets.css";

// Datos placeholder
const STATS = {
	total: 8,
	completed: 5,
	pending: 3,
};

const ALL_APPOINTMENTS = [
	{
		id: 1,
		time: "10:00 AM",
		owner: "Carlos Ruiz",
		pet: "Max",
		service: "Chequeo Anual",
	},
	{
		id: 2,
		time: "11:30 AM",
		owner: "María López",
		pet: "Charlie",
		service: "Vacunación",
	},
	{
		id: 3,
		time: "2:30 PM",
		owner: "Ana Martínez",
		pet: "Bella",
		service: "Consulta",
	},
	{
		id: 4,
		time: "3:00 PM",
		owner: "Roberto Silva",
		pet: "Luna",
		service: "Desparasitación",
	},
	{
		id: 5,
		time: "3:45 PM",
		owner: "Laura Vega",
		pet: "Toby",
		service: "Cirugía menor",
	},
	{
		id: 6,
		time: "4:15 PM",
		owner: "Jorge Mendoza",
		pet: "Rocky",
		service: "Vacunación",
	},
	{
		id: 7,
		time: "4:50 PM",
		owner: "Sofía Herrera",
		pet: "Mia",
		service: "Chequeo Anual",
	},
	{
		id: 8,
		time: "5:30 PM",
		owner: "Diego Torres",
		pet: "Coco",
		service: "Consulta",
	},
];

const INITIAL_COUNT = 3;

export function VetHome() {
	const navigate = useNavigate();
	const userName = localStorage.getItem("userName") || "Doctor";
	const [showAll, setShowAll] = useState(false);
	const [isActive, setIsActive] = useState(true);
	const [checking, setChecking] = useState(true);

	// Verificar estado del veterinario al cargar
	useEffect(() => {
		const checkStatus = async () => {
			try {
				const data = await getProfile();
				if (data.isActive === false) {
					setIsActive(false);
				}
			} catch (error) {
				console.error("Error al verificar estado:", error);
				toast.error("Error al verificar tu estado.", {
					position: "top-right",
					autoClose: 4000,
				});
			} finally {
				setChecking(false);
			}
		};
		checkStatus();
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

	// Mostrar loading mientras verifica
	if (checking) {
		return (
			<div className="vet-page-container">
				<div className="vet-loading-screen">
					<p>Verificando tu estado...</p>
				</div>
			</div>
		);
	}

	// Si el veterinario está inactivo, mostrar pantalla de bloqueo
	if (!isActive) {
		return (
			<div className="vet-page-container">
				<div className="vet-blocked-screen">
					<div className="vet-blocked-card">
						<div className="blocked-icon">🚫</div>
						<h2>Cuenta desactivada</h2>
						<p>
							Tu cuenta ha sido desactivada por un administrador.
							<br />
							No puedes acceder al sistema en este momento.
						</p>
						<p className="blocked-contact">
							Si crees que esto es un error, contacta al administrador del
							sistema.
						</p>
						<button className="btn-logout-blocked" onClick={handleLogout}>
							Cerrar sesión
						</button>
					</div>
				</div>
			</div>
		);
	}

	const visibleAppointments = showAll
		? ALL_APPOINTMENTS
		: ALL_APPOINTMENTS.slice(0, INITIAL_COUNT);

	return (
		<div className="vet-page-container">
			<NavbarVet />

			<main className="vet-main">
				<h1 className="vet-welcome">¡Bienvenido, Dr. {userName}!</h1>

				<div className="vet-stats-grid">
					<div className="vet-stat-card">
						<p className="stat-label">Citas del día de hoy</p>
						<span className="stat-value">{STATS.total}</span>
					</div>
					<div className="vet-stat-card">
						<p className="stat-label">Completadas</p>
						<span className="stat-value">{STATS.completed}</span>
					</div>
					<div className="vet-stat-card">
						<p className="stat-label">Pendientes</p>
						<span className="stat-value">{STATS.pending}</span>
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
						{visibleAppointments.map((apt, index) => (
							<div
								key={apt.id}
								className={`vet-apt-row ${index < visibleAppointments.length - 1 ? "with-divider" : ""}`}
							>
								<div className="vet-apt-info">
									<p className="vet-apt-time">
										{apt.time} — <strong>{apt.owner}</strong>
									</p>
									<p className="vet-apt-detail">
										{apt.pet} · {apt.service}
									</p>
								</div>
								<button
									className="btn-atender"
									onClick={() => navigate(`/atender-cita/${apt.id}`)}
								>
									Atender
								</button>
							</div>
						))}
					</div>
				</section>
			</main>

			<FooterGuest />
		</div>
	);
}
