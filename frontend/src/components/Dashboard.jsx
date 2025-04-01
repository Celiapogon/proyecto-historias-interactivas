import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [historias, setHistorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Muestra mensajes temporales
useEffect(() => {
    if (error) {
        const timer = setTimeout(() => setError(''), 3000);
        return () => clearTimeout(timer);
    }
}, [error]);

useEffect(() => {
    if (successMessage) {
        const timer = setTimeout(() => setSuccessMessage(''), 3000);
        return () => clearTimeout(timer);
    }
}, [successMessage]);

    useEffect(() => {
        const token = sessionStorage.getItem('token');        
        // Verifica si el token existe al montar el componente
        if (!token) {
            setError('Token no encontrado');
            setTimeout(() =>navigate('/login'),1500);
            return;
        }       
        // Configura los headers para todas las peticiones axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    setError('Token no encontrado');
                    setTimeout(() =>navigate('/login'),1500);
                    setLoading(false); // Asegúrate de que loading se establece a false aquí
                    return;
                }

                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Obtén el perfil del usuario
                const userResponse = await axios.get('http://localhost:5000/api/autores/perfil');
                const userData = userResponse.data;
                
                if (!userData || !userData.id) {
                    if (error.response?.data?.message) {
                        setError(error.response.data.message); // Aquí se captura el mensaje de error específico
                    } else {
                        setError('Datos del usuario inválidos - No ID');
                    }
                }                
                setUser(userData);

                // Obtener las historias del autor
                const historiasResponse = await axios.get('http://localhost:5000/api/historias/mis-historias');
                if (!historiasResponse.data) {
                    if (error.response?.data?.message) {
                        setError(error.response.data.message); // Aquí se captura el mensaje de error específico
                    } else {
                        setError('No se reciben datos de historias');
                    }
                }
                setHistorias(Array.isArray(historiasResponse.data) ? historiasResponse.data : []);
                // if (historiasResponse.data.length === 0) { //     setSuccessMessage('No tienes historias creadas'); // }
                setLoading(false);

            } catch (error) {
                console.error('Detailed error:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    userId: user?.id
                });
                if (error.response?.data?.message) {
                    setError(error.response.data.message); //mensaje de error del servidor
                }

                // Si hay un error de autenticación, borra el token y redirige al login
                if (error.response?.status === 401 || error.response?.status === 403) {
                    setError('Parece que tu sesión ha caducado o no tienes permisos...');
                    setTimeout(() =>navigate('/login'),3000);
                    sessionStorage.removeItem('token');
                    navigate('/login');
                }
                setLoading(false);
            }
        };

        fetchData();

        // Cleanup function (aunque en este caso no es necesario limpiar nada, por si haces algún cambio posterior)
        return () => {
            axios.defaults.headers.common['Authorization'] = null;
        };
    
    }, [navigate]);

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    const handleCreateHistoria = () => {
        navigate('/Editor');
    };

    const handleEdit = (id) => {
        navigate(`/editor/${id}`);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro que quieres eliminar esta historia para siempre :( ?')) {
            try {
                await axios.delete(`http://localhost:5000/api/historias/${id}`, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
                setHistorias(historias.filter(historia => historia.id !== id));
                setSuccessMessage('Historia eliminada correctamente');
            } catch (error) {
                console.error('Error deleting historia:', error);
                setError('Error al eliminar la historia');
            }
        }
    };

    const handleRead = (id) => {
        navigate(`/historia/leer/${id}`);
    };

    const handleShare = (id) => {
        const shareUrl = `${window.location.origin}/historia/compartir/${id}`;
        navigator.clipboard.writeText(shareUrl);
        alert('Enlace copiado al portapapeles');
    };

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        setSuccessMessage('Saliendo...');
        setTimeout(() => navigate('/login'), 1000);
    };

    
        

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Historias Interactivas</h1>
                {user && <p>Artista: {user.nombre}</p>}
                <button onClick={() => navigate('/perfil')} className="profile-button">
                Modificar perfil
                </button>
                <button onClick={handleLogout} className="logout-button">
                    Cerrar Sesión
                </button>
            </header>
             {/* Mensajes de error y éxito */}
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <section className="dashboard-hero">
                <div className="hero-image">
                    <img src="/images/portada.jpg" alt="Portada" id="portada" />
                </div>
                <div className="hero-content">
                    <h2>Crea historias increíbles</h2>
                    <p>Dale vida a tus locas ideas y comparte tu historia con el mundo </p>
                    <button className="create-button" onClick={handleCreateHistoria}>
                        Crear Nueva Historia
                    </button>
                </div>
            </section>

            <section className="historias-list">
                <h2>Mis Historias</h2>
                {historias.length === 0 ? (
                    <p className="no-historias">No has creado ninguna historia aún</p>
                ) : (
                    <div className="historias-grid">
                        {historias.map(historia => (
                            <div key={historia.id} className="historia-card">
                                <h3>{historia.titulo}</h3>
                                <h6>{historia.descripcion}</h6>
                                <p className="fecha">
                                    {new Date(historia.fecha_creacion).toLocaleDateString()}
                                </p>
                                <div className="actions">
                                    <button onClick={() => handleRead(historia.id)}>
                                        Leer
                                    </button>
                                    <button onClick={() => handleEdit(historia.id)}>
                                        Editar
                                    </button>
                                    <button onClick={() => handleShare(historia.id)}>
                                        Compartir
                                    </button>
                                    <button className="delete" onClick={() => handleDelete(historia.id)}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;
