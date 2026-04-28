import { useNavigate } from "react-router-dom";
import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./client.css";

export function ClientHome() {
	const navigate = useNavigate();
	const userName = localStorage.getItem("userName") || "User";

	return (
		<div className="client-page-container">
			<NavbarClient />

			<main className="client-main">
				<h1 className="welcome-text">¡Bienvenido, {userName}!</h1>

				<div className="dashboard-grid">
					{/* Columna Izquierda: Citas */}
					<section className="dashboard-section">
						<div className="section-header">
							<h2>Proximas citas</h2>
							<button
								className="btn-view-all"
								onClick={() => navigate("/historial")}
							>
								Ver todas
							</button>
						</div>

						<div className="list-container">
							{[1, 2, 3].map((i) => (
								<div key={i} className="item-card">
									<div className="item-badge">Cita {i}</div>
									<div className="item-info">
										<p className="item-date">
											10/10/2024, 10:00 - Chequeo Anual
										</p>
									</div>
								</div>
							))}
						</div>
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
							{[
								{ name: "Max", id: 1 },
								{ name: "Bella", id: 2 },
								{ name: "Charlie", id: 3 },
							].map((pet) => (
								<div key={pet.name} className="item-card">
									<div className="pet-icon">🐾</div>
									<div className="item-info">
										<p className="pet-name">{pet.name}</p>
									</div>
									<button
										className="btn-edit"
										onClick={() => navigate(`/detalles-mascota/${pet.id}`)}
									>
										Detalles
									</button>
								</div>
							))}
						</div>
					</section>
				</div>
			</main>

			<FooterGuest />
		</div>
	);
}
