import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./adminServices.css";

const MOCK_SERVICES = [
    { id: 1, name: "Consulta General",  description: "Revisión médica básica para mascotas",       price: 350.00,  active: true  },
    { id: 2, name: "Vacunación",        description: "Aplicación de vacunas para perros y gatos",  price: 280.00,  active: true  },
    { id: 3, name: "Desparasitación",   description: "Tratamiento antiparasitario interno y externo", price: 200.00, active: false },
    { id: 4, name: "Cirugía Menor",     description: "Procedimientos quirúrgicos ambulatorios",    price: 2500.00, active: true  },
    { id: 5, name: "Estética Canina",   description: "Baño, corte de pelo y cuidado de uñas",      price: 450.00,  active: true  },
];

// Ícono de lápiz SVG
function PencilIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <path d="M14.5 2.5a2.121 2.121 0 0 1 3 3L6 17l-4 1 1-4L14.5 2.5z" />
        </svg>
    );
}

export function AdminServices() {
    const navigate = useNavigate();
    const [services, setServices] = useState(MOCK_SERVICES);
    const [editingId, setEditingId] = useState(null);
    const [editDraft, setEditDraft] = useState({});

    // Estadísticas
    const total    = services.length;
    const activos  = services.filter(s => s.active).length;
    const inactivos = total - activos;

    const toggleActive = (id) =>
        setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));

    const startEdit = (service) => {
        setEditingId(service.id);
        setEditDraft({ name: service.name, description: service.description, price: service.price });
    };

    const cancelEdit = () => { setEditingId(null); setEditDraft({}); };

    const saveEdit = (id) => {
        setServices(prev => prev.map(s =>
            s.id === id
                ? { ...s, name: editDraft.name, description: editDraft.description, price: parseFloat(editDraft.price) }
                : s
        ));
        cancelEdit();
    };

    return (
        <div className="svc-container">
            <NavbarAdmin />

            <main className="svc-main">
                {/* Encabezado */}
                <div className="svc-header">
                    <h1 className="svc-title">Servicios</h1>
                    <button className="btn-agregar-svc" onClick={() => navigate('/admin/nuevo-servicio')}>
                        <span className="btn-agregar-plus">+</span>
                        Agregar
                    </button>
                </div>

                {/* Tabla */}
                <div className="svc-table-wrapper">
                    <table className="svc-table">
                        <thead>
                            <tr>
                                <th>Servicio</th>
                                <th>Descripción</th>
                                <th>Precio</th>
                                <th>Estado</th>
                                <th>Activo</th>
                                <th>Editar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((svc) => (
                                <tr key={svc.id}>
                                    {/* Nombre */}
                                    <td className="col-svc-name">
                                        {editingId === svc.id ? (
                                            <input
                                                className="edit-input"
                                                value={editDraft.name}
                                                onChange={e => setEditDraft({ ...editDraft, name: e.target.value })}
                                            />
                                        ) : (
                                            <strong>{svc.name}</strong>
                                        )}
                                    </td>

                                    {/* Descripción */}
                                    <td className="col-svc-desc">
                                        {editingId === svc.id ? (
                                            <input
                                                className="edit-input edit-input-wide"
                                                value={editDraft.description}
                                                onChange={e => setEditDraft({ ...editDraft, description: e.target.value })}
                                            />
                                        ) : (
                                            svc.description
                                        )}
                                    </td>

                                    {/* Precio */}
                                    <td className="col-svc-price">
                                        {editingId === svc.id ? (
                                            <input
                                                className="edit-input edit-input-price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={editDraft.price}
                                                onChange={e => setEditDraft({ ...editDraft, price: e.target.value })}
                                            />
                                        ) : (
                                            `$${svc.price.toFixed(2)}`
                                        )}
                                    </td>

                                    {/* Estado badge */}
                                    <td className="col-svc-status">
                                        <span className={`svc-badge ${svc.active ? "badge-activo" : "badge-inactivo"}`}>
                                            {svc.active ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>

                                    {/* Toggle */}
                                    <td className="col-svc-toggle">
                                        <button
                                            className={`toggle-switch ${svc.active ? "on" : "off"}`}
                                            onClick={() => toggleActive(svc.id)}
                                            title={svc.active ? "Desactivar" : "Activar"}
                                        >
                                            <span className="toggle-knob" />
                                        </button>
                                    </td>

                                    {/* Botón Editar / Guardar + Cancelar */}
                                    <td className="col-svc-edit">
                                        {editingId === svc.id ? (
                                            <div className="edit-actions">
                                                <button className="btn-save-edit" onClick={() => saveEdit(svc.id)}>✓</button>
                                                <button className="btn-cancel-edit" onClick={cancelEdit}>✕</button>
                                            </div>
                                        ) : (
                                            <button className="btn-edit-pencil" onClick={() => startEdit(svc)} title="Editar servicio">
                                                <PencilIcon />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                
            </main>

            <FooterGuest />
        </div>
    );
}
