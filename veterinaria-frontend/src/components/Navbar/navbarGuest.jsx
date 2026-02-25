import { Link } from "react-router-dom";

export function Navbarguest() {
	return (
		<nav className="Navbar">
			<div className="navbarContainer">
				<Link className="navbar-brand" to="/">
					Veterinaria
				</Link>
				<ul>
					<li>
						<Link to="/login">Iniciar sesión</Link>
					</li>
				</ul>
			</div>
		</nav>
	);
}
