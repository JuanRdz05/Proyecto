import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../../../services/Client/profile.js";
import "./profile.css";

export function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getProfile()
            .then((data) => {
                setUser(data);
                setLoading(false);
            })
            .catch(() => {
                setError("No se pudo cargar el perfil. Intenta iniciar sesión de nuevo.");
                setLoading(false);
            });
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:3050/users/v1/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (e) {
            // Si falla la petición, seguimos con el logout local
        } finally {
            localStorage.clear();
            navigate("/inicio-sesion");
        }
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="profile-loading">Cargando perfil...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="profile-error">{error}</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-form">
                {/* Botón X para regresar */}
                <button
                    type="button"
                    className="btn-close-card"
                    onClick={() => navigate(-1)}
                    title="Regresar"
                >
                    &times;
                </button>

                <h2>Mi Perfil</h2>

                {/* Foto de perfil */}
                <div className="profile-pic-placeholder">
                    {user?.profilePicture ? (
                        <img
                            src={user.profilePicture}
                            alt="Foto de perfil"
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

                {/* Campos de solo lectura */}
                <div className="profile-field">
                    <label>Nombre de Usuario</label>
                    <input type="text" value={user?.username || ""} readOnly />
                </div>

                <div className="profile-field">
                    <label>Nombre</label>
                    <input type="text" value={user?.name || ""} readOnly />
                </div>

                <div className="profile-field">
                    <label>Apellido Paterno</label>
                    <input type="text" value={user?.paternalLastName || ""} readOnly />
                </div>

                <div className="profile-field">
                    <label>Apellido Materno</label>
                    <input type="text" value={user?.maternalLastName || ""} readOnly />
                </div>

                <div className="profile-field">
                    <label>Correo Electrónico</label>
                    <input type="email" value={user?.email || ""} readOnly />
                </div>

                {/* Botones de acción */}
                <div className="profile-actions">
                    <button
                        type="button"
                        className="btn-edit-profile"
                        onClick={() => {/* TODO: implementar edición */}}
                    >
                        ✏️ Editar perfil
                    </button>

                    <button
                        type="button"
                        className="btn-logout"
                        onClick={handleLogout}
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
