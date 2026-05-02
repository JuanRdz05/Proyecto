import { useState, useEffect } from "react";
import { NavbarAdmin } from "../../../components/NavbarAdmin/navbarAdmin.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
import { toast } from "react-toastify";
import {
	getAllClients,
	toggleClientStatus,
} from "../../../services/Admin/clients.js";
import "./adminClients.css";
import { useAdminGuard } from "../../../hooks/useAdminGuard.jsx";

function initials(name) {
	return name
		.split(" ")
		.filter((w) => w.length > 2)
		.slice(0, 2)
		.map((w) => w[0].toUpperCase())
		.join("");
}

export function AdminClients() {
	const { checking, isActive, BlockedScreen } = useAdminGuard();

	if (checking || !isActive) return <BlockedScreen />;
	const [clients, setClients] = useState([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [toggling, setToggling] = useState(new Set());

	// ── Carga inicial desde la API ─────────────────────────────────────────────
	useEffect(() => {
		let cancelled = false;

		async function fetchClients() {
			try {
				setLoading(true);
				setError(null);
				const data = await getAllClients();
				if (!cancelled) setClients(data.clients ?? data);
			} catch (err) {
				if (!cancelled) {
					setError(err.message);
					toast.error("No se pudieron cargar los clientes.");
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		fetchClients();
		return () => {
			cancelled = true;
		};
	}, []);

	// ── Filtro de búsqueda ─────────────────────────────────────────────────────
	const filtered = clients.filter((c) => {
		const q = search.toLowerCase();
		const full = [c.name, c.paternalLastName, c.maternalLastName]
			.filter(Boolean)
			.join(" ");
		return (
			full.toLowerCase().includes(q) ||
			(c.email ?? "").toLowerCase().includes(q)
		);
	});

	// ── Toggle activo/inactivo ─────────────────────────────────────────────────
	const handleToggle = async (id) => {
		if (toggling.has(id)) return;

		// Optimistic update
		setClients((prev) =>
			prev.map((c) => (c._id === id ? { ...c, isActive: !c.isActive } : c)),
		);
		setToggling((prev) => new Set(prev).add(id));

		try {
			const data = await toggleClientStatus(id);
			const updated = data.client ?? data;

			setClients((prev) =>
				prev.map((c) =>
					c._id === id ? { ...c, isActive: updated.isActive } : c,
				),
			);

			if (updated.isActive) {
				toast.success("Cliente activado correctamente.");
			} else {
				toast.info("Cliente desactivado correctamente.");
			}
		} catch (err) {
			// Revertir si falló
			setClients((prev) =>
				prev.map((c) => (c._id === id ? { ...c, isActive: !c.isActive } : c)),
			);
			toast.error(`Error al cambiar el estado: ${err.message}`);
		} finally {
			setToggling((prev) => {
				const next = new Set(prev);
				next.delete(id);
				return next;
			});
		}
	};

	// ── Nombre completo ────────────────────────────────────────────────────────
	const fullName = (c) =>
		[c.name, c.paternalLastName, c.maternalLastName].filter(Boolean).join(" ");

	// ── Render ─────────────────────────────────────────────────────────────────
	return (
		<div className="admincl-container">
			<NavbarAdmin />

			<main className="admincl-main">
				<h1 className="admincl-title">Clientes</h1>

				{/* Barra de búsqueda */}
				<div className="admincl-toolbar">
					<div className="admincl-search">
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
				</div>

				{/* Estado de carga */}
				{loading && <p className="admincl-feedback">Cargando clientes...</p>}

				{/* Error */}
				{!loading && error && (
					<p className="admincl-feedback admincl-error">⚠ {error}</p>
				)}

				{/* Tabla */}
				{!loading && !error && (
					<div className="admincl-table-wrapper">
						<table className="admincl-table">
							<thead>
								<tr>
									<th>Cliente</th>
									<th>Email</th>
									<th>Estado</th>
									<th>Activo</th>
								</tr>
							</thead>
							<tbody>
								{filtered.length === 0 ? (
									<tr>
										<td colSpan={4} className="empty-row">
											No se encontraron clientes.
										</td>
									</tr>
								) : (
									filtered.map((client) => {
										const name = fullName(client);
										return (
											<tr key={client._id}>
												<td className="col-client">
													<div className="client-avatar">{initials(name)}</div>
													<strong>{name}</strong>
												</td>
												<td className="col-email">{client.email}</td>
												<td className="col-status">
													<span
														className={`cl-badge ${client.isActive ? "badge-activo" : "badge-inactivo"}`}
													>
														{client.isActive ? "Activo" : "Inactivo"}
													</span>
												</td>
												<td className="col-action">
													<button
														className={`toggle-switch ${client.isActive ? "on" : "off"} ${toggling.has(client._id) ? "loading" : ""}`}
														onClick={() => handleToggle(client._id)}
														disabled={toggling.has(client._id)}
														title={client.isActive ? "Desactivar" : "Activar"}
													>
														<span className="toggle-knob" />
													</button>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>
				)}
			</main>

			<FooterGuest />
		</div>
	);
}
