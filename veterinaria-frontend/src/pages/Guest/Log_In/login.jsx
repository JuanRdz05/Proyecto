import { useState } from "react";
import { InputField } from "../../../components/Inputfield/inputfield.jsx";
import { loginUser } from "../../../services/Guest/auth.js";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

export function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const data = await loginUser(email, password);
			console.log("Login exitoso: ", data);
			// navigate('/dashboard'); 
		} catch (error) {
			console.error("Error al iniciar sesión: ", error);
			alert("Usuario o contraseña incorrectos");
		}
	};

	return (
		<div className="login-container">
			<h1>Iniciar sesión</h1>
			<form onSubmit={handleSubmit}>
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
                {/* Agregamos la clase btn-login aquí */}
				<button type="submit" className="btn-login">Iniciar sesión</button>
				<p>
					¿No tienes cuenta? <Link to="/register">Regístrate</Link>
				</p>
			</form>
		</div>
	);
}