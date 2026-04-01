// src/components/NavbarGuest/navbarGuest.jsx
import { Link, useNavigate } from "react-router-dom";
// Usaremos la nueva clase que definiremos en el CSS
import logo from "../../assets/imagenes/logo.png";
import "./navbarGuest.css";

export function NavbarGuest() {
	const navigate = useNavigate();

	return (
		<header className="navbar-guest-header">
			<nav className="navbar-guest-container">
				
				{/* LADO IZQUIERDO: Logo y Enlaces del Mockup */}
				<div className="navbar-left-section">
					{/* Espacio para el logo (puedes reemplazar este div por un <img>) */}
					<div className="navbar-logo-placeholder">
						<img src={logo} alt="Logo"></img>
					</div>
				</div>

				{/* LADO DERECHO: Botón Iniciar Sesión */}
				<div className="navbar-right-section">
					{/* Botón azul con borde y texto blanco que redirige al login */}
					<button 
						className="btn-navbar-login" 
						onClick={() => navigate("/login")} // Asumiendo que / es tu ruta de login
					>
						Iniciar sesión
					</button>
				</div>
			</nav>
		</header>
	);
}