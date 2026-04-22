import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputField } from "../../../components/Inputfield/inputfield.jsx";
import './registerAdmin.css';

export function RegisterAdmin() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [paternalLastName, setPaternalLastName] = useState('');
    const [maternalLastName, setMaternalLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileClick = () => fileInputRef.current.click();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        } else if (file) {
            alert("Por favor selecciona una imagen válida.");
            e.target.value = null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('name', name);
            formData.append('paternalLastName', paternalLastName);
            formData.append('maternalLastName', maternalLastName);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('role', 'admin'); // rol fijo para administrador
            if (selectedFile) formData.append('profilePic', selectedFile);

            const res = await fetch('http://localhost:3050/users/v1/register', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Error al registrar administrador');
            }

            alert('Administrador registrado exitosamente.');
            navigate('/admin/administradores');
        } catch (error) {
            alert(error.message || 'Error al registrar administrador');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <form onSubmit={handleSubmit} className="register-form">
                {/* Botón X para regresar */}
                <button
                    type="button"
                    className="btn-close-card"
                    onClick={() => navigate(-1)}
                    title="Regresar"
                >
                    &times;
                </button>

                <h2>Registrar administrador</h2>

                {/* Foto de perfil */}
                <div
                    className="profile-pic-placeholder clickable"
                    onClick={handleFileClick}
                    title="Haz clic para seleccionar una foto"
                >
                    {previewUrl ? (
                        <img src={previewUrl} alt="Vista previa" className="profile-pic-preview" />
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

                <button type="submit" className="btn-register" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrar administrador'}
                </button>
            </form>
        </div>
    );
}
