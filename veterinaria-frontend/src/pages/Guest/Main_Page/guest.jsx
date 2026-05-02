// src/pages/GuestHome/guest.jsx (Actualizado)
import { PageTransition } from "../../../components/PageTransition/PageTransition.jsx";
import { useState, useEffect } from "react"; // 1. Importamos useState y useEffect
import { NavbarGuest } from "../../../components/NavbarGuest/navbarGuest.jsx";
import { FooterGuest } from "../../../components/Footer/footer.jsx";
// Usaremos la nueva clase que definiremos en el CSS
import "./guest.css";
export function Guest() {
	// --- LÓGICA DE ROTACIÓN DEL CARRUSEL ---
	
	// Estado para controlar qué slide está activo (0, 1 o 2)
	const [activeSlide, setActiveSlide] = useState(0);
	
	// Tiempo de rotación en milisegundos (ej: 5000 = 5 segundos)
	const rotationInterval = 5000; 

	useEffect(() => {
		// Creamos un intervalo que cambia el slide automáticamente
		const intervalId = setInterval(() => {
			// Calculamos el índice del siguiente slide (con módulo para volver a 0)
			setActiveSlide((prevSlide) => (prevSlide + 1) % 3);
		}, rotationInterval);

		// Limpieza del intervalo cuando el componente se desmonta para evitar fugas de memoria
		return () => clearInterval(intervalId);
	}, [rotationInterval]); // Se ejecuta una vez al montar y si cambia el intervalo
	// ----------------------------------------

	return (
		<div className="guest-home-page">
			{/* IMPORTAMOS EL NAVBAR */}
			<NavbarGuest />

			{/* CONTENIDO PRINCIPAL */}
			<PageTransition>
<main className="guest-main-content">
				
				{/* SECCIÓN 1: Carrusel de Imágenes */}
				<section className="carousel-section">
					<div className="carousel-wrapper">
						
						{/* Imagen 1 (Con tu URL) */}
						<div className={`carousel-slide ${activeSlide === 0 ? 'active' : ''}`}>
							<img 
                                src="https://i.pinimg.com/1200x/0e/c1/56/0ec15622f3e11ac2a0bdc4e5786a3fec.jpg" 
                                alt="Mascota registrada" 
                                className="carousel-image"
                            />
							<div className="carousel-caption">
								<h3>Crea una cuenta y registra a tus mascotas</h3>
							</div>
						</div>

						{/* Imagen 2 (Con tu URL) */}
						<div className={`carousel-slide ${activeSlide === 1 ? 'active' : ''}`}>
							<img 
                                src="https://i.pinimg.com/1200x/3f/7d/b5/3f7db55155a677f9c80fa08455151fec.jpg" 
                                alt="Cita veterinaria" 
                                className="carousel-image"
                            />
							<div className="carousel-caption">
								<h3>Agenda citas con profesionales</h3>
							</div>
						</div>

						{/* Imagen 3 (Placeholder o usar otra URL) */}
						<div className={`carousel-slide ${activeSlide === 2 ? 'active' : ''}`}>
							<img 
                                src="https://i.pinimg.com/1200x/35/f5/09/35f509d871e4e79e4d4357cd3e978057.jpg" 
                                alt="historial veterinaria" 
                                className="carousel-image"
                            />
							<div className="carousel-caption">
								<h3>Manten un historial de tus citas</h3>
							</div>
						</div>
					</div>
                    
                    {/* Opcional: Indicadores de puntos abajo del carrusel */}
                    <div className="carousel-indicators">
                        <span className={`indicator ${activeSlide === 0 ? 'active' : ''}`} onClick={() => setActiveSlide(0)}></span>
                        <span className={`indicator ${activeSlide === 1 ? 'active' : ''}`} onClick={() => setActiveSlide(1)}></span>
                        <span className={`indicator ${activeSlide === 2 ? 'active' : ''}`} onClick={() => setActiveSlide(2)}></span>
                    </div>
				</section>

				{/* SECCIÓN 2: Bienvenido y Tarjetas (se mantiene igual) */}
				<section className="welcome-cards-section">
					
					<h2 className="welcome-title">Bienvenido</h2>
					
					<div className="cards-horizontal-container">
						
						{/* Tarjeta 1 */}
						<div className="card-horizontal-item">
							{/* --- CAMBIO AQUÍ: Reemplazamos el placeholder por la imagen real --- */}
							<div className="card-image-left vet-card-1">
                                <img 
                                    src="https://i.pinimg.com/736x/fc/10/97/fc10971cb6674748e1de8aefd0b10378.jpg" 
                                    alt="Crear cuenta para cita" 
                                    className="card-image-content"
                                />
                            </div>
                            {/* ---------------------------------------------------------------- */}
							<div className="card-text-right">
								<p>Crea una cuenta para crear una cita</p>
							</div>
						</div>

						{/* Tarjeta 2 */}
						<div className="card-horizontal-item">
							<div className="card-image-left vet-card-2">
								<img 
                                    src="https://i.pinimg.com/1200x/c5/46/ab/c546abf4a1f4ccda132727b818ac4216.jpg" 
                                    alt="Crear cuenta para cita" 
                                    className="card-image-content"
                                />
								</div>
							<div className="card-text-right">
								<p>Acuda con el doctor que mejor se acopla a sus necesidades</p>
							</div>
						</div>

						{/* Tarjeta 3 */}
						<div className="card-horizontal-item">
							<div className="card-image-left vet-card-3">
								<img 
                                    src="https://i.pinimg.com/736x/f5/22/88/f5228807af8f315ac0d88ec2f7d6e8cc.jpg" 
                                    alt="Crear cuenta para cita" 
                                    className="card-image-content"
                                />
							</div>
							<div className="card-text-right">
								<p>Revisite los registros de su mascota</p>
							</div>
						</div>

					</div>
				</section>

			</main>
			</PageTransition>

			{/* IMPORTAMOS EL FOOTER */}
			<FooterGuest />
		</div>
	);
}