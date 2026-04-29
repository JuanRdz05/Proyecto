import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import {
	getPetById,
	updatePet,
	togglePetStatus,
} from "../../../services/Client/pet.js";
import "./petDetails.css";

export function PetDetails() {
	const { id } = useParams();
	const navigate = useNavigate();

	const [pet, setPet] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({});
	const [especieOtro, setEspecieOtro] = useState("");

	const OPCIONES_PREDEFINIDAS = ["Perro", "Gato", "Conejo", "Ave", "Reptil"];

	const fetchPet = async () => {
		try {
			setLoading(true);
			const data = await getPetById(id);
			setPet(data);
		} catch (err) {
			setError("No se pudo cargar la información.");
			toast.error("Error al cargar los datos de la mascota");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPet();
	}, [id]);

	const handleEditClick = () => {
		const esPredefinida = OPCIONES_PREDEFINIDAS.includes(pet.petType);

		setFormData({
			name: pet.name,
			petType: esPredefinida ? pet.petType : "Otro",
			birthDate: pet.birthDate ? pet.birthDate.split("T")[0] : "",
		});
		setEspecieOtro(esPredefinida ? "" : pet.petType);
		setIsEditing(true);
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleEspecieOtroChange = (e) => {
		const filteredValue = e.target.value.replace(
			/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g,
			"",
		);
		setEspecieOtro(filteredValue);
	};

	const handleSave = async () => {
		if (!formData.name.trim()) {
			toast.warning("El nombre de la mascota no puede estar vacío");
			return;
		}

		if (formData.petType === "Otro") {
			if (!especieOtro.trim()) {
				toast.warning("Especifique la especie de la mascota");
				return;
			}
			if (especieOtro.trim().length > 50) {
				toast.warning("La especie no puede exceder 50 caracteres");
				return;
			}
			if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(especieOtro.trim())) {
				toast.warning("La especie solo debe contener letras y espacios");
				return;
			}
		}

		const petDataToSave = {
			...formData,
			petType:
				formData.petType === "Otro" ? especieOtro.trim() : formData.petType,
		};

		try {
			await updatePet(id, petDataToSave);
			setPet({
				...pet,
				name: formData.name,
				petType: petDataToSave.petType,
				birthDate: formData.birthDate,
			});
			setIsEditing(false);
			setEspecieOtro("");
			toast.success("Mascota actualizada correctamente");
		} catch (err) {
			console.error("Error al guardar:", err);
			toast.error("Error al guardar la información");
		}
	};

	const handleCancel = () => {
		setIsEditing(false);
		setEspecieOtro("");
	};

	const handleToggleStatus = async () => {
		try {
			const newStatus = !pet.isActive;
			await togglePetStatus(id);
			setPet({ ...pet, isActive: newStatus });

			if (newStatus) {
				toast.success("Mascota reactivada");
			} else {
				toast.error("Mascota desactivada");
			}
		} catch (err) {
			console.error("Error al cambiar el estatus:", err);
			toast.error("Error al cambiar el estatus");
		}
	};

	if (loading) return <div>Cargando...</div>;

	return (
		<div className="petdetails-page-container">
			<NavbarClient />
			<main className="petdetails-main">
				<div className="petdetails-card">
					<div className="petdetails-header">
						<div className="petdetails-header-left">
							<h2 className="petdetails-title">Perfil de {pet.name}</h2>
							<div
								className={`pet-status-badge ${pet.isActive ? "status-active" : "status-inactive"}`}
							>
								<span className="status-dot"></span>
								<span className="status-text">
									{pet.isActive ? "Activo" : "Inactivo"}
								</span>
							</div>
						</div>
						{!isEditing && (
							<button
								onClick={handleToggleStatus}
								className={`btn-status-toggle ${pet.isActive ? "active-btn" : "inactive-btn"}`}
								title={
									pet.isActive ? "Desactivar mascota" : "Reactivar mascota"
								}
							>
								{pet.isActive ? "Desactivar" : "Reactivar"}
							</button>
						)}
					</div>

					<div className="petdetails-field">
						<label>Nombre</label>
						<input
							type="text"
							name="name"
							value={isEditing ? formData.name : pet.name}
							onChange={handleChange}
							readOnly={!isEditing}
							className={isEditing ? "input-editable" : ""}
						/>
					</div>

					<div className="petdetails-field">
						<label>Especie</label>
						{isEditing ? (
							<div className="select-wrapper-pa">
								<select
									name="petType"
									value={formData.petType}
									onChange={handleChange}
									className="input-editable"
								>
									<option value="Perro">Perro</option>
									<option value="Gato">Gato</option>
									<option value="Conejo">Conejo</option>
									<option value="Ave">Ave</option>
									<option value="Reptil">Reptil</option>
									<option value="Otro">Otro</option>
								</select>
								<span className="select-arrow-pa">&#8964;</span>
							</div>
						) : (
							<input
								type="text"
								value={
									pet.petType.charAt(0).toUpperCase() + pet.petType.slice(1)
								}
								readOnly
							/>
						)}
					</div>

					{/* Input extra solo en modo edición y cuando petType es "Otro" */}
					{isEditing && formData.petType === "Otro" && (
						<div className="petdetails-field petdetails-field-extra">
							<label>
								¿Qué especie es? <span style={{ color: "#dc3545" }}>*</span>
							</label>
							<input
								type="text"
								name="especieOtro"
								value={especieOtro}
								onChange={handleEspecieOtroChange}
								placeholder="Ej: Hámster, Cobaya, Tortuga"
								className="input-editable"
								maxLength="50"
							/>
							<span className="char-count">{especieOtro.length}/50</span>
						</div>
					)}

					<div className="petdetails-field">
						<label>Fecha de nacimiento</label>
						{isEditing ? (
							<input
								type="date"
								name="birthDate"
								value={formData.birthDate}
								onChange={handleChange}
								className="input-editable"
							/>
						) : (
							<input
								type="text"
								value={
									pet.birthDate
										? new Date(pet.birthDate).toLocaleDateString()
										: "No registrada"
								}
								readOnly
							/>
						)}
					</div>

					<div className="petdetails-actions">
						{isEditing ? (
							<>
								<button className="btn-cancel" onClick={handleCancel}>
									Cancelar
								</button>
								<button className="btn-save" onClick={handleSave}>
									Guardar
								</button>
							</>
						) : (
							<button className="btn-edit-petdetails" onClick={handleEditClick}>
								Editar
							</button>
						)}
					</div>
				</div>
			</main>
			<FooterGuest />
		</div>
	);
}
