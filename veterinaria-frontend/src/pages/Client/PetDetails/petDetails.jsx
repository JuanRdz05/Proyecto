import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./petDetails.css";

// Datos placeholder — se conectará al backend más adelante
const MOCK_PET = {
    name: "Iggy",
    petType: "perro",
    fechaNacimiento: "2020-05-15",
    isActive: true,
};

export function PetDetails() {
    const pet = MOCK_PET;

    const speciesLabel = (type) => {
        const map = {
            perro: "Perro", gato: "Gato",
            conejo: "Conejo", ave: "Ave",
            reptil: "Reptil", otro: "Otro",
        };
        return map[type] || type;
    };

    return (
        <div className="petdetails-page-container">
            <NavbarClient />

            <main className="petdetails-main">
                <div className="petdetails-card">
                    <h2 className="petdetails-title">Perfil de mascota</h2>

                    {/* Campos de solo lectura */}
                    <div className="petdetails-field">
                        <label>Nombre</label>
                        <input type="text" value={pet.name} readOnly />
                    </div>

                    <div className="petdetails-field">
                        <label>Especie</label>
                        <input type="text" value={speciesLabel(pet.petType)} readOnly />
                    </div>

                    <div className="petdetails-field">
                        <label>Fecha de nacimiento</label>
                        <input type="text" value={pet.fechaNacimiento || "No registrada"} readOnly />
                    </div>

                    <div className="petdetails-field">
                        <label>Estado</label>
                        <input
                            type="text"
                            value={pet.isActive ? "Activo" : "Inactivo"}
                            readOnly
                            className={pet.isActive ? "status-active" : "status-inactive"}
                        />
                    </div>

                    {/* Botón editar */}
                    <div className="petdetails-actions">
                        <button
                            type="button"
                            className="btn-edit-petdetails"
                            onClick={() => {/* TODO: implementar edición */}}
                        >
                            ✏️ Editar mascota
                        </button>
                    </div>
                </div>
            </main>

            <FooterGuest />
        </div>
    );
}
