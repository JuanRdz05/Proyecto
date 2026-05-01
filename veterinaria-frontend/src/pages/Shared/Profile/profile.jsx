import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
	getProfile,
	updateProfileData,
} from "../../../services/Client/profile.js";
import "./profile.css";

export function Profile() {
	const navigate = useNavigate();
	const fileInputRef = useRef(null);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Estados para la edición
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		paternalLastName: "",
		maternalLastName: "",
		email: "",
		profilePicture: null,
	});
	const [previewImage, setPreviewImage] = useState(null);
	const [updateError, setUpdateError] = useState(null);

	useEffect(() => {
		getProfile()
			.then((data) => {
				setUser(data);
				setFormData({
					name: data.name || "",
					paternalLastName: data.paternalLastName || "",
					maternalLastName: data.maternalLastName || "",
					email: data.email || "",
					profilePicture: null,
				});
				setPreviewImage(data.profilePicture || null);
				setLoading(false);
			})
			.catch(() => {
				setError(
					"No se pudo cargar el perfil. Intenta iniciar sesión de nuevo.",
				);
				setLoading(false);
			});
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Validar que sea imagen
			if (!file.type.startsWith("image/")) {
				setUpdateError("Por favor selecciona un archivo de imagen válido");
				toast.error("Formato de imagen no válido. Usa JPG, PNG, WebP o GIF.");
				return;
			}
			// Validar tamaño (máx 5MB)
			if (file.size > 5 * 1024 * 1024) {
				setUpdateError("La imagen no debe superar los 5MB");
				toast.error("La imagen es demasiado grande. Máximo 5MB.");
				return;
			}

			setFormData((prev) => ({ ...prev, profilePicture: file }));
			setUpdateError(null);
			toast.info("Imagen seleccionada. Recuerda guardar los cambios.");

			// Crear preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewImage(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleCancel = () => {
		setIsEditing(false);
		setUpdateError(null);
		setFormData({
			name: user.name || "",
			paternalLastName: user.paternalLastName || "",
			maternalLastName: user.maternalLastName || "",
			email: user.email || "",
			profilePicture: null,
		});
		setPreviewImage(user.profilePicture || null);
		toast.info("Cambios cancelados.");
	};

	const handleSave = async () => {
		try {
			setUpdateError(null);
			const response = await updateProfileData(formData);

			setUser(response.user);
			setIsEditing(false);
			setPreviewImage(response.user.profilePicture || null);
			toast.success("¡Perfil actualizado con éxito!");
		} catch (error) {
			setUpdateError(error.message);
			toast.error(error.message || "Error al actualizar el perfil.");
		}
	};

	const handleLogout = async () => {
		try {
			await fetch("http://localhost:3050/users/v1/logout", {
				method: "POST",
				credentials: "include",
			});
			toast.success("Sesión cerrada correctamente.");
		} catch (e) {
			toast.error("Error al cerrar sesión en el servidor.");
		} finally {
			localStorage.clear();
			setTimeout(() => {
				navigate("/inicio-sesion");
			}, 1500); // Pequeña pausa para que se vea el toast
		}
	};

	if (loading) {
		return (
			<div className="profile-container">
				<div className="profile-loading">Cargando perfil...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="profile-container">
				<div className="profile-error">{error}</div>
			</div>
		);
	}

	return (
		<div className="profile-container">
			<div className="profile-form">
				<button
					type="button"
					className="btn-close-card"
					onClick={() => navigate(-1)}
					title="Regresar"
				>
					&times;
				</button>

				<h2>Mi Perfil</h2>

				{/* Foto de perfil con opción de cambiar */}
				<div className="profile-pic-wrapper">
					<div className="profile-pic-placeholder">
						{previewImage ? (
							<img
								src={previewImage}
								alt="Foto de perfil"
								className="profile-pic-preview"
							/>
						) : (
							<svg
								className="profile-pic-icon-placeholder"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
								<circle cx="12" cy="7" r="4"></circle>
							</svg>
						)}
					</div>

					{isEditing && (
						<button
							type="button"
							className="btn-change-photo"
							onClick={() => fileInputRef.current?.click()}
						>
							Cambiar foto
						</button>
					)}

					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleImageChange}
						style={{ display: "none" }}
					/>
				</div>

				{updateError && <div className="update-error-msg">{updateError}</div>}

				{/* El username es readOnly siempre */}
				<div className="profile-field">
					<label>Nombre de Usuario</label>
					<input
						type="text"
						value={user?.username || ""}
						readOnly
						className="input-readonly"
					/>
				</div>

				<div className="profile-field">
					<label>Nombre</label>
					<input
						type="text"
						name="name"
						value={isEditing ? formData.name : user?.name || ""}
						readOnly={!isEditing}
						onChange={handleChange}
						className={!isEditing ? "input-readonly" : ""}
					/>
				</div>

				<div className="profile-field">
					<label>Apellido Paterno</label>
					<input
						type="text"
						name="paternalLastName"
						value={
							isEditing
								? formData.paternalLastName
								: user?.paternalLastName || ""
						}
						readOnly={!isEditing}
						onChange={handleChange}
						className={!isEditing ? "input-readonly" : ""}
					/>
				</div>

				<div className="profile-field">
					<label>Apellido Materno</label>
					<input
						type="text"
						name="maternalLastName"
						value={
							isEditing
								? formData.maternalLastName
								: user?.maternalLastName || ""
						}
						readOnly={!isEditing}
						onChange={handleChange}
						className={!isEditing ? "input-readonly" : ""}
					/>
				</div>

				<div className="profile-field">
					<label>Correo Electrónico</label>
					<input
						type="email"
						name="email"
						value={isEditing ? formData.email : user?.email || ""}
						readOnly={!isEditing}
						onChange={handleChange}
						className={!isEditing ? "input-readonly" : ""}
					/>
				</div>

				<div className="profile-actions">
					{isEditing ? (
						<>
							<button
								type="button"
								className="btn-save-profile"
								onClick={handleSave}
							>
								Guardar cambios
							</button>
							<button
								type="button"
								className="btn-cancel-profile"
								onClick={handleCancel}
							>
								Cancelar
							</button>
						</>
					) : (
						<>
							<button
								type="button"
								className="btn-edit-profile"
								onClick={() => setIsEditing(true)}
							>
								Editar perfil
							</button>
							<button
								type="button"
								className="btn-logout"
								onClick={handleLogout}
							>
								Cerrar sesión
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
