import {db} from '../config/db.js';

// Registrar un nuevo jugador
export const registrarJugador = async (req, res) => {
    try {
        let nombre = req.body.nombre?.trim();

        // Validación del nombre
        if (!nombre || typeof nombre !== 'string') {
            return res.status(400).json({ success: false, error: 'El nombre es obligatorio y debe ser un texto válido' });
        }

        if (nombre.length < 3 || nombre.length > 50) {
            return res.status(400).json({ success: false, error: 'El nombre debe tener entre 3 y 50 caracteres' });
        }

        // Insertar jugador en la base de datos
        const [result] = await db.promise().query(
            'INSERT INTO jugadores (nombre) VALUES (?)',
            [nombre]
        );

        res.status(201).json({ success: true, jugadorId: result.insertId, nombre });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, error: 'El nombre del jugador ya existe' });
        }
        res.status(500).json({ success: false, error: err.message });
    }
};
// Obtener la escena inicial o el progreso del jugador
export const getHistoriaInicio = async (req, res) => {
    try {
        const { historiaId } = req.params;
        const { jugadorId } = req.query;

        if (!jugadorId) {
            return res.status(400).json({ success: false, error: 'El jugadorId es obligatorio' });
        }

        // Verificar si el jugador existe
        const [jugador] = await db.promise().query('SELECT id FROM jugadores WHERE id = ?', [jugadorId]);
        if (jugador.length === 0) {
            return res.status(404).json({ success: false, error: 'Jugador no encontrado' });
        }

        // Buscar el progreso del jugador
        const [progreso] = await db.promise().query(
            'SELECT escena_actual_id FROM progreso WHERE jugador_id = ? AND historia_id = ?',
            [jugadorId, historiaId]
        );

        if (progreso.length > 0) {
            return getEscena({ params: { escenaId: progreso[0].escena_actual_id }, query: { jugadorId } }, res);
        }

        // Obtener la primera escena de la historia
        const [historia] = await db.promise().query(
            `SELECT h.id AS historia_id, h.titulo, e.id AS escena_id, e.texto AS escena_texto 
             FROM historias h 
             JOIN escenas e ON h.id = e.historia_id AND e.es_inicio = 1 
             WHERE h.id = ?`,
            [historiaId]
        );

        if (historia.length === 0) {
            return res.status(404).json({ success: false, error: 'Historia o escena inicial no encontrada' });
        }

        const escenaId = historia[0].escena_id;

        // Guardar el progreso inicial
        await db.promise().query(
            `INSERT INTO progreso (jugador_id, historia_id, escena_actual_id) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE escena_actual_id = ?`,
            [jugadorId, historiaId, escenaId, escenaId]
        );

        const [opciones] = await db.promise().query('SELECT * FROM opciones WHERE escena_origen_id = ?', [escenaId]);

        res.json({
            success: true,
            historia: historia[0],
            escena: { id: escenaId, texto: historia[0].escena_texto },
            opciones
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Obtener una escena específica
export const getEscena = async (req, res) => {
    try {
        const { escenaId } = req.params;

        const [escena] = await db.promise().query('SELECT * FROM escenas WHERE id = ?', [escenaId]);

        if (escena.length === 0) {
            return res.status(404).json({ success: false, error: 'Escena no encontrada' });
        }

        const [opciones] = await db.promise().query('SELECT * FROM opciones WHERE escena_origen_id = ?', [escenaId]);

        res.json({ success: true, escena: escena[0], opciones });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Elegir una opción y avanzar en la historia
export const elegirOpcion = async (req, res) => {
    try {
        const { opcionId } = req.params;
        const { jugadorId } = req.body;

        if (!jugadorId) {
            return res.status(400).json({ success: false, error: 'El jugadorId es obligatorio' });
        }

        // Verificar si la opción existe
        const [opcion] = await db.promise().query(
            `SELECT o.escena_destino_id, e.texto AS escena_texto, e.historia_id
             FROM opciones o
             JOIN escenas e ON o.escena_destino_id = e.id
             WHERE o.id = ?`,
            [opcionId]
        );

        if (opcion.length === 0) {
            return res.status(404).json({ success: false, error: 'Opción no encontrada' });
        }

        const { escena_destino_id, historia_id, escena_texto } = opcion[0];

        // Actualizar el progreso del jugador
        await db.promise().query(
            `INSERT INTO progreso (jugador_id, historia_id, escena_actual_id) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE escena_actual_id = ?`,
            [jugadorId, historia_id, escena_destino_id, escena_destino_id]
        );

        const [opciones] = await db.promise().query('SELECT * FROM opciones WHERE escena_origen_id = ?', [escena_destino_id]);

        res.json({
            success: true,
            escenaDestino: { id: escena_destino_id, texto: escena_texto },
            opciones
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
// Obtener el progreso del jugador en una historia
export const getProgresoJugador = async (req, res) => {
    try {
        const { historiaId } = req.params;
        const { jugadorId } = req.query;

        if (!jugadorId || isNaN(jugadorId)) {
            return res.status(400).json({ success: false, error: 'El jugadorId es obligatorio y debe ser un número válido' });
        }

        if (!historiaId || isNaN(historiaId)) {
            return res.status(400).json({ success: false, error: 'El historiaId es obligatorio y debe ser un número válido' });
        }

        // Verificar si el jugador existe
        const [jugador] = await db.promise().query('SELECT id FROM jugadores WHERE id = ?', [jugadorId]);
        if (jugador.length === 0) {
            return res.status(404).json({ success: false, error: 'Jugador no encontrado' });
        }

        // Buscar progreso del jugador en la historia
        const [progreso] = await db.promise().query(
            'SELECT escena_actual_id FROM progreso WHERE jugador_id = ? AND historia_id = ?',
            [jugadorId, historiaId]
        );

        if (progreso.length === 0) {
            return res.status(404).json({ success: false, error: 'No hay progreso guardado para este jugador en esta historia' });
        }

        res.json({ success: true, escena_actual_id: progreso[0].escena_actual_id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};
