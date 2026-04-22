import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/imagenes/logo.png";
import "./navbarAdmin.css";

export function NavbarAdmin() {
    const navigate = useNavigate();
    const location = useLocation();
    const userName = localStorage.getItem("userName") || "Admin";
    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3050/users/v1/profile", {
            credentials: "include",
        })
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                if (data?.profilePicture) setProfilePic(data.profilePicture);
            })
            .catch(() => {});
    }, []);

    const isActive = (path) => location.pathname === path ? "active" : "";

    return (
        <nav className="navbar-admin">
            <div className="nav-left" onClick={() => navigate('/admin/citas')} style={{ cursor: 'pointer' }}>
                <img src={logo} alt="Logo" className="nav-logo" />
            </div>

            <ul className="nav-center">
                <li><Link to="/admin/citas"           className={isActive("/admin/citas")}>Citas</Link></li>
                <li><Link to="/admin/veterinarios"    className={isActive("/admin/veterinarios")}>Veterinarios</Link></li>
                <li><Link to="/admin/administradores" className={isActive("/admin/administradores")}>Administradores</Link></li>
                <li><Link to="/admin/clientes"        className={isActive("/admin/clientes")}>Clientes</Link></li>
                <li><Link to="/admin/mascotas"        className={isActive("/admin/mascotas")}>Mascotas</Link></li>
                <li><Link to="/admin/servicios"       className={isActive("/admin/servicios")}>Servicios</Link></li>
                <li><Link to="/admin/logs"            className={isActive("/admin/logs")}>Logs</Link></li>
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
