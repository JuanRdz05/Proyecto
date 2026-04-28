import { useState } from "react";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./adminClients.css";

// Datos placeholder — se conectará al backend más adelante
const MOCK_CLIENTS = [
    { id: 1, name: "Juan Pérez",       email: "juan.perez@email.com",       active: true  },
    { id: 2, name: "María López",      email: "maria.lopez@email.com",       active: true  },
    { id: 3, name: "Carlos Ruiz",      email: "carlos.ruiz@email.com",       active: false },
    { id: 4, name: "Ana Martínez",     email: "ana.martinez@email.com",      active: true  },
    { id: 5, name: "Roberto Silva",    email: "roberto.silva@email.com",     active: true  },
    { id: 6, name: "Laura Vega",       email: "laura.vega@email.com",        active: false },
];

function initials(name) {
    return name
        .split(" ")
        .filter((w) => w.length > 2)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
}

export function AdminClients() {
    const [clients, setClients] = useState(MOCK_CLIENTS);
    const [search, setSearch] = useState("");

    const filtered = clients.filter((c) => {
        const q = search.toLowerCase();
        return (
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q)
        );
    });

    const toggleActive = (id) =>
        setClients((prev) =>
            prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
        );

    return (
        <div className="admincl-container">
            <NavbarAdmin />

            <main className="admincl-main">
                <h1 className="admincl-title">Clientes</h1>

                {/* Barra de búsqueda — sin botón de crear */}
                <div className="admincl-toolbar">
                    <div className="admincl-search">
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
                </div>

                {/* Tabla */}
                <div className="admincl-table-wrapper">
                    <table className="admincl-table">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Email</th>
                                <th>Estado</th>
                                <th>Activo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="empty-row">
                                        No se encontraron clientes.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((client) => (
                                    <tr key={client.id}>
                                        <td className="col-client">
                                            <div className="client-avatar">
                                                {initials(client.name)}
                                            </div>
                                            <strong>{client.name}</strong>
                                        </td>
                                        <td className="col-email">{client.email}</td>
                                        <td className="col-status">
                                            <span className={`cl-badge ${client.active ? "badge-activo" : "badge-inactivo"}`}>
                                                {client.active ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="col-action">
                                            <button
                                                className={`toggle-switch ${client.active ? "on" : "off"}`}
                                                onClick={() => toggleActive(client.id)}
                                                title={client.active ? "Desactivar" : "Activar"}
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
