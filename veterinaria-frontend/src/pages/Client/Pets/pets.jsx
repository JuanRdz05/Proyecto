import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./pets.css";

// Datos placeholder — se conectará al backend más adelante
const MOCK_PETS = [
    { id: 1, name: "Iggy",  species: "Perro" },
    { id: 2, name: "Luna",  species: "Gato" },
    { id: 3, name: "Max",   species: "Perro" },
    { id: 4, name: "Coco",  species: "Perro" },
    { id: 5, name: "Mia",   species: "Conejo" },
    { id: 6, name: "Rocky", species: "Perro" },
];

export function Pets() {
    const navigate = useNavigate();
    const [pets] = useState(MOCK_PETS);

    return (
        <div className="pets-page-container">
            <NavbarClient />

            <main className="pets-main">
                <div className="pets-card">
                    {/* Encabezado */}
                    <div className="pets-header">
                        <h2 className="pets-title">Mis mascotas</h2>
                        <button
                            className="btn-add-pet"
                            onClick={() => navigate('/nueva-mascota')}
                        >
                            + Agregar mascota
                        </button>
                    </div>

                    {/* Lista */}
                    <ul className="pets-list">
                        {pets.map((pet, index) => (
                            <li
                                key={pet.id}
                                className={`pets-list-item ${index < pets.length - 1 ? "with-divider" : ""}`}
                            >
                                <span className="pet-label">{pet.name} - {pet.species}</span>
                                <button
                                        className="btn-edit-pet"
                                        onClick={() => navigate(`/detalles-mascota/${pet.id}`)}
                                    >
                                        Detalles
                                    </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>

            <FooterGuest />
        </div>
    );
}
