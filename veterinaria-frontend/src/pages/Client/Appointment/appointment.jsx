import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavbarClient } from "../../../components/NavbarClient/navbarClient.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./appointment.css";

export function Appointment() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        mascota: "",
        servicio: "",
        fecha: "",
        veterinario: "",
        horario: "",
        comentarios: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: conectar con el backend
        console.log("Cita agendada:", formData);
    };

    return (
        <div className="appointment-page-container">
            <NavbarClient />

            <main className="appointment-main">
                <div className="appointment-card">
                    <h2 className="appointment-title">Información de la cita</h2>

                    <form onSubmit={handleSubmit} className="appointment-form">

                        {/* Fila: Mascota + Servicio */}
                        <div className="appointment-row">
                            <div className="appointment-field">
                                <label htmlFor="mascota">Mascota</label>
                                <div className="select-wrapper">
                                    <select
                                        id="mascota"
                                        name="mascota"
                                        value={formData.mascota}
                                        onChange={handleChange}
                                    >
                                        <option value="" disabled></option>
                                        <option value="max">Max</option>
                                        <option value="bella">Bella</option>
                                        <option value="charlie">Charlie</option>
                                    </select>
                                    <span className="select-arrow">&#8964;</span>
                                </div>
                            </div>

                            <div className="appointment-field">
                                <label htmlFor="servicio">Servicio</label>
                                <div className="select-wrapper">
                                    <select
                                        id="servicio"
                                        name="servicio"
                                        value={formData.servicio}
                                        onChange={handleChange}
                                    >
                                        <option value="" disabled></option>
                                        <option value="consulta">Consulta general</option>
                                        <option value="vacunacion">Vacunación</option>
                                        <option value="cirugia">Cirugía</option>
                                        <option value="grooming">Grooming</option>
                                    </select>
                                    <span className="select-arrow">&#8964;</span>
                                </div>
                            </div>
                        </div>

                        {/* Fecha */}
                        <div className="appointment-field full-width">
                            <label htmlFor="fecha">Fecha</label>
                            <div className="input-icon-wrapper">
                                <input
                                    type="date"
                                    id="fecha"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Veterinario */}
                        <div className="appointment-field full-width">
                            <label htmlFor="veterinario">Veterinario</label>
                            <div className="select-wrapper">
                                <select
                                    id="veterinario"
                                    name="veterinario"
                                    value={formData.veterinario}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled></option>
                                    <option value="dr_garcia">Dr. García</option>
                                    <option value="dra_lopez">Dra. López</option>
                                    <option value="dr_martinez">Dr. Martínez</option>
                                    <option value="dra_ramos">Dra. Ramos</option>
                                </select>
                                <span className="select-arrow">&#8964;</span>
                            </div>
                        </div>

                        {/* Horarios disponibles */}
                        <div className="appointment-field full-width">
                            <label htmlFor="horario">Horarios disponibles</label>
                            <div className="select-wrapper">
                                <select
                                    id="horario"
                                    name="horario"
                                    value={formData.horario}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled></option>
                                    <option value="09:00">09:00 AM</option>
                                    <option value="10:00">10:00 AM</option>
                                    <option value="11:00">11:00 AM</option>
                                    <option value="12:00">12:00 PM</option>
                                    <option value="15:00">03:00 PM</option>
                                    <option value="16:00">04:00 PM</option>
                                </select>
                                <span className="select-arrow">&#8964;</span>
                            </div>
                        </div>

                        {/* Comentarios */}
                        <div className="appointment-field full-width">
                            <label htmlFor="comentarios">Comentarios</label>
                            <textarea
                                id="comentarios"
                                name="comentarios"
                                placeholder="Describe los síntomas"
                                value={formData.comentarios}
                                onChange={handleChange}
                                rows={4}
                            />
                        </div>

                        {/* Botones */}
                        <div className="appointment-actions">
                            <button
                                type="button"
                                className="btn-cancel-appointment"
                                onClick={() => navigate(-1)}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="btn-submit-appointment">
                                Agendar cita
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <FooterGuest />
        </div>
    );
}
