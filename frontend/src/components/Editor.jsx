import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Editor.css';

const Editor = () => {
    const [historia, setHistoria] = useState(null);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [escenas, setEscenas] = useState([]);
    const [escenaSeleccionada, setEscenaSeleccionada] = useState(null);
    // const [escenaInicial, setEscenaInicial] = useState(null);
    // const [contenido,setContenido] = useState [''];
    // const [esInicio, setEsInicio] = useState(false);

    
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const params = useParams();
    
    const historiaId = params.historiaId || null; 
    // const escenaId= params.escenaId || null;
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

    // Verificar autenticación y cargar datos
    useEffect(() => {
        const token = sessionStorage.getItem('token');        
        if (!token) {
            setError('Token no encontrado o expirado');
            setTimeout(() => navigate('/login'), 1500);
            return;
        }         
        
        const fetchData = async () => {            
            const token = sessionStorage.getItem('token');
            if (!token) {
                setError('Token no encontrado o expirado');
                setTimeout(() => navigate('/login'), 1500);
                setLoading(false);
                return;
            }
            
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            if (historiaId) {
                console.log('Historia ID a editar:', historiaId);
                // setSuccessMessage('Cargando historia...');
                
                try {      
                    // Cargar historia              
                    const responseHis = await axios.get(`http://localhost:5000/api/historias/${historiaId}`);
                    setHistoria(responseHis.data);
                    setTitulo(responseHis.data.titulo);
                    setDescripcion(responseHis.data.descripcion);
                    
                    // Cargar escenas
                    const responseEsc = await axios.get(`http://localhost:5000/api/escenas/${historiaId}`);
                    // setContenido(responseEsc.data.contenido || '');
                    // setEsInicio(responseEsc.data.es_inicio || false);
                    // Verificar la estructura de los datos devueltos
                    const escenasData = Array.isArray(responseEsc.data) 
                        ? responseEsc.data 
                        : (responseEsc.data.escenas || []);
                    
                    // Añadir nombreEscena para interfaz de usuario
                    const escenasConNombres = escenasData.map((escena, index) => ({
                        ...escena,
                        nombreEscena: `Escena ${index + 1}`
                    }));
                    
                    setEscenas(escenasConNombres);
                    
                    // Buscar escena inicial
                    // const escenaInicial = escenasConNombres.find(e => e.es_inicio === true || e.es_inicial === true);
                    // setEscenaInicial(escenaInicial || null);
                    
                    setLoading(false);
                    // setSuccessMessage('Historia cargada correctamente');
                    
                } catch (error) {
                    console.error('Error detallado:', {
                        message: error.message,
                        response: error.response?.data,
                        status: error.response?.status
                    });
                    
                    setError(error.response?.data?.message || 'Error al cargar la historia');
                    
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        sessionStorage.removeItem('token');
                        setError('Error de autenticación, por favor inicia sesión');
                        setTimeout(() => navigate('/login'), 3000);
                    }
                    setLoading(false);
                }
            } else {
                // Estamos creando una nueva historia
                setLoading(false);
            }
        };

        fetchData();
    }, [historiaId, navigate]);

    // Guardar historia y escenas
    const handleSave = async () => {
        // Validaciones
        if (!titulo || titulo.trim() === '') {
            setError('El título es obligatorio');
            return;
        }
        
        if (!descripcion || descripcion.trim() === '') {
            setError('La descripción es obligatoria');
            return;
        }
        
        try {
            let historia_id = historiaId;
            
            // 1. Primero guardar/actualizar la historia principal
            if (historiaId) {
                // Actualizar historia existente
                await axios.put(`http://localhost:5000/api/historias/${historiaId}`, {
                    titulo,
                    descripcion
                });
                setSuccessMessage('Historia actualizada');
            } else {
                // Crear nueva historia
                const responseHis = await axios.post('http://localhost:5000/api/historias/nuevaHistoria', {
                    titulo,
                    descripcion
                });
                historia_id = responseHis.data.id;
                // Redirigir a la URL con el ID de la historia nueva
                setSuccessMessage('Historia guardada');
                navigate(`/editor/${historia_id}`, { replace: true });
            }
            
            // 2. Guardar cada escena
            for (const escena of escenas) {
                if (escena.id) {
                    // Actualizar escena existente
                    await axios.put(`http://localhost:5000/api/escenas/${escena.id}`, {
                        contenido: escena.contenido,
                        es_inicio: escena.es_inicio || escena.es_inicial
                    });
                } else {
                    // Crear nueva escena
                    await axios.post('http://localhost:5000/api/escenas/nuevaEscena', {
                        historia_id,
                        contenido: escena.contenido,
                        es_inicio: escena.es_inicio || escena.es_inicial || false
                    });
                }
            }
            
            setSuccessMessage('Historia guardada correctamente');
            console.log("Historia data:",{titulo,descripcion});
            
            // Recargar datos si acabamos de crear una historia
            if (!historiaId) {
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            setError(error.response?.data?.message || 'Error al guardar la historia');
        }
    };

    // Gestión de escenas
    const handleNewEscena = () => {
        const esInicial = escenas.length === 0;
        const nuevaEscena = {
            id: null, // Se generará en la base de datos
            contenido: '',
            es_inicio: esInicial,
            es_inicial: esInicial,
            historia_id: historiaId,
            nombreEscena: `Escena ${escenas.length + 1}`
        };
        setEscenas([...escenas, nuevaEscena]);
        setEscenaSeleccionada(escenas.length); // Seleccionar la nueva escena
    };
    
    const handleDeleteEscena = async (index) => {
        const escena = escenas[index];
        
        if (escena.id) {
            // Si tiene ID, eliminar de la base de datos
            try {
                await axios.delete(`http://localhost:5000/api/escenas/${escena.id}`);
                setSuccessMessage('Escena eliminada correctamente');
            } catch (error) {
                setError('Error al eliminar la escena');
                console.log('Error al eliminar la escena:', error);
                return;
            }
        }
        
        // Eliminar de estado local
        const nuevasEscenas = [...escenas];
        nuevasEscenas.splice(index, 1);
        
        // Renumerar escenas
        const escenasRenumeradas = nuevasEscenas.map((e, idx) => ({
            ...e,
            nombreEscena: `Escena ${idx + 1}`
        }));
        
        setEscenas(escenasRenumeradas);
        
        // Si era la seleccionada, deseleccionar
        if (escenaSeleccionada === index) {
            setEscenaSeleccionada(null);
        } else if (escenaSeleccionada > index) {
            // Ajustar el índice seleccionado si se eliminó una anterior
            setEscenaSeleccionada(escenaSeleccionada - 1);
        }
    };
    
    // const handleSetEscenaInicial = (index) => {
    //     const nuevasEscenas = escenas.map((escena, idx) => ({
    //         ...escena,
    //         es_inicio: idx === index,
    //         es_inicial: idx === index
    //     }));
        
    //     setEscenas(nuevasEscenas);
    //     setEscenaInicial(nuevasEscenas[index]);
    // };
    
    const handleEscenaContentChange = (e, index) => {
        const nuevasEscenas = [...escenas];
        nuevasEscenas[index].contenido = e.target.value;
        setEscenas(nuevasEscenas);
    };
    
    const handleEscenaTituloChange = (e, index) => {
        const nuevasEscenas = [...escenas];
        nuevasEscenas[index].nombreEscena = e.target.value;
        setEscenas(nuevasEscenas);
    };

    if (loading) return <div className="loading">Cargando...</div>;

    return (
        <div className="editor">
            <header>
                <h1>{historiaId ? 'Editar Historia' : 'Nueva Historia'}</h1>
            </header>
            
            <div id='mensajes'>
                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}
            </div>
            
            {/* Zona superior - Información de la historia */}
            <div className='editor-superior'>
                <div className="form-group">
                    <label htmlFor="titulo">Título:</label>
                    <input
                        type="text"
                        id="titulo"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Título de la historia"
                        className='form-control'
                        minLength={5}
                        required              
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="descripcion">Descripción:</label>
                    <textarea 
                        id="descripcion"
                        placeholder="Descripción de la historia"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        className='form-control'
                        minLength={10}
                        required
                    ></textarea>
                </div>
                
                <div className="buttons-container">
                    <button onClick={handleSave} id="btn-save" className="primary-btn">
                        {historiaId ? 'Actualizar Historia' : 'Crear Historia'}
                    </button>
                    <button onClick={() => navigate('/dashboard')} id="btn-volver" className="secondary-btn">
                        Volver al Dashboard
                    </button>
                </div>
            </div>

            {/* Zona de contenido principal - Escenas y editor */}
            <div className="editor-container">
                {/* Listado de escenas */}
                <div className="sidebar-escenas">
                    <h3>Escenas</h3>
                    <button onClick={handleNewEscena} className="add-scene-btn">
                        Nueva Escena
                    </button>
                    
                    <ul className="escenas-list">
                        {escenas.map((escena, index) => (
                            <li 
                                key={index} 
                                className={`escena-item ${escenaSeleccionada === index ? 'active' : ''} ${escena.es_inicio || escena.es_inicial ? 'inicial' : ''}`}
                                onClick={() => setEscenaSeleccionada(index)}
                            >
                                <span className="escena-titulo">
                                    {escena.nombreEscena}
                                    {(escena.es_inicio || escena.es_inicial) && ' (Inicial)'}
                                </span>
                                <div className="escena-actions">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // handleSetEscenaInicial(index);
                                        }} 
                                        className="btn-small"
                                        disabled={escena.es_inicio || escena.es_inicial}
                                    >
                                        Marcar Inicial
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteEscena(index);
                                        }} 
                                        className="btn-small danger"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Editor de escena seleccionada */}
                <div className="editor-escena">
                    {escenaSeleccionada !== null && escenas[escenaSeleccionada] ? (
                        <div className="escena-editor">
                            <div className="escena-header">
                                <input
                                    type="text"
                                    value={escenas[escenaSeleccionada].nombreEscena}
                                    onChange={(e) => handleEscenaTituloChange(e, escenaSeleccionada)}
                                    className="escena-titulo-input"
                                />
                                {(escenas[escenaSeleccionada].es_inicio || escenas[escenaSeleccionada].es_inicial) && 
                                    <span className="badge-inicial">Escena Inicial</span>
                                }
                            </div>
                            
                            <textarea
                                value={escenas[escenaSeleccionada].contenido || ''}
                                onChange={(e) => handleEscenaContentChange(e, escenaSeleccionada)}
                                placeholder="Escribe aquí el contenido de la escena..."
                                className="escena-contenido-textarea"
                            />
                        </div>
                    ) : (
                        <div className="no-escena-selected">
                            <p>Selecciona una escena del listado o crea una nueva para empezar a editar</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Editor;