import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Editor.css';

const Editor = () => {
    const [historia, setHistoria] = useState(null);
    const [escenas, setEscenas] = useState([]);
    const [titulo, setNuevoTitulo] = useState('');
    const [descripcion, setDescripcion] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const params = useParams();
    const historiaId = params.historiaId ? params.historiaId : null; 
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
            setError('Token no encontrado o expirado');
            setTimeout(() =>navigate('/login'),1500);
            return;
        }         
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const fetchData = async () => {
            const token = sessionStorage.getItem('token');
                if (!token) {
                    setError('Token no encontrado o expirado');
                    setTimeout(() =>navigate('/login'),1500);
                    setLoading(false); // Asegúrate de que loading se establece a false aquí
                    return;
                }
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            if (historiaId) {
                console.log('Historia ID a editar:', historiaId);
                setSuccessMessage('Editando historia en curso')
                // Si hay un ID en la URL, estamos editando una historia existente
                try {                    
                    const response = await axios.get(`http://localhost:5000/api/historias/${historiaId}`);
                    setHistoria(response.data);
                    setNuevoTitulo(response.data.titulo);
                    setDescripcion(response.data.descripcion);
                    setEscenas(response.data.escenas || []);
                    setLoading(false);
                    
                } catch (error) {
                    console.error('Detailed error:', {
                        message: error.message,
                        response: error.response?.data,
                        status: error.response?.status
                    });
                    if (error.response?.data?.message) {
                        setError(error.response.data.message); 
                    }     else {
                        setError('Error al cargar los datos de la historia');
                    }
                    // Si hay un error de autenticación, borra el token y redirige al login
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        sessionStorage.removeItem('token');
                        setError('Error de autentificaicion, por favor inicia sesion');
                        setTimeout(() =>navigate('/login'),3000);
                    }
                    setLoading(false);
                }
            } else {
                // Si no hay ID, estamos creando una nueva historia
                setLoading(false);
            }
        };

        fetchData();
    }, [historiaId]);

    const handleSave = async () => {
        const historiaData = {
            titulo: titulo,
            descripcion: descripcion,
            escenas
        };
        try {
            if (historiaId) {
                // Si estamos editando, actualizamos la historia
                await axios.put(`http://localhost:5000/api/historias/${historiaId}`, historiaData, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
                });
                setSuccessMessage('Historia actualizada correctamente');
                
            } else {
                // Si estamos creando, enviamos los datos para crear una nueva historia
                await axios.post('http://localhost:5000/api/historias/nuevaHistoria', historiaData, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
                });
                setSuccessMessage('Historia guardada correctamente');
            }
            console.log('Historia guardada:', historiaData);
        } catch (error) {
            if (error.response?.data?.message) {
                setError(error.response.data.message); // Aquí se captura el mensaje de error específico
            } else {
                setError('Error al guardar la historia :(');
            }
            console.error('Error al guardar la historia:', error);
        }
    };

    const handleTituloChange = (e) => {
        setNuevoTitulo(e.target.value);
    };

    const handleNewEscena = () => {
        const nuevaEscena = {
            titulo: '',
            contenido: '',
            opciones: [],
        };
        setEscenas([...escenas, nuevaEscena]);
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="editor">
            <header>
            <h1>Editor de Historias </h1>
            <div id='invisible' style={{ display: 'none' }}>
            </div>
            </header>
                <div id='mensajes'>
                {historia ? <p></p> : <p>Cargando historia...</p>}
                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}
                </div>
            <div className='editor-superior'>
                <input
                    type="text"
                    value={titulo}
                    onChange={handleTituloChange}
                    placeholder="Título de la historia"
                    className='form-control'
                    id='titulo'
                    minLength={5}
                    required              
                />
                <textarea 
                placeholder="Descripción de la historia"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className='form-control'
                minLength={10}
                required>
                </textarea>
                <button onClick={handleSave} id="btn-save">Guardar Historia</button>
                <button onClick={() => navigate('/dashboard')} id="btn-volver"> Volver </button>
            </div>
            <div className="editor-container">
                <div className="nodos">
                    {/* Representación gráfica de los nodos */}
                    {escenas.map((escena, index) => (
                        <div key={index} className="nodo">
                            <h4>{escena.titulo}</h4>
                            {/* Puedes agregar aquí la funcionalidad de arrastrar y soltar */}
                        </div>
                    ))}
                </div>

                <div className="editor-escenas">
                    <h3>Escenas</h3>
                    <button onClick={handleNewEscena}>Nueva Escena</button>
                    <ul>
                        {escenas.map((escena, index) => (
                            <li key={index}>
                                <input
                                    type="text"
                                    value={escena.titulo}
                                    onChange={(e) => {
                                        const nuevasEscenas = [...escenas];
                                        nuevasEscenas[index].titulo = e.target.value;
                                        setEscenas(nuevasEscenas);
                                    }}
                                    placeholder="Título de la escena"
                                />
                                {/* Aquí agregarás el contenido narrativo y las opciones */}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Editor;