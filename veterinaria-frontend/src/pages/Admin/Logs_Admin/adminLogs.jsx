import { useState, useEffect, useCallback } from "react";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import { getAllLogs } from "../../../services/Admin/logs.js";
import "./adminLogs.css";

// Config de badges para cada acción
const ACTION_CONFIG = {
	CREATE: { label: "Crear", cls: "action-create" },
	UPDATE: { label: "Editar", cls: "action-update" },
	DELETE: { label: "Eliminar", cls: "action-delete" },
	LOGIN: { label: "Login", cls: "action-login" },
	LOGOUT: { label: "Logout", cls: "action-logout" },
};

// Etiqueta legible del rol
const ROLE_LABEL = {
	admin: "Admin",
	vet: "Veterinario",
	client: "Cliente",
};

const ACTIONS = ["TODAS", "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"];

export function AdminLogs() {
	// Estados
	const [logs, setLogs] = useState([]);
	const [filterAction, setFilterAction] = useState("TODAS");
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	// Paginación
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);

	// UI states
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Debounce para búsqueda (300ms)
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setCurrentPage(1); // Reset a página 1 al buscar
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Cargar logs cuando cambian filtros o página
	const fetchLogs = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await getAllLogs({
				action: filterAction,
				search: debouncedSearch,
				page: currentPage,
				limit: 5,
			});

			setLogs(data.logs || []);
			setTotalPages(data.pagination?.totalPages || 1);
			setTotalCount(data.pagination?.totalCount || 0);
		} catch (err) {
			console.error("Error cargando logs:", err);
			setError(err.message);
			setLogs([]);
		} finally {
			setLoading(false);
		}
	}, [filterAction, debouncedSearch, currentPage]);

	useEffect(() => {
		fetchLogs();
	}, [fetchLogs]);

	// Handlers
	const handleActionFilter = (action) => {
		setFilterAction(action);
		setCurrentPage(1); // Reset a página 1 al cambiar filtro
	};

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

	const goToPage = (page) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
			// Scroll al top de la tabla
			document
				.querySelector(".logs-table-wrapper")
				?.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	// Generar array de páginas para mostrar (máximo 5 números)
	const getPageNumbers = () => {
		const pages = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			let start = Math.max(1, currentPage - 2);
			let end = Math.min(totalPages, start + maxVisible - 1);

			if (end - start < maxVisible - 1) {
				start = Math.max(1, end - maxVisible + 1);
			}

			for (let i = start; i <= end; i++) pages.push(i);
		}
		return pages;
	};

	return (
		<div className="logs-container">
			<NavbarAdmin />

			<main className="logs-main">
				{/* Encabezado */}
				<div className="logs-header">
					<div>
						<h1 className="logs-title">Logs</h1>
						<p className="logs-subtitle">
							Historial de actividades y cambios en el sistema
						</p>
					</div>
				</div>

				{/* Toolbar: Búsqueda + Contador */}
				<div className="logs-toolbar">
					<div className="logs-search">
						<span className="search-icon">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={2}
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
								/>
							</svg>
						</span>
						<input
							type="text"
							placeholder="Buscar por descripción..."
							value={searchQuery}
							onChange={handleSearchChange}
						/>
					</div>
					<span className="logs-count">
						{totalCount} {totalCount === 1 ? "registro" : "registros"}
					</span>
				</div>

				{/* Filtros por acción */}
				<div className="logs-filters">
					{ACTIONS.map((a) => (
						<button
							key={a}
							className={`btn-log-filter ${filterAction === a ? "active" : ""}`}
							onClick={() => handleActionFilter(a)}
							disabled={loading}
						>
							{a === "TODAS" ? "Todas" : ACTION_CONFIG[a].label}
						</button>
					))}
				</div>

				{/* Tabla */}
				<div className="logs-table-wrapper">
					{loading ? (
						<div className="logs-loading">
							<div className="spinner"></div>
							<p>Cargando logs...</p>
						</div>
					) : error ? (
						<div className="logs-error">
							<p>Error: {error}</p>
							<button onClick={fetchLogs} className="btn-retry">
								Reintentar
							</button>
						</div>
					) : (
						<table className="logs-table">
							<thead>
								<tr>
									<th>Fecha</th>
									<th>Acción</th>
									<th>Recurso</th>
									<th>Descripción</th>
									<th>Usuario</th>
								</tr>
							</thead>
							<tbody>
								{logs.length === 0 ? (
									<tr>
										<td colSpan={5} className="logs-empty">
											<div className="empty-content">
												<span className="empty-icon">📋</span>
												<p>No hay logs que mostrar.</p>
												<span>
													Intenta con otros filtros o términos de búsqueda.
												</span>
											</div>
										</td>
									</tr>
								) : (
									logs.map((log) => {
										const cfg = ACTION_CONFIG[log.action] || {
											label: log.action,
											cls: "action-create",
										};
										const userName = log.user?.name || "Sistema";
										const userRole =
											ROLE_LABEL[log.user?.role] || log.user?.role || "N/A";

										// Formatear fecha
										const dateStr = log.createdAt
											? new Date(log.createdAt).toLocaleString("es-ES", {
													year: "numeric",
													month: "2-digit",
													day: "2-digit",
													hour: "2-digit",
													minute: "2-digit",
												})
											: "N/A";

										return (
											<tr key={log._id || log.id}>
												<td className="col-date">{dateStr}</td>
												<td className="col-action">
													<span className={`action-badge ${cfg.cls}`}>
														{cfg.label}
													</span>
												</td>
												<td className="col-resource">{log.resource}</td>
												<td className="col-desc">{log.description}</td>
												<td className="col-user">
													<span className="user-name">{userName}</span>
													<span className="user-role">{userRole}</span>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					)}
				</div>

				{/* Paginación */}
				{!loading && !error && logs.length > 0 && totalPages > 1 && (
					<div className="logs-pagination">
						<div className="pagination">
							<button
								className="pagination-btn"
								onClick={() => goToPage(currentPage - 1)}
								disabled={currentPage === 1}
							>
								Anterior
							</button>

							<div className="pagination-pages">
								{getPageNumbers().map((page) => (
									<button
										key={page}
										className={`pagination-page ${currentPage === page ? "active" : ""}`}
										onClick={() => goToPage(page)}
									>
										{page}
									</button>
								))}
							</div>

							<button
								className="pagination-btn"
								onClick={() => goToPage(currentPage + 1)}
								disabled={currentPage === totalPages}
							>
								Siguiente
							</button>
						</div>
						<p className="pagination-info">
							Página {currentPage} de {totalPages} • Mostrando {logs.length} de{" "}
							{totalCount} registros
						</p>
					</div>
				)}
			</main>

			<FooterGuest />
		</div>
	);
}
