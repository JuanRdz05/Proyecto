import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import { getPetById } from "../../../services/Client/pet.js";
import "./petDetails.css";

export function PetDetails() {
	const { id } = useParams(); // Captura el ID de la URL
	const navigate = useNavigate();

	const [pet, setPet] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchPet = async () => {
			try {
				setLoading(true);
				const data = await getPetById(id);
				setPet(data);
			} catch (err) {
				console.error("Error al cargar la mascota:", err);
				setError("No se pudo cargar la información de la mascota.");
			} finally {
				setLoading(false);
			}
		};
		fetchPet();
	}, [id]);

	// Función auxiliar para etiquetas
	const speciesLabel = (type) => {
		const map = {
			perro: "Perro",
			gato: "Gato",
			conejo: "Conejo",
			ave: "Ave",
			reptil: "Reptil",
			otro: "Otro",
		};
		return map[type] || type;
	};

	if (loading) return <div className="loading">Cargando perfil...</div>;
	if (error) return <div className="error">{error}</div>;

	return (
		<div className="petdetails-page-container">
			<NavbarClient />

			<main className="petdetails-main">
				<div className="petdetails-card">
					<h2 className="petdetails-title">Perfil de {pet.name}</h2>

					{/* Campos de solo lectura */}
					<div className="petdetails-field">
						<label>Nombre</label>
						<input type="text" value={pet.name} readOnly />
					</div>

					<div className="petdetails-field">
						<label>Especie</label>
						<input type="text" value={speciesLabel(pet.petType)} readOnly />
					</div>

					<div className="petdetails-field">
						<label>Fecha de nacimiento</label>
						{/* Asegúrate de que el formato de fecha sea legible */}
						<input
							type="text"
							value={
								pet.birthDate
									? new Date(pet.birthDate).toLocaleDateString()
									: "No registrada"
							}
							readOnly
						/>
					</div>

					<div className="petdetails-field">
						<label>Estado</label>
						<input
							type="text"
							value={pet.isActive ? "Activo" : "Inactivo"}
							readOnly
							className={pet.isActive ? "status-active" : "status-inactive"}
						/>
					</div>

					{/* Botón editar */}
					<div className="petdetails-actions">
						<button
							type="button"
							className="btn-edit-petdetails"
							onClick={() => navigate(`/editar-mascota/${id}`)}
						>
							✏️ Editar mascota
						</button>
					</div>
				</div>
			</main>

			<FooterGuest />
		</div>
	);
}
