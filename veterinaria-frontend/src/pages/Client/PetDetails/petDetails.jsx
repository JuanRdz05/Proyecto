import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageTransition } from "../../../components/PageTransition/PageTransition.jsx";
import { toast } from "react-toastify";
import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import {
	getPetById,
	updatePet,
	togglePetStatus,
	deletePet,
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
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false); // Estado para controlar la visibilidad del modal[cite: 3]

	const OPCIONES_PREDEFINIDAS = ["Perro", "Gato", "Conejo", "Ave", "Reptil"];

	const fetchPet = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getPetById(id);
			setPet(data);
		} catch (err) {
			setError("No se pudo cargar la información de la mascota.");
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

		if (formData.petType === "Otro" && !especieOtro.trim()) {
			toast.warning("Debes especificar una especie");
			return;
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
			toast.error("Error al guardar la información");
		}
	};

	const handleCancel = () => {
		setIsEditing(false);
		setEspecieOtro("");
	};

	const handleToggleStatus = async () => {
		try {
			const response = await togglePetStatus(id);
			setPet({
				...pet,
				isActive: response.pet.isActive,
				disabledByAdmin: response.pet.disabledByAdmin,
			});
			toast.success(
				response.pet.isActive ? "Mascota reactivada" : "Mascota desactivada",
			);
		} catch (err) {
			toast.error(err.message || "No se pudo cambiar el estatus");
		}
	};

	// Función que ejecuta la eliminación definitiva tras la confirmación en el modal[cite: 3]
	const handleDeleteConfirm = async () => {
		setIsDeleting(true);
		try {
			await deletePet(id);
			setShowDeleteModal(false);
			toast.success(`"${pet.name}" ha sido eliminado permanentemente`, {
				position: "top-right",
				autoClose: 2000,
				onClose: () => navigate("/mascotas"),
			});
		} catch (err) {
			setIsDeleting(false);
			toast.error(
				err.message || "No se pudo eliminar la mascota. Inténtalo de nuevo.",
			);
		}
	};

	if (loading) {
		return (
			<div className="petdetails-page-container">
				<NavbarClient />
				<PageTransition>
					<main className="petdetails-main">
						<div className="loading-container">Cargando información...</div>
					</main>
				</PageTransition>
			</div>
		);
	}

	if (error || !pet) {
		return (
			<div className="petdetails-page-container">
				<NavbarClient />
				<PageTransition>
					<main className="petdetails-main">
						<div className="loading-container">
							{error || "No se encontró la mascota"}
						</div>
					</main>
				</PageTransition>
			</div>
		);
	}

	const adminLocked = !pet.isActive && pet.disabledByAdmin;

	return (
		<div className="petdetails-page-container">
			<NavbarClient />
			<PageTransition>
				<main className="petdetails-main">
					<div
						className={`petdetails-card ${adminLocked ? "pet-card-locked" : ""}`}
					>
						{/* Aviso administrativo */}
						{adminLocked && (
							<div className="admin-lock-notice">
								<p>
									<strong>Aviso de la Administración:</strong> Esta mascota ha
									sido desactivada por un administrador. No puedes reactivarla
									manualmente. Por favor, contacta a soporte.
								</p>
							</div>
						)}

						{/* Encabezado */}
						<div className="petdetails-header">
							<div className="petdetails-header-left">
								<h2 className="petdetails-title">
									Perfil de {pet.name}
									{adminLocked && (
										<span className="admin-lock-label">
											BLOQUEADA POR ADMIN
										</span>
									)}
								</h2>

								{/* Badge de estado */}
								<div
									className={`pet-status-badge ${
										pet.isActive
											? "status-active"
											: pet.disabledByAdmin
												? "status-admin-lock"
												: "status-inactive"
									}`}
								>
									<span className="status-dot"></span>
									<span className="status-text">
										{pet.isActive
											? "Activa"
											: pet.disabledByAdmin
												? "Suspendida"
												: "Inactiva"}
									</span>
								</div>
							</div>

							{!isEditing && (
								<button
									onClick={handleToggleStatus}
									className={`btn-status-toggle ${
										pet.isActive ? "active-btn" : "inactive-btn"
									}`}
									disabled={adminLocked || isDeleting}
									title={
										adminLocked ? "Acción restringida por el administrador" : ""
									}
								>
									{pet.isActive ? "Desactivar" : "Reactivar"}
								</button>
							)}
						</div>

						{/* Campos del formulario */}
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
										{OPCIONES_PREDEFINIDAS.map((op) => (
											<option key={op} value={op}>
												{op}
											</option>
										))}
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
									placeholder="Ej: Hámster"
									className="input-editable"
									maxLength={50}
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
								<button
									className="btn-edit-petdetails"
									onClick={handleEditClick}
									disabled={adminLocked || isDeleting}
								>
									{adminLocked ? "Edición restringida" : "Editar"}
								</button>
							)}
						</div>

						{!isEditing && (
							<div className="petdetails-danger-zone">
								<button
									className="btn-delete-pet"
									onClick={() => setShowDeleteModal(true)} // Abre el modal de confirmación[cite: 3]
									disabled={isDeleting}
								>
									Eliminar mascota
								</button>
							</div>
						)}
					</div>

					{/* Estructura del Modal de Confirmación[cite: 3] */}
					{showDeleteModal && (
						<div className="pet-modal-overlay">
							<div className="pet-modal-content">
								<h3>¿Eliminar a {pet.name}?</h3>
								<p>
									Esta acción es permanente y no se puede deshacer. ¿Estás
									seguro de que deseas continuar?
								</p>
								<div className="pet-modal-actions">
									<button
										className="btn-modal-cancel"
										onClick={() => setShowDeleteModal(false)}
										disabled={isDeleting}
									>
										Cancelar
									</button>
									<button
										className="btn-modal-confirm"
										onClick={handleDeleteConfirm}
										disabled={isDeleting}
									>
										{isDeleting ? "Eliminando..." : "Sí, eliminar"}
									</button>
								</div>
							</div>
						</div>
					)}
				</main>
			</PageTransition>
			<FooterGuest />
		</div>
	);
}
