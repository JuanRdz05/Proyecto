import { useState, useRef } from 'react'; // Importamos useRef para la foto
import { useNavigate, Link } from 'react-router-dom';
import { InputField } from "../../../components/Inputfield/inputfield.jsx"; // Reutilizamos tu componente
// Asumimos que la función de registro ahora acepta FormData
import { registerClient } from '../../../services/Guest/register.js'; // Ruta correcta
import './register.css';

export function Register() {
    const navigate = useNavigate();
    
    // Estados para los campos de texto
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [paternalLastName, setPaternalLastName] = useState('');
    const [maternalLastName, setMaternalLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // --- LÓGICA DE LA FOTO DE PERFIL ---
    const fileInputRef = useRef(null); // Referencia oculta al selector de archivos
    const [selectedFile, setSelectedFile] = useState(null); // Archivo real para enviar
    const [previewUrl, setPreviewUrl] = useState(null); // URL para mostrar en el navegador

    // Función que se ejecuta al hacer clic en el círculo de "FOTO"
    const handleFileClick = () => {
        fileInputRef.current.click(); // Dispara el clic del input oculto
    };

    // Función que se ejecuta cuando el usuario selecciona un archivo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        
        // Validación básica: que sea una imagen
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            // Creamos una URL temporal para previsualizar la imagen en el círculo
            setPreviewUrl(URL.createObjectURL(file));
        } else if (file) {
            alert("Por favor selecciona un archivo multimedia válido (imagen estática).");
            e.target.value = null; // Limpiar el input
        }
    };
    // -----------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Cuando hay una imagen, no podemos enviar JSON simple. 
            // Debemos usar FormData para empaquetar los datos y el archivo.
            const formDataToSend = new FormData();
            formDataToSend.append('username', username);
            formDataToSend.append('name', name);
            formDataToSend.append('paternalLastName', paternalLastName);
            formDataToSend.append('maternalLastName', maternalLastName);
            formDataToSend.append('email', email);
            formDataToSend.append('password', password);
            
            // Si el usuario seleccionó una foto, la adjuntamos
            if (selectedFile) {
                // El nombre 'profilePic' debe coincidir con el que espera tu Backend
                formDataToSend.append('profilePic', selectedFile); 
            }

            // Llamamos al servicio pasando el FormData
            await registerClient(formDataToSend);
            
            alert("Cliente registrado exitosamente.");
            navigate('/login'); // Regresa específicamente al login al terminar
        } catch (error) {
            alert(error.message || "Error al registrar la cuenta");
        }
    };

    return (
        <div className="register-container">
            <form onSubmit={handleSubmit} className="register-form">
                <h2>Crear cuenta</h2>
                
                {/* --- SECCIÓN DE FOTO DE PERFIL ACTIVA CON PLACEHOLDER --- */}
                <div 
                    className="profile-pic-placeholder clickable" 
                    onClick={handleFileClick} 
                    title="Haz clic para seleccionar una foto"
                >
                    {previewUrl ? (
                        // 1. Mostramos la vista previa si el usuario ya seleccionó una foto
                        <img src={previewUrl} alt="Vista previa de perfil" className="profile-pic-preview" />
                    ) : (
                        // 2. NUEVO: Mostramos el ícono de placeholder si no hay foto seleccionada
                        // Usamos un SVG integrado directamente para no depender de archivos externos
                        <svg 
                            className="profile-pic-icon-placeholder" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    )}
                </div>
                
                {/* Input de tipo archivo oculto, activado por el div de arriba */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" // Solo acepta imágenes
                    style={{ display: 'none' }} // Oculto visualmente
                />
                {/* ------------------------------------------ */}

                {/* Labels corregidos a Mayúsculas Iniciales */}
                <InputField
                    label="Nombre de Usuario"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <InputField
                    label="Nombre"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                
                <InputField
                    label="Apellido Paterno"
                    type="text"
                    value={paternalLastName}
                    onChange={(e) => setPaternalLastName(e.target.value)}
                />

                <InputField
                    label="Apellido Materno"
                    type="text"
                    value={maternalLastName}
                    onChange={(e) => setMaternalLastName(e.target.value)}
                />

                <InputField
                    label="Correo Electrónico"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <InputField
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit" className="btn-register">Crear cuenta</button>
                
                <p className="login-link">
                    {/* Enlace corregido para ir específicamente a /login */}
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>
            </form>
        </div>
    );
}