import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Si es 'otro', usamos el valor del input manual
		const tipoFinal =
			formData.petType === "otro" ? formData.especieOtro : formData.petType;

		const petToSave = {
			name: formData.name, // Coincide con Schema
			petType: tipoFinal, // Coincide con Schema
			birthDate: formData.fechaNacimiento, // Coincide con Schema
		};

		try {
			await addPet(petToSave);
			console.log("Mascota agregada con éxito");
			navigate("/mascotas");
		} catch (error) {
			console.error("Error al agregar la mascota:", error);
		}
	};

	return (
		<div className="petadd-page-container">
			<NavbarClient />
			<main className="petadd-main">
				<div className="petadd-card">
					<h2 className="petadd-title">Información básica</h2>
					<form onSubmit={handleSubmit} className="petadd-form">
						{/* Nombre */}
						<div className="petadd-field">
							<label htmlFor="name">Nombre</label>
							<input
								type="text"
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								required
							/>
						</div>

						{/* Fecha de nacimiento */}
						<div className="petadd-field">
							<label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
							<input
								type="date"
								id="fechaNacimiento"
								name="fechaNacimiento"
								value={formData.fechaNacimiento}
								onChange={handleChange}
								required
							/>
						</div>

						{/* Especie / Tipo */}
						<div className="petadd-field">
							<label htmlFor="petType">Especie</label>
							<div className="select-wrapper-pa">
								<select
									id="petType"
									name="petType"
									value={formData.petType}
									onChange={handleChange}
									required
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
						</div>

						{/* Campo extra si es "otro" */}
						{formData.petType === "otro" && (
							<div className="petadd-field petadd-field-extra">
								<label htmlFor="especieOtro">¿Qué especie es?</label>
								<input
									type="text"
									id="especieOtro"
									name="especieOtro"
									value={formData.especieOtro}
									onChange={handleChange}
									placeholder="Ej: Hámster"
									required
								/>
							</div>
						)}

						<div className="petadd-actions">
							<button
								type="button"
								className="btn-cancel-petadd"
								onClick={() => navigate(-1)}
							>
								Cancelar
							</button>
							<button type="submit" className="btn-submit-petadd">
								Agregar
							</button>
						</div>
					</form>
				</div>
			</main>
			<FooterGuest />
		</div>
	);
}
