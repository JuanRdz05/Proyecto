import { useState } from "react";
import { InputField } from "../../../components/Inputfield/inputfield.jsx";
import { loginUser } from "../../../services/Guest/auth.js";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./login.css";

export function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const data = await loginUser(email, password);
			toast.success(`¡Bienvenido ${data.name}!`);
			localStorage.setItem("userName", data.name);

            // Redirección por rol
            if (data.role === 'client') {
                navigate('/cliente'); 
            } else if (data.role === 'vet') {
                navigate('/veterinario');
            } else if (data.role === 'admin') {
                navigate('/admin/citas');
            }
		} catch (error) {
			console.error("Error al iniciar sesión: ", error);
			toast.error(error.message || "Usuario o contraseña incorrectos");
		}
	};

	return (
		<div className="login-container">
			<form onSubmit={handleSubmit} className="login-card">
				{/* Botón X para regresar */}
				<button 
					type="button" 
					className="btn-close-card" 
					onClick={() => navigate(-1)}
					title="Regresar"
				>
					&times;
				</button>

				{/* Título ahora dentro de la tarjeta */}
				<h1>Iniciar sesión</h1>

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
				
				<button type="submit" className="btn-login">Iniciar sesión</button>
				
				<p>
					¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
				</p>
			</form>
		</div>
	);
}