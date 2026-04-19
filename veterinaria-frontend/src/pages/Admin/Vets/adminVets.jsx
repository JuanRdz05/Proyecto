import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./adminVets.css";

// Datos placeholder — se conectará al backend más adelante
const MOCK_VETS = [
    { id: 1, name: "Dra. María González", email: "maria.gonzalez@veterinary.com", active: true },
    { id: 2, name: "Dr. Carlos Ramírez", email: "carlos.ramirez@veterinary.com", active: true },
    { id: 3, name: "Dra. Ana López", email: "ana.lopez@veterinary.com", active: false },
    { id: 4, name: "Dr. Pedro Martínez", email: "pedro.martinez@veterinary.com", active: true },
    { id: 5, name: "Dra. Laura Hernández", email: "laura.hernandez@veterinary.com", active: true },
];

// Iniciales para el avatar placeholder
function initials(name) {
    return name
        .split(" ")
        .filter((w) => w.length > 2)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
}

export function AdminVets() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [vets, setVets] = useState(MOCK_VETS);

    const filtered = vets.filter((v) => {
        const q = search.toLowerCase();
        return (
            v.name.toLowerCase().includes(q) ||
            v.specialty.toLowerCase().includes(q) ||
            v.email.toLowerCase().includes(q)
        );
    });

    const toggleActive = (id) => {
        setVets((prev) =>
            prev.map((v) => (v.id === id ? { ...v, active: !v.active } : v))
        );
    };

    const handleNuevo = () => navigate('/admin/nuevo-veterinario');

    return (
        <div className="adminvets-container">
            <NavbarAdmin />

            <main className="adminvets-main">
                <h1 className="adminvets-title">Veterinarios</h1>

                {/* Barra de búsqueda + botón */}
                <div className="adminvets-toolbar">
                    <div className="adminvets-search">
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

                    <button className="btn-nuevo-vet" onClick={handleNuevo}>
                        <span className="btn-nuevo-label">Nuevo veterinario</span>
                        <span className="btn-nuevo-plus">+</span>
                    </button>
                </div>

                {/* Tabla */}
                <div className="adminvets-table-wrapper">
                    <table className="adminvets-table">
                        <thead>
                            <tr>
                                <th>Veterinario</th>
                                <th>Email</th>
                                <th>Estado</th>
                                <th>Activos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="empty-row">
                                        No se encontraron veterinarios.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((vet) => (
                                    <tr key={vet.id}>
                                        {/* Avatar + nombre */}
                                        <td className="col-vet">
                                            <div className="vet-avatar">
                                                {initials(vet.name)}
                                            </div>
                                            <strong>{vet.name}</strong>
                                        </td>
                                        <td className="col-email">{vet.email}</td>
                                        <td className="col-status">
                                            <span className={`vet-status-badge ${vet.active ? "badge-activo" : "badge-inactivo"}`}>
                                                {vet.active ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="col-action">
                                            {/* Toggle switch */}
                                            <button
                                                className={`toggle-switch ${vet.active ? "on" : "off"}`}
                                                onClick={() => toggleActive(vet.id)}
                                                title={vet.active ? "Desactivar" : "Activar"}
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
