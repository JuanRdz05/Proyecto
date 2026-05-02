import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import { addService } from "../../../services/Admin/services.js";
import "./addService.css";
import { useAdminGuard } from "../../../hooks/useAdminGuard.jsx";

export function AddService() {
	const { checking, isActive, BlockedScreen } = useAdminGuard();

	if (checking || !isActive) return <BlockedScreen />;
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const [form, setForm] = useState({
		name: "",
		description: "",
		price: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;

		// Para nombre: solo letras, acentos, ñ y espacios
		if (name === "name" && value) {
			const filteredValue = value.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g, "");
			setForm((prev) => ({ ...prev, [name]: filteredValue }));
		} else {
			setForm((prev) => ({ ...prev, [name]: value }));
		}

		// Limpiar error del campo
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		// Validar nombre
		if (!form.name.trim()) {
			newErrors.name = "El nombre del servicio es obligatorio";
		} else if (form.name.trim().length < 2) {
			newErrors.name = "El nombre debe tener al menos 2 caracteres";
		} else if (form.name.trim().length > 100) {
			newErrors.name = "El nombre no puede exceder 100 caracteres";
		}

		// Validar descripción
		if (!form.description.trim()) {
			newErrors.description = "La descripción es obligatoria";
		} else if (form.description.trim().length < 10) {
			newErrors.description =
				"La descripción debe tener al menos 10 caracteres";
		} else if (form.description.trim().length > 500) {
			newErrors.description = "La descripción no puede exceder 500 caracteres";
		}

		// Validar precio
		const priceNum = parseFloat(form.price);
		if (!form.price) {
			newErrors.price = "El precio es obligatorio";
		} else if (isNaN(priceNum) || priceNum < 0) {
			newErrors.price = "El precio debe ser un número positivo";
		} else if (priceNum > 999999.99) {
			newErrors.price = "El precio es demasiado alto";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			toast.warning("Por favor, completa todos los campos correctamente");
			return;
		}

		if (loading) return;

		const serviceData = {
			name: form.name.trim(),
			description: form.description.trim(),
			price: parseFloat(form.price),
		};

		try {
			setLoading(true);
			await addService(serviceData);

			toast.success("Servicio creado", {
				position: "top-right",
				autoClose: 2000,
				onClose: () => navigate("/admin/servicios"),
			});

			// Limpiar formulario
			setForm({ name: "", description: "", price: "" });
		} catch (error) {
			console.error("Error al crear el servicio:", error);
			toast.error(
				`❌ Error: ${error.message || "No se pudo crear el servicio"}`,
				{
					position: "top-right",
					autoClose: 4000,
				},
			);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		if (form.name || form.description || form.price) {
			toast.info("Formulario cancelado");
		}
		navigate(-1);
	};

	return (
		<div className="addsvc-page-container">
			<NavbarAdmin />

			<main className="addsvc-main">
				<div className="addsvc-card">
					<h2 className="addsvc-title">Nuevo servicio</h2>

					<form onSubmit={handleSubmit} className="addsvc-form" noValidate>
						{/* Nombre */}
						<div className="addsvc-field">
							<label htmlFor="name">
								Nombre <span className="required-asterisk">*</span>
							</label>
							<input
								id="name"
								name="name"
								type="text"
								placeholder="Nombre del servicio"
								value={form.name}
								onChange={handleChange}
								disabled={loading}
								maxLength="100"
								aria-invalid={!!errors.name}
								aria-describedby={errors.name ? "name-error" : undefined}
							/>
							{errors.name && (
								<span id="name-error" className="error-message">
									{errors.name}
								</span>
							)}
							<span className="char-count">{form.name.length}/100</span>
						</div>

						{/* Descripción */}
						<div className="addsvc-field">
							<label htmlFor="description">
								Descripción <span className="required-asterisk">*</span>
							</label>
							<textarea
								id="description"
								name="description"
								placeholder="Describe el servicio..."
								value={form.description}
								onChange={handleChange}
								rows={4}
								disabled={loading}
								maxLength="500"
								aria-invalid={!!errors.description}
								aria-describedby={errors.description ? "desc-error" : undefined}
							/>
							{errors.description && (
								<span id="desc-error" className="error-message">
									{errors.description}
								</span>
							)}
							<span className="char-count">{form.description.length}/500</span>
						</div>

						{/* Precio */}
						<div className="addsvc-field">
							<label htmlFor="price">
								Precio <span className="required-asterisk">*</span>
							</label>
							<div className="price-input-wrapper">
								<span className="currency-badge">$</span>
								<input
									id="price"
									name="price"
									type="number"
									step="0.01"
									min="0"
									placeholder="0.00"
									value={form.price}
									onChange={handleChange}
									disabled={loading}
									aria-invalid={!!errors.price}
									aria-describedby={errors.price ? "price-error" : undefined}
								/>
							</div>
							{errors.price && (
								<span id="price-error" className="error-message">
									{errors.price}
								</span>
							)}
						</div>

						{/* Botones */}
						<div className="addsvc-actions">
							<button
								type="button"
								className="btn-cancel-svc"
								onClick={handleCancel}
								disabled={loading}
							>
								Cancelar
							</button>
							<button type="submit" className="btn-save-svc" disabled={loading}>
								{loading ? "⏳ Guardando..." : "Guardar"}
							</button>
						</div>
					</form>
				</div>
			</main>

			<FooterGuest />
		</div>
	);
}
