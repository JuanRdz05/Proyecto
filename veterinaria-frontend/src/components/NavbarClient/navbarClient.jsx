import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/imagenes/logo.png"; // Usamos tu logo
import "./navbarClient.css";

export function NavbarClient() {
    const navigate = useNavigate();
    const userName = localStorage.getItem("userName") || "Usuario";

    return (
        <nav className="navbar-client">
            <div className="nav-left">
                <img src={logo} alt="Logo" className="nav-logo" />
            </div>
            
            <ul className="nav-center">
                <li><Link to="/client-home" className="active">Inicio</Link></li>
                <li><Link to="/agendar">Agendar cita</Link></li>
                <li><Link to="/mascotas">Mis mascotas</Link></li>
                <li><Link to="/historial">Historial</Link></li>
            </ul>

            <div className="nav-right">
                <div className="user-profile-nav">
                    {/* Placeholder circular con ícono de persona */}
                    <div className="nav-profile-pic">
                        <svg
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
                    </div>
                    <span>{userName}</span>
                </div>
            </div>
        </nav>
    );
}