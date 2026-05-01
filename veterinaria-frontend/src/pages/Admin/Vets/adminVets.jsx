import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import { getAllVets, toggleVetStatus } from "../../../services/Admin/vets.js";
import "./adminVets.css";

function initials(name) {
	return name
		.split(" ")
		.filter((w) => w.length > 2)
		.slice(0, 2)
		.map((w) => w[0].toUpperCase())
		.join("");
}

export function AdminVets() {
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const [vets, setVets] = useState([]);
	const [loading, setLoading] = useState(true);

	// Cargar veterinarios del backend
	useEffect(() => {
		const fetchVets = async () => {
			try {
				setLoading(true);
				const data = await getAllVets();
				setVets(data.vets || []);
			} catch (error) {
				console.error("Error al cargar veterinarios:", error);
				toast.error(error.message || "No se pudieron cargar los veterinarios", {
					position: "top-right",
					autoClose: 4000,
				});
				setVets([]);
			} finally {
				setLoading(false);
			}
		};
		fetchVets();
	}, []);

	const filtered = vets.filter((v) => {
		const q = search.toLowerCase();
		return (
			v.name?.toLowerCase().includes(q) || v.email?.toLowerCase().includes(q)
		);
	});

	const handleToggleActive = async (id) => {
		try {
			await toggleVetStatus(id);
			setVets((prev) =>
				prev.map((v) => (v._id === id ? { ...v, isActive: !v.isActive } : v)),
			);
			toast.success("Estado actualizado", {
				position: "top-right",
				autoClose: 2000,
			});
		} catch (error) {
			console.error("Error al cambiar estado:", error);
			toast.error(error.message || "No se pudo cambiar el estado", {
				position: "top-right",
				autoClose: 4000,
			});
		}
	};

	const handleNuevo = () => navigate("/admin/nuevo-veterinario");

	return (
		<div className="adminvets-container">
			<NavbarAdmin />

			<main className="adminvets-main">
				<h1 className="adminvets-title">Veterinarios</h1>

				<div className="adminvets-toolbar">
					<div className="adminvets-search">
						<span className="search-icon">
							<svg
								viewBox="0 0 20 20"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.8"
							>
								<circle cx="8.5" cy="8.5" r="5.5" />
								<line x1="13" y1="13" x2="18" y2="18" />
							</svg>
						</span>
						<input
							type="text"
							placeholder="Buscar por nombre o email..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					<button className="btn-nuevo-vet" onClick={handleNuevo}>
						<span className="btn-nuevo-label">Nuevo veterinario</span>
						<span className="btn-nuevo-plus">+</span>
					</button>
				</div>

				<div className="adminvets-table-wrapper">
					{loading ? (
						<div className="adminvets-loading">Cargando veterinarios...</div>
					) : (
						<table className="adminvets-table">
							<thead>
								<tr>
									<th>Veterinario</th>
									<th>Email</th>
									<th>Estado</th>
									<th>Activar/Desactivar</th>
								</tr>
							</thead>
							<tbody>
								{filtered.length === 0 ? (
									<tr>
										<td colSpan={4} className="empty-row">
											No se encontraron veterinarios.
										</td>
									</tr>
								) : (
									filtered.map((vet) => (
										<tr key={vet._id}>
											<td className="col-vet">
												<div className="vet-avatar">
													{initials(vet.name || "V")}
												</div>
												<strong>{vet.name}</strong>
											</td>
											<td className="col-email">{vet.email}</td>
											<td className="col-status">
												<span
													className={`vet-status-badge ${vet.isActive ? "badge-activo" : "badge-inactivo"}`}
												>
													{vet.isActive ? "Activo" : "Inactivo"}
												</span>
											</td>
											<td className="col-action">
												<button
													className={`toggle-switch ${vet.isActive ? "on" : "off"}`}
													onClick={() => handleToggleActive(vet._id)}
													title={vet.isActive ? "Desactivar" : "Activar"}
												>
													<span className="toggle-knob" />
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					)}
				</div>
			</main>

			<FooterGuest />
		</div>
	);
}
