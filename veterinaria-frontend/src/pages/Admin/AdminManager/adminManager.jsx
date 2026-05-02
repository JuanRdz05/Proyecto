import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import {
	getAllAdmins,
	toggleAdminStatus,
} from "../../../services/Admin/admins.js";
import "./adminManager.css";
import { useAdminGuard } from "../../../hooks/useAdminGuard.jsx";

function initials(name) {
	return name
		.split(" ")
		.filter((w) => w.length > 2)
		.slice(0, 2)
		.map((w) => w[0].toUpperCase())
		.join("");
}

export function AdminManager() {
	const navigate = useNavigate();
	const { checking, isActive, BlockedScreen } = useAdminGuard();

	if (checking || !isActive) return <BlockedScreen />;
	const [search, setSearch] = useState("");
	const [admins, setAdmins] = useState([]);
	const [loading, setLoading] = useState(true);
	const currentUserId = localStorage.getItem("userId"); // ID del admin logueado

	// Cargar administradores del backend
	useEffect(() => {
		const fetchAdmins = async () => {
			try {
				setLoading(true);
				const data = await getAllAdmins();
				setAdmins(data.admins || []);
			} catch (error) {
				console.error("Error al cargar administradores:", error);
				toast.error(
					error.message || "No se pudieron cargar los administradores",
					{
						position: "top-right",
						autoClose: 4000,
					},
				);
				setAdmins([]);
			} finally {
				setLoading(false);
			}
		};
		fetchAdmins();
	}, []);

	const filtered = admins.filter((a) => {
		const q = search.toLowerCase();
		return (
			a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q)
		);
	});

	const handleToggleActive = async (id) => {
		// No permitir desactivarse a sí mismo (frontend)
		if (id === currentUserId) {
			toast.warning("No puedes desactivar tu propia cuenta", {
				position: "top-right",
				autoClose: 3000,
			});
			return;
		}

		try {
			await toggleAdminStatus(id);
			setAdmins((prev) =>
				prev.map((a) => (a._id === id ? { ...a, isActive: !a.isActive } : a)),
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

	const isCurrentUser = (id) => id === currentUserId;

	return (
		<div className="adminmgr-container">
			<NavbarAdmin />

			<main className="adminmgr-main">
				<h1 className="adminmgr-title">Administradores</h1>

				<div className="adminmgr-toolbar">
					<div className="adminmgr-search">
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

					<button
						className="btn-nuevo-admin"
						onClick={() => navigate("/admin/nuevo-administrador")}
					>
						<span className="btn-nuevo-label">Nuevo administrador</span>
						<span className="btn-nuevo-plus">+</span>
					</button>
				</div>

				<div className="adminmgr-table-wrapper">
					{loading ? (
						<div className="adminmgr-loading">Cargando administradores...</div>
					) : (
						<table className="adminmgr-table">
							<thead>
								<tr>
									<th>Administrador</th>
									<th>Email</th>
									<th>Estado</th>
									<th>Activar/Desactivar</th>
								</tr>
							</thead>
							<tbody>
								{filtered.length === 0 ? (
									<tr>
										<td colSpan={4} className="empty-row">
											No se encontraron administradores.
										</td>
									</tr>
								) : (
									filtered.map((admin) => (
										<tr
											key={admin._id}
											className={
												isCurrentUser(admin._id) ? "current-user-row" : ""
											}
										>
											<td className="col-admin">
												<div className="admin-avatar">
													{initials(admin.name || "A")}
												</div>
												<div className="admin-name-wrapper">
													<strong>{admin.name}</strong>
													{isCurrentUser(admin._id) && (
														<span className="current-user-badge">Tú</span>
													)}
												</div>
											</td>
											<td className="col-email">{admin.email}</td>
											<td className="col-status">
												<span
													className={`admin-status-badge ${admin.isActive ? "badge-activo" : "badge-inactivo"}`}
												>
													{admin.isActive ? "Activo" : "Inactivo"}
												</span>
											</td>
											<td className="col-action">
												{isCurrentUser(admin._id) ? (
													<span
														className="self-action-disabled"
														title="No puedes modificarte a ti mismo"
													>
														—
													</span>
												) : (
													<button
														className={`toggle-switch ${admin.isActive ? "on" : "off"}`}
														onClick={() => handleToggleActive(admin._id)}
														title={admin.isActive ? "Desactivar" : "Activar"}
													>
														<span className="toggle-knob" />
													</button>
												)}
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
