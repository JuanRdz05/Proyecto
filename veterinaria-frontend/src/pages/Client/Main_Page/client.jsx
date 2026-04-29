import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import { getPets } from "../../../services/Client/pet.js";
import "./client.css";

export function ClientHome() {
	const navigate = useNavigate();
	const userName = localStorage.getItem("userName") || "User";

	const [pets, setPets] = useState([]);
	const [loadingPets, setLoadingPets] = useState(true);

	useEffect(() => {
		const fetchPets = async () => {
			try {
				setLoadingPets(true);
				const data = await getPets();
				setPets(Array.isArray(data) ? data : []);
			} catch (error) {
				console.error("Error al obtener las mascotas:", error);
				toast.error("No se pudieron cargar las mascotas");
				setPets([]);
			} finally {
				setLoadingPets(false);
			}
		};
		fetchPets();
	}, []);

	// Tomar máximo 3 mascotas
	const petsToShow = pets.slice(0, 3);

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
							{loadingPets ? (
								<div className="item-card item-card-empty">
									<p>Cargando mascotas...</p>
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
