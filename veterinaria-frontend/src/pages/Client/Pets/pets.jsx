import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./pets.css";
import { getPets } from "../../../services/Client/pet.js";

const ITEMS_PER_PAGE = 6;

export function Pets() {
	const navigate = useNavigate();
	const [pets, setPets] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);

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

	// Lógica de paginación
	const totalPages = Math.ceil(pets.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const paginatedPets = pets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	const goToPage = (page) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

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

					{pets.length === 0 ? (
						<div className="pets-empty">
							<p>No tienes mascotas registradas.</p>
						</div>
					) : (
						<>
							{/* Lista */}
							<ul className="pets-list">
								{paginatedPets.map((pet, index) => (
									<li
										key={pet._id || pet.id}
										className={`pets-list-item ${index < paginatedPets.length - 1 ? "with-divider" : ""}`}
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

							{/* Controles de Paginación */}
							{totalPages > 1 && (
								<div className="pagination">
									<button
										className="pagination-btn"
										onClick={() => goToPage(currentPage - 1)}
										disabled={currentPage === 1}
									>
										← Anterior
									</button>

									<div className="pagination-pages">
										{Array.from({ length: totalPages }, (_, i) => i + 1).map(
											(page) => (
												<button
													key={page}
													className={`pagination-page ${page === currentPage ? "active" : ""}`}
													onClick={() => goToPage(page)}
												>
													{page}
												</button>
											),
										)}
									</div>

									<button
										className="pagination-btn"
										onClick={() => goToPage(currentPage + 1)}
										disabled={currentPage === totalPages}
									>
										Siguiente →
									</button>
								</div>
							)}

							<div className="pagination-info">
								Mostrando página {currentPage} de {totalPages}
							</div>
						</>
					)}
				</div>
			</main>

			<FooterGuest />
		</div>
	);
}
