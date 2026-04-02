// src/pages/Register/Register.jsx
import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { InputField } from "../../../components/Inputfield/inputfield.jsx";
import { registerClient } from '../../../services/Guest/register.js';
import './register.css';

export function Register() {
    const navigate = useNavigate(); // Ya lo tienes importado y definido
    
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [paternalLastName, setPaternalLastName] = useState('');
    const [maternalLastName, setMaternalLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFileClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        } else if (file) {
            alert("Por favor selecciona un archivo multimedia válido (imagen estática).");
            e.target.value = null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('username', username);
            formDataToSend.append('name', name);
            formDataToSend.append('paternalLastName', paternalLastName);
            formDataToSend.append('maternalLastName', maternalLastName);
            formDataToSend.append('email', email);
            formDataToSend.append('password', password);
            
            if (selectedFile) {
                formDataToSend.append('profilePic', selectedFile); 
            }

            await registerClient(formDataToSend);
            alert("Cliente registrado exitosamente.");
            navigate('/login'); 
        } catch (error) {
            alert(error.message || "Error al registrar la cuenta");
        }
    };

    return (
        <div className="register-container">
            <form onSubmit={handleSubmit} className="register-form">
                {/* --- NUEVO: Botón X para regresar --- */}
                <button 
                    type="button" 
                    className="btn-close-card" 
                    onClick={() => navigate(-1)}
                    title="Regresar"
                >
                    &times;
                </button>

                <h2>Crear cuenta</h2>
                
                <div 
                    className="profile-pic-placeholder clickable" 
                    onClick={handleFileClick} 
                    title="Haz clic para seleccionar una foto"
                >
                    {previewUrl ? (
                        <img src={previewUrl} alt="Vista previa de perfil" className="profile-pic-preview" />
                    ) : (
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
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*"
                    style={{ display: 'none' }}
                />

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
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>
            </form>
        </div>
    );
}