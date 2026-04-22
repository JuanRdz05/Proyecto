import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./addService.css";

export function AddService() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
    });

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // TODO: conectar con el backend
            console.log("Nuevo servicio:", form);
            alert("Servicio creado exitosamente.");
            navigate("/admin/servicios");
        } catch (error) {
            alert(error.message || "Error al crear el servicio.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="addsvc-page-container">
            <NavbarAdmin />

            <main className="addsvc-main">
                <div className="addsvc-card">
                    <h2 className="addsvc-title">Nuevo servicio</h2>

                    <form onSubmit={handleSubmit} className="addsvc-form">
                        {/* Nombre */}
                        <div className="addsvc-field">
                            <label htmlFor="name">Nombre</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Nombre del servicio"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Descripción */}
                        <div className="addsvc-field">
                            <label htmlFor="description">Descripción</label>
                            <textarea
                                id="description"
                                name="description"
                                placeholder="Describe el servicio..."
                                value={form.description}
                                onChange={handleChange}
                                rows={4}
                                required
                            />
                        </div>

                        {/* Precio */}
                        <div className="addsvc-field">
                            <label htmlFor="price">Precio</label>
                            <div className="price-input-wrapper">
                                <span className="currency-badge">$</span>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={form.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="addsvc-actions">
                            <button
                                type="button"
                                className="btn-cancel-svc"
                                onClick={() => navigate(-1)}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="btn-save-svc" disabled={loading}>
                                {loading ? "Guardando..." : "Guardar"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <FooterGuest />
        </div>
    );
}
