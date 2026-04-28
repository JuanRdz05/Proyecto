import { useState } from "react";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./adminPets.css";

// Datos placeholder — se conectará al backend más adelante
const MOCK_PETS = [
    { id: 1, name: "Max",     species: "Perro",   owner: "Juan Pérez",    active: true  },
    { id: 2, name: "Charlie", species: "Perro",   owner: "María López",   active: true  },
    { id: 3, name: "Bella",   species: "Gato",    owner: "Ana Martínez",  active: false },
    { id: 4, name: "Luna",    species: "Conejo",  owner: "Roberto Silva", active: true  },
    { id: 5, name: "Toby",    species: "Perro",   owner: "Laura Vega",    active: true  },
    { id: 6, name: "Rocky",   species: "Perro",   owner: "Carlos Ruiz",   active: true  },
    { id: 7, name: "Mia",     species: "Gato",    owner: "Sofía Herrera", active: false },
];

function initials(name) {
    return name
        .split(" ")
        .filter((w) => w.length > 0)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
}

export function AdminPets() {
    const [pets, setPets] = useState(MOCK_PETS);
    const [search, setSearch] = useState("");

    const filtered = pets.filter((p) => {
        const q = search.toLowerCase();
        return (
            p.name.toLowerCase().includes(q) ||
            p.species.toLowerCase().includes(q) ||
            p.owner.toLowerCase().includes(q)
        );
    });

    const toggleActive = (id) =>
        setPets((prev) =>
            prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
        );

    return (
        <div className="adminpets-container">
            <NavbarAdmin />

            <main className="adminpets-main">
                <h1 className="adminpets-title">Mascotas</h1>

                {/* Barra de búsqueda — sin botón de crear */}
                <div className="adminpets-toolbar">
                    <div className="adminpets-search">
                        <span className="search-icon">
                            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <circle cx="8.5" cy="8.5" r="5.5" />
                                <line x1="13" y1="13" x2="18" y2="18" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, especie o dueño..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabla */}
                <div className="adminpets-table-wrapper">
                    <table className="adminpets-table">
                        <thead>
                            <tr>
                                <th>Mascota</th>
                                <th>Especie</th>
                                <th>Dueño</th>
                                <th>Estado</th>
                                <th>Activo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="empty-row">
                                        No se encontraron mascotas.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((pet) => (
                                    <tr key={pet.id}>
                                        <td className="col-pet">
                                            <div className="pet-avatar">
                                                {initials(pet.name)}
                                            </div>
                                            <strong>{pet.name}</strong>
                                        </td>
                                        <td className="col-species">{pet.species}</td>
                                        <td className="col-owner">{pet.owner}</td>
                                        <td className="col-status">
                                            <span className={`pet-badge ${pet.active ? "badge-activo" : "badge-inactivo"}`}>
                                                {pet.active ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="col-action">
                                            <button
                                                className={`toggle-switch ${pet.active ? "on" : "off"}`}
                                                onClick={() => toggleActive(pet.id)}
                                                title={pet.active ? "Desactivar" : "Activar"}
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
