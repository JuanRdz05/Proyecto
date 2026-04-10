import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavbarVet } from "../../../components/NavbarVet/navbarVet.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./vets.css";

// Datos placeholder — se conectará al backend más adelante
const STATS = {
    total: 8,
    completed: 5,
    pending: 3,
};

const ALL_APPOINTMENTS = [
    { id: 1, time: "10:00 AM", owner: "Carlos Ruiz",    pet: "Max",     service: "Chequeo Anual" },
    { id: 2, time: "11:30 AM", owner: "María López",    pet: "Charlie", service: "Vacunación"    },
    { id: 3, time: "2:30 PM",  owner: "Ana Martínez",   pet: "Bella",   service: "Consulta"      },
    { id: 4, time: "3:00 PM",  owner: "Roberto Silva",  pet: "Luna",    service: "Desparasitación"},
    { id: 5, time: "3:45 PM",  owner: "Laura Vega",     pet: "Toby",    service: "Cirugía menor"  },
    { id: 6, time: "4:15 PM",  owner: "Jorge Mendoza",  pet: "Rocky",   service: "Vacunación"    },
    { id: 7, time: "4:50 PM",  owner: "Sofía Herrera",  pet: "Mia",     service: "Chequeo Anual" },
    { id: 8, time: "5:30 PM",  owner: "Diego Torres",   pet: "Coco",    service: "Consulta"      },
];

const INITIAL_COUNT = 3;

export function VetHome() {
    const navigate = useNavigate();
    const userName = localStorage.getItem("userName") || "Doctor";
    const [showAll, setShowAll] = useState(false);

    const visibleAppointments = showAll ? ALL_APPOINTMENTS : ALL_APPOINTMENTS.slice(0, INITIAL_COUNT);

    return (
        <div className="vet-page-container">
            <NavbarVet />

            <main className="vet-main">
                {/* Bienvenida */}
                <h1 className="vet-welcome">¡Bienvenido, Dr. {userName}!</h1>

                {/* Tarjetas de estadísticas */}
                <div className="vet-stats-grid">
                    <div className="vet-stat-card">
                        <p className="stat-label">Citas del día de hoy</p>
                        <span className="stat-value">{STATS.total}</span>
                    </div>
                    <div className="vet-stat-card">
                        <p className="stat-label">Completadas</p>
                        <span className="stat-value">{STATS.completed}</span>
                    </div>
                    <div className="vet-stat-card">
                        <p className="stat-label">Pendientes</p>
                        <span className="stat-value">{STATS.pending}</span>
                    </div>
                </div>

                {/* Lista de citas del día */}
                <section className="vet-appointments-section">
                    <div className="vet-appointments-header">
                        <h2>Citas del día</h2>
                        <button
                            className="btn-ver-todas"
                            onClick={() => setShowAll((prev) => !prev)}
                        >
                            {showAll ? "Ver menos" : "Ver todas"}
                        </button>
                    </div>

                    <div className="vet-appointments-card">
                        {visibleAppointments.map((apt, index) => (
                            <div
                                key={apt.id}
                                className={`vet-apt-row ${index < visibleAppointments.length - 1 ? "with-divider" : ""}`}
                            >
                                <div className="vet-apt-info">
                                    <p className="vet-apt-time">
                                        {apt.time} — <strong>{apt.owner}</strong>
                                    </p>
                                    <p className="vet-apt-detail">
                                        {apt.pet} · {apt.service}
                                    </p>
                                </div>
                                <button
                                    className="btn-atender"
                                    onClick={() => navigate(`/atender-cita/${apt.id}`)}
                                >
                                    Atender
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <FooterGuest />
        </div>
    );
}
