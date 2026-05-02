import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import { getProfile } from "../../../services/Client/profile.js";
import { getAllPets, togglePetStatus } from "../../../services/Admin/pets.js";
import "./adminPets.css";
import { useAdminGuard } from "../../../hooks/useAdminGuard.jsx";

function initials(name) {
	if (!name) return "??";
	return name
		.split(" ")
		.filter((w) => w.length > 0)
		.slice(0, 2)
		.map((w) => w[0].toUpperCase())
		.join("");
}

export function AdminPets() {
	const navigate = useNavigate();
	const { checking, isActive, BlockedScreen } = useAdminGuard();

	// Estados para la lista y paginación
	const [pets, setPets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [pagination, setPagination] = useState({
		page: 1,
		totalPages: 1,
		total: 0,
	});

	// Estados para la validación de seguridad (Admin activo)[cite: 1]
	const [isActiveAdmin, setIsActiveAdmin] = useState(true);
	const [checkingAdmin, setCheckingAdmin] = useState(true);

	// 1. Verificar estado del administrador al cargar[cite: 1]
	useEffect(() => {
		const verifyAdmin = async () => {
			try {
				const data = await getProfile();
				if (data.isActive === false) {
					setIsActiveAdmin(false);
				}
			} catch (error) {
				console.error("Error de verificación:", error);
			} finally {
				setCheckingAdmin(false);
			}
		};
		verifyAdmin();
	}, []);

	// 2. Cargar mascotas desde el backend (Paginadas)
	const fetchPets = async (page = 1) => {
		try {
			setLoading(true);
			const data = await getAllPets(page, 5); // Límite de 5 según tu controlador
			setPets(data.pets);
			setPagination(data.pagination);
		} catch (error) {
			toast.error("Error al cargar las mascotas.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isActiveAdmin) fetchPets();
	}, [isActiveAdmin]);

	// Lógica de Logout para cuenta bloqueada[cite: 1]
	const handleLogout = async () => {
		try {
			await fetch("http://localhost:3050/users/v1/logout", {
				method: "POST",
				credentials: "include",
			});
			localStorage.clear();
			navigate("/inicio-sesion");
		} catch (e) {
			toast.error("Error al cerrar sesión.");
		}
	};

	// Cambio de estado (Toggle) exclusivo del Admin[cite: 4, 6]
	const handleToggle = async (id) => {
		try {
			const response = await togglePetStatus(id);
			// Actualización optimista del estado local
			setPets((prev) =>
				prev.map((p) =>
					p._id === id ? { ...p, isActive: response.pet.isActive } : p,
				),
			);
			toast.success(response.message);
		} catch (error) {
			toast.error("No se pudo cambiar el estado de la mascota.");
		}
	};
	if (checking || !isActive) return <BlockedScreen />;
	// Filtrado local para la búsqueda por texto
	const filtered = pets.filter((p) => {
		const q = search.toLowerCase();
		const ownerFull =
			`${p.owner?.name || ""} ${p.owner?.paternalLastName || ""}`.toLowerCase();
		return (
			p.name.toLowerCase().includes(q) ||
			p.petType.toLowerCase().includes(q) || // Usamos petType del modelo[cite: 4]
			ownerFull.includes(q)
		);
	});

	// --- RENDERIZADO DE SEGURIDAD ---

	if (checkingAdmin) {
		return (
			<div className="admin-loading-screen">
				<p>Verificando credenciales...</p>
			</div>
		);
	}

	if (!isActiveAdmin) {
		return (
			<div className="admin-blocked-screen">
				<div className="admin-blocked-card">
					<div className="blocked-icon">🚫</div>
					<h2>Acceso Restringido</h2>
					<p>Tu cuenta de administrador ha sido suspendida.</p>
					<button className="btn-logout-blocked" onClick={handleLogout}>
						Cerrar sesión
					</button>
				</div>
			</div>
		);
	}

	// --- RENDERIZADO PRINCIPAL ---

	return (
		<div className="adminpets-container">
			<NavbarAdmin />

			<main className="adminpets-main">
				<h1 className="adminpets-title">Gestión de Mascotas</h1>

				<div className="adminpets-toolbar">
					<div className="adminpets-search">
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
							placeholder="Buscar por nombre, especie o dueño..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>

				<div className="adminpets-table-wrapper">
					<table className="adminpets-table">
						<thead>
							<tr>
								<th>Mascota</th>
								<th>Especie</th>
								<th>Dueño</th>
								<th>Estado Actual</th>
								<th>Acción Admin</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan={5} className="empty-row">
										Cargando datos...
									</td>
								</tr>
							) : filtered.length === 0 ? (
								<tr>
									<td colSpan={5} className="empty-row">
										No hay registros que mostrar.
									</td>
								</tr>
							) : (
								filtered.map((pet) => (
									<tr key={pet._id}>
										<td className="col-pet">
											<div className="pet-avatar">{initials(pet.name)}</div>
											<strong>{pet.name}</strong>
										</td>
										<td className="col-species">{pet.petType}</td>
										<td className="col-owner">
											{pet.owner
												? `${pet.owner.name} ${pet.owner.paternalLastName}`
												: "N/A"}
										</td>
										<td className="col-status">
											<span
												className={`pet-badge ${pet.isActive ? "badge-activo" : "badge-inactivo"}`}
											>
												{pet.isActive ? "Activa" : "Desactivada"}
											</span>
										</td>
										<td className="col-action">
											<button
												className={`toggle-switch ${pet.isActive ? "on" : "off"}`}
												onClick={() => handleToggle(pet._id)}
												title={
													pet.isActive
														? "Desactivar mascota"
														: "Activar mascota"
												}
											>
												<span className="toggle-knob" />
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* PAGINACIÓN ESTILO HISTORY[cite: 8] */}
				{pagination.totalPages > 1 && (
					<div className="pagination-container">
						<div className="pagination">
							<button
								className="pagination-btn"
								disabled={pagination.page === 1}
								onClick={() => fetchPets(pagination.page - 1)}
							>
								Anterior
							</button>

							<div className="pagination-pages">
								{[...Array(pagination.totalPages)].map((_, i) => (
									<button
										key={i + 1}
										className={`pagination-page ${pagination.page === i + 1 ? "active" : ""}`}
										onClick={() => fetchPets(i + 1)}
									>
										{i + 1}
									</button>
								))}
							</div>

							<button
								className="pagination-btn"
								disabled={pagination.page === pagination.totalPages}
								onClick={() => fetchPets(pagination.page + 1)}
							>
								Siguiente
							</button>
						</div>
						<div className="pagination-info">
							Página {pagination.page} de {pagination.totalPages} (
							{pagination.total} mascotas en total)
						</div>
					</div>
				)}
			</main>

			<FooterGuest />
		</div>
	);
}
