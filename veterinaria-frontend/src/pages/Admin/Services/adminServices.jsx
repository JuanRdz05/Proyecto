import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import {
	getAllServices,
	toggleServiceStatus,
} from "../../../services/Admin/services.js";
import "./adminServices.css";

// Ícono de lápiz SVG
function PencilIcon() {
	return (
		<svg
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			width="14"
			height="14"
		>
			<path d="M14.5 2.5a2.121 2.121 0 0 1 3 3L6 17l-4 1 1-4L14.5 2.5z" />
		</svg>
	);
}

export function AdminServices() {
	const navigate = useNavigate();
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editingId, setEditingId] = useState(null);
	const [editDraft, setEditDraft] = useState({});

	// Cargar servicios desde el backend
	useEffect(() => {
		const fetchServices = async () => {
			try {
				setLoading(true);
				const data = await getAllServices();
				// El backend devuelve { message, services }
				const servicesList = data.services || [];
				setServices(servicesList);
			} catch (error) {
				console.error("Error al cargar servicios:", error);
				toast.error(
					`❌ ${error.message || "No se pudieron cargar los servicios"}`,
					{
						position: "top-right",
						autoClose: 4000,
					},
				);
				setServices([]);
			} finally {
				setLoading(false);
			}
		};
		fetchServices();
	}, []);

	// Estadísticas
	const total = services.length;
	const activos = services.filter((s) => s.isActive).length;
	const inactivos = total - activos;

	const handleToggleActive = async (id) => {
		try {
			await toggleServiceStatus(id);
			// Actualizar estado localmente
			setServices((prev) =>
				prev.map((s) => (s._id === id ? { ...s, isActive: !s.isActive } : s)),
			);
			toast.success("Estado actualizado", {
				position: "top-right",
				autoClose: 2000,
			});
		} catch (error) {
			console.error("Error al cambiar estado:", error);
			toast.error(`❌ ${error.message || "No se pudo cambiar el estado"}`, {
				position: "top-right",
				autoClose: 4000,
			});
		}
	};

	const startEdit = (service) => {
		setEditingId(service._id);
		setEditDraft({
			name: service.name,
			description: service.description,
			price: service.price,
		});
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditDraft({});
	};

	const saveEdit = (id) => {
		// TODO: conectar con backend cuando tengas updateService
		setServices((prev) =>
			prev.map((s) =>
				s._id === id
					? {
							...s,
							name: editDraft.name,
							description: editDraft.description,
							price: parseFloat(editDraft.price),
						}
					: s,
			),
		);
		cancelEdit();
		toast.success("✅ Cambios guardados (localmente)", {
			position: "top-right",
			autoClose: 2000,
		});
	};

	if (loading) {
		return (
			<div className="svc-container">
				<NavbarAdmin />
				<main className="svc-main">
					<div className="svc-header">
						<h1 className="svc-title">Servicios</h1>
					</div>
					<div className="svc-loading">Cargando servicios...</div>
				</main>
				<FooterGuest />
			</div>
		);
	}

	return (
		<div className="svc-container">
			<NavbarAdmin />

			<main className="svc-main">
				{/* Encabezado */}
				<div className="svc-header">
					<h1 className="svc-title">Servicios</h1>
					<button
						className="btn-agregar-svc"
						onClick={() => navigate("/admin/nuevo-servicio")}
					>
						<span className="btn-agregar-plus">+</span>
						Agregar
					</button>
				</div>

				{/* Estadísticas */}
				<div className="svc-stats">
					<div className="stat-box">
						<span className="stat-number">{total}</span>
						<span className="stat-label">Total</span>
					</div>
					<div className="stat-box stat-activos">
						<span className="stat-number">{activos}</span>
						<span className="stat-label">Activos</span>
					</div>
					<div className="stat-box stat-inactivos">
						<span className="stat-number">{inactivos}</span>
						<span className="stat-label">Inactivos</span>
					</div>
				</div>

				{/* Tabla */}
				<div className="svc-table-wrapper">
					{services.length === 0 ? (
						<div className="svc-empty">
							<p>No hay servicios registrados</p>
							<button
								className="btn-agregar-svc"
								onClick={() => navigate("/admin/nuevo-servicio")}
							>
								+ Agregar primer servicio
							</button>
						</div>
					) : (
						<table className="svc-table">
							<thead>
								<tr>
									<th>Servicio</th>
									<th>Descripción</th>
									<th>Precio</th>
									<th>Estado</th>
									<th>Activo</th>
									<th>Editar</th>
								</tr>
							</thead>
							<tbody>
								{services.map((svc) => (
									<tr key={svc._id}>
										{/* Nombre */}
										<td className="col-svc-name">
											{editingId === svc._id ? (
												<input
													className="edit-input"
													value={editDraft.name}
													onChange={(e) =>
														setEditDraft({ ...editDraft, name: e.target.value })
													}
												/>
											) : (
												<strong>{svc.name}</strong>
											)}
										</td>

										{/* Descripción */}
										<td className="col-svc-desc">
											{editingId === svc._id ? (
												<input
													className="edit-input edit-input-wide"
													value={editDraft.description}
													onChange={(e) =>
														setEditDraft({
															...editDraft,
															description: e.target.value,
														})
													}
												/>
											) : (
												svc.description
											)}
										</td>

										{/* Precio */}
										<td className="col-svc-price">
											{editingId === svc._id ? (
												<input
													className="edit-input edit-input-price"
													type="number"
													step="0.01"
													min="0"
													value={editDraft.price}
													onChange={(e) =>
														setEditDraft({
															...editDraft,
															price: e.target.value,
														})
													}
												/>
											) : (
												`$${svc.price.toFixed(2)}`
											)}
										</td>

										{/* Estado badge */}
										<td className="col-svc-status">
											<span
												className={`svc-badge ${svc.isActive ? "badge-activo" : "badge-inactivo"}`}
											>
												{svc.isActive ? "Activo" : "Inactivo"}
											</span>
										</td>

										{/* Toggle */}
										<td className="col-svc-toggle">
											<button
												className={`toggle-switch ${svc.isActive ? "on" : "off"}`}
												onClick={() => handleToggleActive(svc._id)}
												title={svc.isActive ? "Desactivar" : "Activar"}
											>
												<span className="toggle-knob" />
											</button>
										</td>

										{/* Botón Editar / Guardar + Cancelar */}
										<td className="col-svc-edit">
											{editingId === svc._id ? (
												<div className="edit-actions">
													<button
														className="btn-save-edit"
														onClick={() => saveEdit(svc._id)}
													>
														✓
													</button>
													<button
														className="btn-cancel-edit"
														onClick={cancelEdit}
													>
														✕
													</button>
												</div>
											) : (
												<button
													className="btn-edit-pencil"
													onClick={() => startEdit(svc)}
													title="Editar servicio"
												>
													<PencilIcon />
												</button>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</main>

			<FooterGuest />
		</div>
	);
}
