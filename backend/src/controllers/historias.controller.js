import { db } from '../config/db.js';

// Obtener todas las historias (Público)
export const getHistoriasPublicas = (req, res) => {
    const page = parseInt(req.query.page) || 1;  // Página actual (default 1)
    const limit = 10;  // Historias por página
    const offset = (page - 1) * limit;  
    db.query('SELECT id, titulo, descripcion, fecha_creacion FROM historias LIMIT ? OFFSET ?', 
        [limit, offset],(err, historias) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(historias);
    });
};
// Obtener una historia por ID (Público)
export const getHistoriaById = (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM historias WHERE id = ?', [id], (err, historia) => {
        if (err) return res.status(500).json({ error: err.message });
        if (historia.length === 0) return res.status(404).json({ success: false, message: 'Historia no encontrada' });

        res.json(historia[0]);
    });
};
// Crear una historia (solo usuarios autenticados)
export const crearHistoria = (req, res) => {
    console.log("Petición recibida en /api/historias"); // Esto debería aparecer en la consola del backend
    console.log("Usuario autenticado (req.user):", req.user);
    const { titulo, descripcion } = req.body;
    const autor_id = req.user.id; // Obtenemos el ID del usuario autenticado

    if (!titulo || titulo.trim() === '' || !descripcion || descripcion.trim() === '') { return res.status(400).json({ success: false, message: 'Título y descripción son requeridos y no pueden estar vacíos' });
        }
    db.query('INSERT INTO historias (titulo, descripcion, autor_id) VALUES (?, ?, ?)', 
    [titulo, descripcion, autor_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        console.log("Historia creada con éxito, ID:", result.insertId);
        res.json({ id: result.insertId, titulo, descripcion, autor_id });
    });
};

// Actualizar una historia (solo el autor puede hacerlo)
export const actuarlizarHistoria = (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion } = req.body;
    const autor_id = req.user.id; // Obtenemos el ID del usuario autenticado

    db.query('SELECT autor_id FROM historias WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'Historia no encontrada' });

        if (results[0].autor_id !== autor_id) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para modificar esta historia' });
        }
        if (!titulo || titulo.trim() === '' || !descripcion || descripcion.trim() === '') { return res.status(400).json({ success: false, message: 'Título y descripción son requeridos y no pueden estar vacíos' });
        }
        db.query('UPDATE historias SET titulo = ?, descripcion = ? WHERE id = ?', [titulo, descripcion, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });            
            res.json({success: true, message: 'Historia actualizada correctamente' });
        });
    });
};

// Eliminar una historia (solo el autor puede hacerlo)
export const borrarHistoria = (req, res) => {
    const { id } = req.params;
    const autor_id = req.user.id; // Obtenemos el ID del usuario autenticado

    db.query('SELECT autor_id FROM historias WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'Historia no encontrada' });
        if (results[0].autor_id !== autor_id) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar esta historia' });
        }
        db.query('DELETE FROM historias WHERE id = ?', [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Historia eliminada correctamente' });
        });
    });
};

export const getHistoriasByAutor = (req, res) => {
    const autorId = req.user.id; // Get ID from token
    console.log('Obteniendo historias del autor con id:', autorId);

    db.query(
        'SELECT * FROM historias WHERE autor_id = ?', 
        [autorId],
        (err, historias) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error al obtener las historias'
                });
            }
            console.log('Historias encontradas:', historias);
            res.json(historias);
        }
    );
};