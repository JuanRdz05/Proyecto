import { useState } from "react";
import { InputField } from "../components/inputfield.jsx";
import { loginUser } from "../services/auth.js";

export function Login() {
	//Estados de la pagina
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		console.log("Email: " + email);
		console.log("Constraseña: " + password);

		//Enviar los datos al servidor
		try {
			console.log("Enviando datos...");
			const data = await loginUser(email, password);
			console.log("Login exitoso: ", data);
		} catch (error) {
			console.error("Error al iniciar sesión: ", error);
			alert("Usuario o contraseña incorrectos");
		}
	};

	return (
		<div className="login-container">
			<h1>Login</h1>
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
				<button type="submit">Iniciar sesión</button>
				<p>
					¿No tienes cuenta? <a href="/register">Registrate</a>
				</p>
			</form>
		</div>
	);
}
