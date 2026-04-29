import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./petAdd.css";
import { addPet } from "../../../services/Client/pet.js";

export function PetAdd() {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		name: "",
		fechaNacimiento: "",
		petType: "",
		especieOtro: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState({});

	const handleChange = (e) => {
		const { name, value } = e.target;

		// Para nombre y especieOtro: solo permitir letras y espacios
		if ((name === "name" || name === "especieOtro") && value) {
			// Permitir solo letras (incluyendo acentos), ñ y espacios
			const filteredValue = value.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g, "");

			setFormData((prev) => ({
				...prev,
				[name]: filteredValue,
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}

		// Limpiar errores cuando el usuario empieza a escribir
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	// Validación del formulario
	const validateForm = () => {
		const newErrors = {};

		// Validar nombre
		if (!formData.name.trim()) {
			newErrors.name = "El nombre de la mascota es obligatorio";
		} else if (formData.name.trim().length < 2) {
			newErrors.name = "El nombre debe tener al menos 2 caracteres";
		} else if (formData.name.trim().length > 50) {
			newErrors.name = "El nombre no puede exceder 50 caracteres";
		} else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(formData.name.trim())) {
			newErrors.name = "El nombre solo debe contener letras y espacios";
		}

		// Validar fecha de nacimiento
		if (!formData.fechaNacimiento) {
			newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria";
		} else {
			const selectedDate = new Date(formData.fechaNacimiento);
			const today = new Date();
			if (selectedDate > today) {
				newErrors.fechaNacimiento =
					"La fecha de nacimiento no puede ser en el futuro";
			}
		}

		// Validar tipo de mascota
		if (!formData.petType) {
			newErrors.petType = "Debe seleccionar una especie";
		}

		// Validar especie custom
		if (formData.petType === "Otro" && !formData.especieOtro.trim()) {
			newErrors.especieOtro = "Especifique la especie de la mascota";
		} else if (
			formData.petType === "Otro" &&
			formData.especieOtro.trim().length > 50
		) {
			newErrors.especieOtro = "La especie no puede exceder 50 caracteres";
		} else if (
			formData.petType === "Otro" &&
			!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(formData.especieOtro.trim())
		) {
			newErrors.especieOtro = "La especie solo debe contener letras y espacios";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleCancel = () => {
		if (formData.name || formData.fechaNacimiento || formData.petType) {
			toast.info("Formulario cancelado");
		}
		navigate(-1);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validar el formulario
		if (!validateForm()) {
			toast.warning("Por favor, completa todos los campos correctamente");
			return;
		}

		// Prevenir envíos duplicados
		if (isSubmitting) {
			return;
		}

		// Si es 'otro', usamos el valor del input manual
		const tipoFinal =
			formData.petType === "Otro"
				? formData.especieOtro.trim()
				: formData.petType;

		const petToSave = {
			name: formData.name.trim(),
			petType: tipoFinal,
			birthDate: formData.fechaNacimiento,
		};

		try {
			setIsSubmitting(true);
			await addPet(petToSave);

			// Toast de éxito
			toast.success(`✅ ¡${petToSave.name} ha sido agregado correctamente!`, {
				position: "top-right",
				autoClose: 1500,
				onClose: () => navigate("/mascotas"),
			});
		} catch (error) {
			console.error("Error al agregar la mascota:", error);

			// Toast de error con mensaje más descriptivo
			const errorMessage =
				error.response?.data?.message ||
				error.message ||
				"No se pudo agregar la mascota";

			toast.error(`❌ Error: ${errorMessage}`, {
				position: "top-right",
				autoClose: 4000,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="petadd-page-container">
			<NavbarClient />
			<main className="petadd-main">
				<div className="petadd-card">
					<h2 className="petadd-title">Agregar nueva mascota</h2>
					<p className="petadd-subtitle">
						Completa la información básica de tu mascota
					</p>

					<form onSubmit={handleSubmit} className="petadd-form">
						{/* Nombre */}
						<div className="petadd-field">
							<label htmlFor="name">
								Nombre <span className="required-asterisk">*</span>
							</label>
							<input
								type="text"
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								placeholder="Ej: Firulais"
								disabled={isSubmitting}
								maxLength="50"
								aria-invalid={!!errors.name}
								aria-describedby={errors.name ? "name-error" : undefined}
							/>
							{errors.name && (
								<span id="name-error" className="error-message">
									{errors.name}
								</span>
							)}
							<span className="char-count">{formData.name.length}/50</span>
						</div>

						{/* Fecha de nacimiento */}
						<div className="petadd-field">
							<label htmlFor="fechaNacimiento">
								Fecha de nacimiento <span className="required-asterisk">*</span>
							</label>
							<input
								type="date"
								id="fechaNacimiento"
								name="fechaNacimiento"
								value={formData.fechaNacimiento}
								onChange={handleChange}
								disabled={isSubmitting}
								aria-invalid={!!errors.fechaNacimiento}
								aria-describedby={
									errors.fechaNacimiento ? "fecha-error" : undefined
								}
							/>
							{errors.fechaNacimiento && (
								<span id="fecha-error" className="error-message">
									{errors.fechaNacimiento}
								</span>
							)}
						</div>

						{/* Especie / Tipo */}
						<div className="petadd-field">
							<label htmlFor="petType">
								Especie <span className="required-asterisk">*</span>
							</label>
							<div className="select-wrapper-pa">
								<select
									id="petType"
									name="petType"
									value={formData.petType}
									onChange={handleChange}
									disabled={isSubmitting}
									aria-invalid={!!errors.petType}
									aria-describedby={
										errors.petType ? "pettype-error" : undefined
									}
								>
									<option value="" disabled>
										Selecciona una opción
									</option>
									<option value="Perro">Perro</option>
									<option value="Gato">Gato</option>
									<option value="Conejo">Conejo</option>
									<option value="Ave">Ave</option>
									<option value="Reptil">Reptil</option>
									<option value="Otro">Otro</option>
								</select>
								<span className="select-arrow-pa">&#8964;</span>
							</div>
							{errors.petType && (
								<span id="pettype-error" className="error-message">
									{errors.petType}
								</span>
							)}
						</div>

						{/* Campo extra si es "otro" */}
						{formData.petType === "Otro" && (
							<div className="petadd-field petadd-field-extra">
								<label htmlFor="especieOtro">
									¿Qué especie es? <span className="required-asterisk">*</span>
								</label>
								<input
									type="text"
									id="especieOtro"
									name="especieOtro"
									value={formData.especieOtro}
									onChange={handleChange}
									placeholder="Ej: Hámster, Cobaya, Tortuga"
									disabled={isSubmitting}
									maxLength="50"
									aria-invalid={!!errors.especieOtro}
									aria-describedby={
										errors.especieOtro ? "especie-error" : undefined
									}
								/>
								{errors.especieOtro && (
									<span id="especie-error" className="error-message">
										{errors.especieOtro}
									</span>
								)}
								<span className="char-count">
									{formData.especieOtro.length}/50
								</span>
							</div>
						)}

						<div className="petadd-actions">
							<button
								type="button"
								className="btn-cancel-petadd"
								onClick={handleCancel}
								disabled={isSubmitting}
							>
								❌ Cancelar
							</button>
							<button
								type="submit"
								className="btn-submit-petadd"
								disabled={isSubmitting}
							>
								{isSubmitting ? "⏳ Agregando..." : "✅ Agregar mascota"}
							</button>
						</div>
					</form>
				</div>
			</main>
			<FooterGuest />
		</div>
	);
}
