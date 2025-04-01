import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Perfil = () => {
    const [userData, setUserData] = useState({ nombre: '', email: '', password: '' });
    const [loading, setLoading] = useState(true);    
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            setError('Token no encontrado');
            setTimeout(() =>navigate('/login'),1500);
            return;
        }  

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/autores/perfil');
                setUserData({
                    nombre: response.data.nombre,
                    email: response.data.email,
                    password: response.data.password // Dejar la contraseña vacía por razones de seguridad
                });
                setLoading(false);
            } catch (error) {
                if (error.response?.data?.message) {
                    setError(error.response.data.message); // Aquí se captura el mensaje de error específico
                } else {
                    setError('Error al cargar los datos del usuario',error);
                }            
                setLoading(false);
            }
        };
        fetchUserData();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = sessionStorage.getItem('token');        
        if (!token) {
            setError('Token no encontrado');
            setTimeout(() =>navigate('/login'),1500);
            return;
        } 
        try {
            await axios.put('http://localhost:5000/api/autores/actualizar', userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSuccessMessage('Perfil actualizado correctamente');            
                setTimeout(() =>navigate('/login'),1800);               
            
            // alert('Perfil actualizado con éxito');
            // navigate('/dashboard'); // Redirige al dashboard después de guardar los cambios
        } catch (error) {
            console.error('Error actualizando perfil:', error);            
            if (error.response?.data?.message) {
                setError(error.response.data.message); // Aquí se captura el mensaje de error específico
            } else {
                setError('Hubo un error al actualizar el perfil');
            }
        }
    };

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }
    return (
        <div className="perfil-container">
            <h2>Perfil de Usuario</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nombre:</label>
                    <input
                        type="text"
                        value={userData.nombre}
                        onChange={(e) => setUserData({ ...userData, nombre: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Email (no puedes carmbiarlo):</label>
                    <input
                        type="email"
                        value={userData.email}
                        contentEditable={false}                        
                    /> 
                </div>
                <div className="form-group">
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        value={userData.password}
                        onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    />
                </div>
                <button type="submit">Guardar Cambios</button>
            </form>
            <div>
            <p id='mensaje'>
                 {/* Mensajes de error y éxito */}
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            </p>
            <p id='nuevosDatos'></p>    
            <button onClick={() => navigate('/dashboard')}>Volver </button>
            </div>
        </div>
    );
};

export default Perfil;