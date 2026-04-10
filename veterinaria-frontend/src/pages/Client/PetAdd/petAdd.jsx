import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./petAdd.css";

export function PetAdd() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre: "",
        fechaNacimiento: "",
        especie: "",
        especieOtro: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            // Si cambia especie y ya no es "otro", limpia el campo extra
            ...(name === "especie" && value !== "otro" ? { especieOtro: "" } : {}),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: conectar con el backend
        const especieFinal = formData.especie === "otro"
            ? formData.especieOtro
            : formData.especie;
        console.log("Nueva mascota:", { ...formData, especieFinal });
    };

    return (
        <div className="petadd-page-container">
            <NavbarClient />

            <main className="petadd-main">
                <div className="petadd-card">
                    <h2 className="petadd-title">Información básica</h2>

                    <form onSubmit={handleSubmit} className="petadd-form">

                        {/* Nombre */}
                        <div className="petadd-field">
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder=""
                            />
                        </div>

                        {/* Fecha de nacimiento */}
                        <div className="petadd-field">
                            <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
                            <input
                                type="date"
                                id="fechaNacimiento"
                                name="fechaNacimiento"
                                value={formData.fechaNacimiento}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Especie */}
                        <div className="petadd-field">
                            <label htmlFor="especie">Especie</label>
                            <div className="select-wrapper-pa">
                                <select
                                    id="especie"
                                    name="especie"
                                    value={formData.especie}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled></option>
                                    <option value="perro">Perro</option>
                                    <option value="gato">Gato</option>
                                    <option value="conejo">Conejo</option>
                                    <option value="otro">Otro</option>
                                </select>
                                <span className="select-arrow-pa">&#8964;</span>
                            </div>
                        </div>

                        {/* Campo extra si especie = "otro" */}
                        {formData.especie === "otro" && (
                            <div className="petadd-field petadd-field-extra">
                                <label htmlFor="especieOtro">Especifica la especie</label>
                                <input
                                    type="text"
                                    id="especieOtro"
                                    name="especieOtro"
                                    value={formData.especieOtro}
                                    onChange={handleChange}
                                    placeholder="Ej: Tortuga, Hámster..."
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Botones */}
                        <div className="petadd-actions">
                            <button
                                type="button"
                                className="btn-cancel-petadd"
                                onClick={() => navigate(-1)}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="btn-submit-petadd">
                                Agregar
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <FooterGuest />
        </div>
    );
}
