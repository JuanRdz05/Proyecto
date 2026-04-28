// src/components/FooterGuest/footerGuest.jsx
import logo from "../../assets/imagenes/logo.png";
import "./footer.css";

export function FooterGuest() {
	return (
		<footer className="footer-guest-container">
			<div className="footer-content-wrapper">
				
				{/* LADO IZQUIERDO: Logo y Trust Text */}
				<div className="footer-left-section">
					{/* Espacio para el logo */}
					<div className="footer-logo-placeholder">
						<img src={logo} alt="Logo"></img>
					</div>
					{/* Texto de confianza solicitado */}
					<p className="footer-trust-text">tu veterinaria de confianza</p>
				</div>

				{/* LADO DERECHO: Contactos actualizados */}
				<div className="footer-right-section">
					<h3>Contáctanos</h3>
					<div className="footer-contact-list">
                        {/* Se mantiene este correo */}
						<p>andres.medinac@uanl.edu.mx</p>
                        {/* Se actualizó este correo */}
						<p>juanrdz140505@gmail.com</p>
					</div>
				</div>
			</div>
		</footer>
	);
}