import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./adminManager.css";

// Datos placeholder — se conectará al backend más adelante
const MOCK_ADMINS = [
    { id: 1, name: "Dr. Roberto Solis",    email: "roberto.solis@veterinary.com",    active: true  },
    { id: 2, name: "Dra. Carmen Fuentes",  email: "carmen.fuentes@veterinary.com",   active: true  },
    { id: 3, name: "Dr. Andrés Medina",    email: "andres.medina@veterinary.com",    active: false },
    { id: 4, name: "Dra. Patricia Ríos",   email: "patricia.rios@veterinary.com",    active: true  },
];

function initials(name) {
    return name
        .split(" ")
        .filter((w) => w.length > 2)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
}

export function AdminManager() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [admins, setAdmins] = useState(MOCK_ADMINS);

    const filtered = admins.filter((a) => {
        const q = search.toLowerCase();
        return (
            a.name.toLowerCase().includes(q) ||
            a.email.toLowerCase().includes(q)
        );
    });

    const toggleActive = (id) => {
        setAdmins((prev) =>
            prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
        );
    };

    return (
        <div className="adminmgr-container">
            <NavbarAdmin />

            <main className="adminmgr-main">
                <h1 className="adminmgr-title">Administradores</h1>

                {/* Barra de búsqueda + botón */}
                <div className="adminmgr-toolbar">
                    <div className="adminmgr-search">
                        <span className="search-icon">
                            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <circle cx="8.5" cy="8.5" r="5.5" />
                                <line x1="13" y1="13" x2="18" y2="18" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <button className="btn-nuevo-admin" onClick={() => navigate('/admin/nuevo-administrador')}>
                        <span className="btn-nuevo-label">Nuevo administrador</span>
                        <span className="btn-nuevo-plus">+</span>
                    </button>
                </div>

                {/* Tabla */}
                <div className="adminmgr-table-wrapper">
                    <table className="adminmgr-table">
                        <thead>
                            <tr>
                                <th>Administrador</th>
                                <th>Email</th>
                                <th>Estado</th>
                                <th>Activos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="empty-row">
                                        No se encontraron administradores.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((admin) => (
                                    <tr key={admin.id}>
                                        <td className="col-admin">
                                            <div className="admin-avatar">
                                                {initials(admin.name)}
                                            </div>
                                            <strong>{admin.name}</strong>
                                        </td>
                                        <td className="col-email">{admin.email}</td>
                                        <td className="col-status">
                                            <span className={`admin-status-badge ${admin.active ? "badge-activo" : "badge-inactivo"}`}>
                                                {admin.active ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="col-action">
                                            <button
                                                className={`toggle-switch ${admin.active ? "on" : "off"}`}
                                                onClick={() => toggleActive(admin.id)}
                                                title={admin.active ? "Desactivar" : "Activar"}
                                            >
                                                <span className="toggle-knob" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            <FooterGuest />
        </div>
    );
}
