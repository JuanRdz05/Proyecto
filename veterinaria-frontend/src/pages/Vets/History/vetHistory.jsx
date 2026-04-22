import { NavbarVet } from "../../../components/NavbarVet/navbarVet.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./vetHistory.css";

// Datos placeholder — se conectará al backend más adelante
const MOCK_HISTORY = [
    { id: 1, date: "10/10/2024", time: "10:00 AM", owner: "Carlos Ruiz",   pet: "Max",     service: "Chequeo Anual",   status: "Terminada"   },
    { id: 2, date: "12/10/2024", time: "11:30 AM", owner: "María López",   pet: "Charlie", service: "Vacunación",       status: "Terminada"   },
    { id: 3, date: "12/10/2024", time: "2:30 PM",  owner: "María López",   pet: "Charlie", service: "Consulta",         status: "Terminada"   },
    { id: 4, date: "15/10/2024", time: "9:00 AM",  owner: "Ana Martínez",  pet: "Bella",   service: "Consulta",         status: "Pendiente"   },
    { id: 5, date: "18/10/2024", time: "3:00 PM",  owner: "Carlos Ruiz",   pet: "Max",     service: "Consulta",         status: "Pendiente"   },
    { id: 6, date: "20/10/2024", time: "10:30 AM", owner: "Roberto Silva", pet: "Luna",    service: "Vacunación",       status: "Cancelada"   },
    { id: 7, date: "22/10/2024", time: "4:00 PM",  owner: "Laura Vega",    pet: "Toby",    service: "Cirugía menor",    status: "Pendiente" },
    { id: 8, date: "24/10/2024", time: "2:00 PM",  owner: "Jorge Mendoza", pet: "Rocky",   service: "Desparasitación",  status: "Pendiente"    },
];

// Etiqueta y clase CSS para cada estado del modelo
const STATUS_CONFIG = {
    "Pendiente":   { label: "Pendiente",   cls: "status-pendiente"   },
    "Rechazada":   { label: "Rechazada",   cls: "status-rechazada"   },
    "Cancelada":   { label: "Cancelada",   cls: "status-cancelada"   },
    "Terminada":   { label: "Completada",  cls: "status-terminada"   },
};

export function VetHistory() {
    return (
        <div className="vethist-page-container">
            <NavbarVet />

            <main className="vethist-main">
                <h1 className="vethist-title">Historial de citas</h1>

                <div className="vethist-table-wrapper">
                    <table className="vethist-table">
                        <thead>
                            <tr>
                                <th>FECHA</th>
                                <th>HORA</th>
                                <th>PROPIETARIO</th>
                                <th>MASCOTA</th>
                                <th>MOTIVO</th>
                                <th>ESTADO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_HISTORY.map((apt, index) => {
                                const cfg = STATUS_CONFIG[apt.status] || { label: apt.status, cls: "status-pendiente" };
                                return (
                                    <tr key={apt.id} className={index % 2 === 0 ? "row-even" : "row-odd"}>
                                        <td className="col-date">{apt.date}</td>
                                        <td className="col-time">{apt.time}</td>
                                        <td className="col-owner"><strong>{apt.owner}</strong></td>
                                        <td className="col-pet">{apt.pet}</td>
                                        <td className="col-service">{apt.service}</td>
                                        <td className="col-status">
                                            <span className={`status-badge ${cfg.cls}`}>
                                                {cfg.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </main>

            <FooterGuest />
        </div>
    );
}
