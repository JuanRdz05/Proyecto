import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./pets.css";
import { getPets } from "../../../services/Client/pet.js";

export function Pets() {
	const navigate = useNavigate();
	const [pets, setPets] = useState([]);

	useEffect(() => {
		const fetchPets = async () => {
			try {
				const data = await getPets();
				setPets(data);
			} catch (error) {
				console.error("Error al obtener las mascotas:", error);
			}
		};
		fetchPets();
	}, []);

	return (
		<div className="pets-page-container">
			<NavbarClient />

			<main className="pets-main">
				<div className="pets-card">
					{/* Encabezado */}
					<div className="pets-header">
						<h2 className="pets-title">Mis mascotas</h2>
						<button
							className="btn-add-pet"
							onClick={() => navigate("/nueva-mascota")}
						>
							+ Agregar mascota
						</button>
					</div>

					{/* Lista */}
					<ul className="pets-list">
						{pets.map((pet, index) => (
							<li
								key={pet.id}
								className={`pets-list-item ${index < pets.length - 1 ? "with-divider" : ""}`}
							>
								<span className="pet-label">
									{pet.name} - {pet.petType}
								</span>
								<button
									className="btn-edit-pet"
									onClick={() => navigate(`/detalles-mascota/${pet._id}`)}
								>
									Detalles
								</button>
							</li>
						))}
					</ul>
				</div>
			</main>

			<FooterGuest />
		</div>
	);
}
