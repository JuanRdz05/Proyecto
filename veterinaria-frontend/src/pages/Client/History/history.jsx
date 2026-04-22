import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./history.css";

// Datos placeholder — se conectará al backend más adelante
const MOCK_HISTORY = [
    { id: 1, pet: "Iggy", species: "Perro", date: "25/10/2023", time: "10:00 AM" },
    { id: 2, pet: "Iggy", species: "Perro", date: "25/10/2023", time: "10:00 AM" },
    { id: 3, pet: "Iggy", species: "Perro", date: "25/10/2023", time: "10:00 AM" },
    { id: 4, pet: "Iggy", species: "Perro", date: "25/10/2023", time: "10:00 AM" },
    { id: 5, pet: "Iggy", species: "Perro", date: "25/10/2023", time: "10:00 AM" },
    { id: 6, pet: "Iggy", species: "Perro", date: "25/10/2023", time: "10:00 AM" },
];

export function History() {
    return (
        <div className="history-page-container">
            <NavbarClient />

            <main className="history-main">
                <div className="history-card">
                    <h2 className="history-title">Historial de citas</h2>

                    <ul className="history-list">
                        {MOCK_HISTORY.map((item, index) => (
                            <li
                                key={item.id}
                                className={`history-item ${index < MOCK_HISTORY.length - 1 ? "with-divider" : ""}`}
                            >
                                <span className="history-pet-label">
                                    {item.pet} - {item.species}
                                </span>
                                <div className="history-datetime">
                                    <span>{item.date}</span>
                                    <span>{item.time}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>

            <FooterGuest />
        </div>
    );
}
