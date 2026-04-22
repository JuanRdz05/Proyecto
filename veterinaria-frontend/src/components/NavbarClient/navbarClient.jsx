import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/imagenes/logo.png";
import "./navbarClient.css";

export function NavbarClient() {
    const navigate = useNavigate();
    const location = useLocation();
    const userName = localStorage.getItem("userName") || "Usuario";
    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3050/users/v1/profile", {
            credentials: "include",
        })
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                if (data?.profilePicture) {
                    setProfilePic(data.profilePicture);
                }
            })
            .catch(() => {}); // Si falla, queda el placeholder
    }, []);

    const isActive = (path) => location.pathname === path ? "active" : "";

    return (
        <nav className="navbar-client">
            <div className="nav-left" onClick={() => navigate('/cliente')} style={{ cursor: 'pointer' }}>
                <img src={logo} alt="Logo" className="nav-logo" />
            </div>

            <ul className="nav-center">
                <li><Link to="/cliente" className={isActive("/cliente")}>Inicio</Link></li>
                <li><Link to="/agendar-cita" className={isActive("/agendar-cita")}>Agendar cita</Link></li>
                <li><Link to="/mascotas" className={isActive("/mascotas")}>Mis mascotas</Link></li>
                <li><Link to="/historial" className={isActive("/historial")}>Historial</Link></li>
            </ul>

            <div className="nav-right">
                <div className="user-profile-nav" onClick={() => navigate('/perfil')} title="Ver perfil">
                    <div className="nav-profile-pic">
                        {profilePic ? (
                            <img src={profilePic} alt="Foto de perfil" />
                        ) : (
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
                        )}
                    </div>
                    <span>{userName}</span>
                </div>
            </div>
        </nav>
    );
}