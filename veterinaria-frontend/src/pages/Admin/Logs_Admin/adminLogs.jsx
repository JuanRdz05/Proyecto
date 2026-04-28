import { useState } from "react";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./adminLogs.css";

// Datos placeholder — fiel al modelo del backend (action, resource, description, user)
const MOCK_LOGS = [
    {
        id: 1,
        createdAt: "2024-01-15 09:30",
        action: "CREATE",
        resource: "APPOINTMENT",
        description: "Se creó una nueva cita para la mascota 'Max'",
        user: { name: "Dr. Juan Pérez",     role: "vet"   },
    },
    {
        id: 2,
        createdAt: "2024-01-15 10:15",
        action: "UPDATE",
        resource: "SERVICE",
        description: "Se modificó el servicio 'Vacunación' - cambio de precio",
        user: { name: "Dra. María González", role: "admin" },
    },
    {
        id: 3,
        createdAt: "2024-01-15 11:00",
        action: "DELETE",
        resource: "APPOINTMENT",
        description: "Se eliminó la cita #1234 del veterinario López",
        user: { name: "Dr. Carlos López",   role: "vet"   },
    },
    {
        id: 4,
        createdAt: "2024-01-15 12:30",
        action: "CREATE",
        resource: "USER",
        description: "Se registró un nuevo veterinario en el sistema",
        user: { name: "Roberto Solís",       role: "admin" },
    },
    {
        id: 5,
        createdAt: "2024-01-15 14:45",
        action: "UPDATE",
        resource: "APPOINTMENT",
        description: "Se actualizó el estado de la cita #1230 a 'Completada'",
        user: { name: "Dra. Ana Martínez",  role: "vet"   },
    },
    {
        id: 6,
        createdAt: "2024-01-15 16:20",
        action: "CREATE",
        resource: "SERVICE",
        description: "Se agregó un nuevo servicio: 'Estética Felina'",
        user: { name: "Patricia Ríos",       role: "admin" },
    },
    {
        id: 7,
        createdAt: "2024-01-15 17:05",
        action: "LOGIN",
        resource: "USER",
        description: "Inicio de sesión exitoso",
        user: { name: "Dr. Pedro Martínez", role: "vet"   },
    },
    {
        id: 8,
        createdAt: "2024-01-15 18:00",
        action: "LOGOUT",
        resource: "USER",
        description: "Cierre de sesión",
        user: { name: "Carmen Fuentes",      role: "admin" },
    },
];

// Config de badges para cada acción
const ACTION_CONFIG = {
    CREATE: { label: "Crear",   cls: "action-create"  },
    UPDATE: { label: "Editar",  cls: "action-update"  },
    DELETE: { label: "Eliminar",cls: "action-delete"  },
    LOGIN:  { label: "Login",   cls: "action-login"   },
    LOGOUT: { label: "Logout",  cls: "action-logout"  },
};

// Etiqueta legible del rol
const ROLE_LABEL = {
    admin: "Admin",
    vet:   "Veterinario",
    client:"Cliente",
};

export function AdminLogs() {
    const [filterAction, setFilterAction] = useState("TODAS");

    const ACTIONS = ["TODAS", "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"];

    const visible = filterAction === "TODAS"
        ? MOCK_LOGS
        : MOCK_LOGS.filter(l => l.action === filterAction);

    return (
        <div className="logs-container">
            <NavbarAdmin />

            <main className="logs-main">
                {/* Encabezado */}
                <div className="logs-header">
                    <div>
                        <h1 className="logs-title">Logs</h1>
                        <p className="logs-subtitle">Historial de actividades y cambios en el sistema</p>
                    </div>
                </div>

                {/* Filtros por acción */}
                <div className="logs-filters">
                    {ACTIONS.map(a => (
                        <button
                            key={a}
                            className={`btn-log-filter ${filterAction === a ? "active" : ""}`}
                            onClick={() => setFilterAction(a)}
                        >
                            {a === "TODAS" ? "Todas" : ACTION_CONFIG[a].label}
                        </button>
                    ))}
                </div>

                {/* Tabla */}
                <div className="logs-table-wrapper">
                    <table className="logs-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Acción</th>
                                <th>Descripción</th>
                                <th>Usuario</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="logs-empty">
                                        No hay logs que mostrar.
                                    </td>
                                </tr>
                            ) : (
                                visible.map(log => {
                                    const cfg = ACTION_CONFIG[log.action] || { label: log.action, cls: "action-create" };
                                    return (
                                        <tr key={log.id}>
                                            <td className="col-date">{log.createdAt}</td>
                                            <td className="col-action">
                                                <span className={`action-badge ${cfg.cls}`}>
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="col-desc">{log.description}</td>
                                            <td className="col-user">
                                                <span className="user-name">{log.user.name}</span>
                                                <span className="user-role">
                                                    {ROLE_LABEL[log.user.role] || log.user.role}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            <FooterGuest />
        </div>
    );
}
