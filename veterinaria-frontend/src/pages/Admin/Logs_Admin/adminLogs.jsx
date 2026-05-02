import { useState, useEffect, useCallback, useRef } from "react";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import { getAllLogs } from "../../../services/Admin/logs.js";
import "./adminLogs.css";
import { useAdminGuard } from "../../../hooks/useAdminGuard.jsx";

const ACTION_CONFIG = {
	CREATE: { label: "Crear", cls: "action-create" },
	UPDATE: { label: "Editar", cls: "action-update" },
	DELETE: { label: "Eliminar", cls: "action-delete" },
	LOGIN: { label: "Login", cls: "action-login" },
	LOGOUT: { label: "Logout", cls: "action-logout" },
};

const ROLE_LABEL = {
	admin: "Admin",
	vet: "Veterinario",
	client: "Cliente",
};

const ACTIONS = ["TODAS", "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"];

export function AdminLogs() {
	const { checking, isActive, BlockedScreen } = useAdminGuard();

	if (checking || !isActive) return <BlockedScreen />;
	const [logs, setLogs] = useState([]);
	const [filterAction, setFilterAction] = useState("TODAS");
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);

	// Estados de UI separados para evitar parpadeo
	const [isLoading, setIsLoading] = useState(false); // Carga inicial
	const [isRefreshing, setIsRefreshing] = useState(false); // Recarga con datos previos
	const [error, setError] = useState(null);
	const [retryCount, setRetryCount] = useState(0);

	// Ref para saber si es la primera carga
	const isFirstLoad = useRef(true);
	// Ref para el timeout de búsqueda
	const searchTimeoutRef = useRef(null);

	// Debounce para búsqueda (400ms — un poco más lento para no saturar)
	useEffect(() => {
		if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
		searchTimeoutRef.current = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setCurrentPage(1);
		}, 400);
		return () => {
			if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
		};
	}, [searchQuery]);

	const fetchLogs = useCallback(async () => {
		// Si ya tenemos datos, es una recarga (refresh), no carga inicial
		const hasData = logs.length > 0;
		if (hasData) {
			setIsRefreshing(true);
		} else {
			setIsLoading(true);
		}
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
			setRetryCount(0);
		} catch (err) {
			console.error("Error cargando logs:", err);
			setError(err.message);
			// NO limpiamos logs aquí — mantenemos datos anteriores si existen
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
			isFirstLoad.current = false;
		}
	}, [filterAction, debouncedSearch, currentPage, logs.length]);

	useEffect(() => {
		fetchLogs();
	}, [fetchLogs]);

	const handleActionFilter = (action) => {
		if (action === filterAction) return; // Evitar recarga si ya está activo
		setFilterAction(action);
		setCurrentPage(1);
	};

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

	const goToPage = (page) => {
		if (page >= 1 && page <= totalPages && page !== currentPage) {
			setCurrentPage(page);
			document
				.querySelector(".logs-table-wrapper")
				?.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	const handleRetry = () => {
		setRetryCount((c) => c + 1);
		fetchLogs();
	};

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

	// Render de fila skeleton
	const SkeletonRow = () => (
		<tr className="skeleton-row">
			<td>
				<div className="skeleton skeleton-date"></div>
			</td>
			<td>
				<div className="skeleton skeleton-badge"></div>
			</td>
			<td>
				<div className="skeleton skeleton-resource"></div>
			</td>
			<td>
				<div className="skeleton skeleton-desc"></div>
			</td>
			<td>
				<div className="skeleton skeleton-user-name"></div>
				<div className="skeleton skeleton-user-role"></div>
			</td>
		</tr>
	);

	// Render de fila de log real
	const LogRow = ({ log }) => {
		const cfg = ACTION_CONFIG[log.action] || {
			label: log.action,
			cls: "action-create",
		};

		const userName = log.user?.name
			? `${log.user.name} ${log.user.paternalLastName || ""}`.trim()
			: "Sistema";
		const userRole = ROLE_LABEL[log.user?.role] || log.user?.role || "N/A";

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
			<tr key={log._id || log.id} className="log-row">
				<td className="col-date">{dateStr}</td>
				<td className="col-action">
					<span className={`action-badge ${cfg.cls}`}>{cfg.label}</span>
				</td>
				<td className="col-resource">{log.resource}</td>
				<td className="col-desc">{log.description}</td>
				<td className="col-user">
					<span className="user-name">{userName}</span>
					<span className="user-role">{userRole}</span>
				</td>
			</tr>
		);
	};

	return (
		<div className="logs-container">
			<NavbarAdmin />

			<main className="logs-main">
				<div className="logs-header">
					<div>
						<h1 className="logs-title">Logs</h1>
						<p className="logs-subtitle">
							Historial de actividades y cambios en el sistema
						</p>
					</div>
				</div>

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
						{isRefreshing && searchQuery && (
							<span className="search-loading-dot"></span>
						)}
					</div>
					<span className="logs-count">
						{totalCount} {totalCount === 1 ? "registro" : "registros"}
					</span>
				</div>

				<div className="logs-filters">
					{ACTIONS.map((a) => (
						<button
							key={a}
							className={`btn-log-filter ${filterAction === a ? "active" : ""} ${
								isRefreshing && filterAction === a ? "loading" : ""
							}`}
							onClick={() => handleActionFilter(a)}
						>
							{a === "TODAS" ? "Todas" : ACTION_CONFIG[a].label}
							{isRefreshing && filterAction === a && (
								<span className="filter-loading-dot"></span>
							)}
						</button>
					))}
				</div>

				{/* Overlay de recarga sutil */}
				<div className="logs-table-wrapper">
					{isRefreshing && (
						<div className="refresh-overlay">
							<div className="refresh-spinner"></div>
						</div>
					)}

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
							{isLoading ? (
								// Carga inicial: skeleton rows
								Array.from({ length: 5 }).map((_, i) => (
									<SkeletonRow key={`skeleton-${i}`} />
								))
							) : error ? (
								<tr>
									<td colSpan={5} className="logs-error-cell">
										<div className="error-content">
											<p>Error al cargar los logs</p>
											<span>{error}</span>
											<button onClick={handleRetry} className="btn-retry">
												{retryCount > 0
													? `Reintentar (${retryCount})`
													: "Reintentar"}
											</button>
										</div>
									</td>
								</tr>
							) : logs.length === 0 ? (
								<tr>
									<td colSpan={5} className="logs-empty">
										<div className="empty-content">
											<span className="empty-icon">📋</span>
											<p>No hay logs que mostrar.</p>
											<span>
												{debouncedSearch
													? "Intenta con otros términos de búsqueda."
													: "No hay registros para los filtros seleccionados."}
											</span>
										</div>
									</td>
								</tr>
							) : (
								logs.map((log) => <LogRow key={log._id || log.id} log={log} />)
							)}
						</tbody>
					</table>
				</div>

				{/* Paginación con estado de carga */}
				{!isLoading && !error && logs.length > 0 && totalPages > 1 && (
					<div
						className={`logs-pagination ${isRefreshing ? "refreshing" : ""}`}
					>
						<div className="pagination">
							<button
								className="pagination-btn"
								onClick={() => goToPage(currentPage - 1)}
								disabled={currentPage === 1 || isRefreshing}
							>
								Anterior
							</button>

							<div className="pagination-pages">
								{getPageNumbers().map((page) => (
									<button
										key={page}
										className={`pagination-page ${
											currentPage === page ? "active" : ""
										}`}
										onClick={() => goToPage(page)}
										disabled={isRefreshing && currentPage !== page}
									>
										{page}
									</button>
								))}
							</div>

							<button
								className="pagination-btn"
								onClick={() => goToPage(currentPage + 1)}
								disabled={currentPage === totalPages || isRefreshing}
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
