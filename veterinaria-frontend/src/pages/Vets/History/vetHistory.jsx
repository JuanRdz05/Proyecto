import { useEffect, useState } from "react";
import { getVetHistory } from "../../../services/Vet/citas.js";
import { NavbarVet } from "../../../components/NavbarVet/navbarVet.jsx";
import { PageTransition } from "../../../components/PageTransition/PageTransition.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import "./vetHistory.css";

// Etiqueta y clase CSS para cada estado del modelo
const STATUS_CONFIG = {
	Pendiente: { label: "Pendiente", cls: "status-pendiente" },
	Aceptada: { label: "Aceptada", cls: "status-pendiente" },
	"En progreso": { label: "En progreso", cls: "status-pendiente" },
	Rechazada: { label: "Rechazada", cls: "status-rechazada" },
	Cancelada: { label: "Cancelada", cls: "status-cancelada" },
	Terminada: { label: "Completada", cls: "status-terminada" },
};

export function VetHistory() {
	const [history, setHistory] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchHistory = async () => {
			try {
				setLoading(true);
				const data = await getVetHistory();
				if (data.appointments) {
					setHistory(data.appointments);
				}
			} catch (err) {
				setError(err.message || "Error al cargar el historial");
			} finally {
				setLoading(false);
			}
		};

		fetchHistory();
	}, []);

	// Bloquear si está verificando o inactivo
	return (
		<div className="vethist-page-container">
			<NavbarVet />

			<PageTransition>
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
								{loading && (
									<tr>
										<td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
											Cargando historial...
										</td>
									</tr>
								)}
								{error && (
									<tr>
										<td colSpan="6" style={{ textAlign: "center", color: "red", padding: "2rem" }}>
											{error}
										</td>
									</tr>
								)}
								{!loading && !error && history.length === 0 && (
									<tr>
										<td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
											No tienes citas en tu historial.
										</td>
									</tr>
								)}
								{!loading && !error && history.map((apt, index) => {
									const cfg = STATUS_CONFIG[apt.status] || {
										label: apt.status,
										cls: "status-pendiente",
									};
									return (
										<tr
											key={apt._id}
											className={index % 2 === 0 ? "row-even" : "row-odd"}
										>
											<td className="col-date">{apt.date}</td>
											<td className="col-time">{apt.time}</td>
											<td className="col-owner">
												<strong>{apt.owner?.name} {apt.owner?.paternalLastName}</strong>
											</td>
											<td className="col-pet">{apt.pet?.name}</td>
											<td className="col-service">{apt.service?.name}</td>
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
			</PageTransition>

			<FooterGuest />
		</div>
	);
}
