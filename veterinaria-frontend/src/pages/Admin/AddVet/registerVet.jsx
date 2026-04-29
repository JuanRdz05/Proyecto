import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { InputField } from "../../../components/Inputfield/inputfield.jsx";
import { registerUser } from "../../../services/Guest/register.js";
import "./registerVet.css";

export function RegisterVet() {
	const navigate = useNavigate();

	const [username, setUsername] = useState("");
	const [name, setName] = useState("");
	const [paternalLastName, setPaternalLastName] = useState("");
	const [maternalLastName, setMaternalLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("vet");

	const fileInputRef = useRef(null);
	const [selectedFile, setSelectedFile] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleFileClick = () => fileInputRef.current.click();

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file && file.type.startsWith("image/")) {
			setSelectedFile(file);
			setPreviewUrl(URL.createObjectURL(file));
		} else if (file) {
			toast.warning("Por favor selecciona una imagen válida.");
			e.target.value = null;
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const formData = new FormData();
			formData.append("username", username);
			formData.append("name", name);
			formData.append("paternalLastName", paternalLastName);
			formData.append("maternalLastName", maternalLastName);
			formData.append("email", email);
			formData.append("password", password);
			formData.append("role", role);
			if (selectedFile) formData.append("profilePic", selectedFile);

			await registerUser(formData);

			toast.success("Veterinario registrado", {
				position: "top-right",
				autoClose: 2000,
				onClose: () => navigate("/admin/veterinarios"),
			});
		} catch (error) {
			console.error("Error al registrar veterinario:", error);
			toast.error(`${error.message || "Error al registrar veterinario"}`, {
				position: "top-right",
				autoClose: 4000,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="register-container">
			<form onSubmit={handleSubmit} className="register-form">
				<button
					type="button"
					className="btn-close-card"
					onClick={() => navigate(-1)}
					title="Regresar"
				>
					&times;
				</button>

				<h2>Registrar veterinario</h2>

				<div
					className="profile-pic-placeholder clickable"
					onClick={handleFileClick}
					title="Haz clic para seleccionar una foto"
				>
					{previewUrl ? (
						<img
							src={previewUrl}
							alt="Vista previa"
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

				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileChange}
					accept="image/*"
					style={{ display: "none" }}
				/>

				<InputField
					label="Nombre de Usuario"
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>

				<InputField
					label="Nombre"
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>

				<InputField
					label="Apellido Paterno"
					type="text"
					value={paternalLastName}
					onChange={(e) => setPaternalLastName(e.target.value)}
				/>

				<InputField
					label="Apellido Materno"
					type="text"
					value={maternalLastName}
					onChange={(e) => setMaternalLastName(e.target.value)}
				/>

				<InputField
					label="Correo Electrónico"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>

				<InputField
					label="Contraseña"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>

				<button type="submit" className="btn-register" disabled={loading}>
					{loading ? "Registrando..." : "Registrar veterinario"}
				</button>
			</form>
		</div>
	);
}
