import { db } from '../config/db.js';

// Obtener todas las historias (Público)
export const getHistoriasPublicas = (req, res) => {
    db.query('SELECT id, titulo, descripcion, fecha_creacion FROM historias', (err, historias) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(historias);
    });
};
// Obtener una historia por ID (Público)
export const getHistoriaById = (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM historias WHERE id = ?', [id], (err, historia) => {
        if (err) return res.status(500).json({ error: err.message });
        if (historia.length === 0) return res.status(404).json({ error: 'Historia no encontrada' });

        res.json(historia[0]);
    });
};

// Crear una historia (solo usuarios autenticados)
export const createHistoria = (req, res) => {
    const { titulo, descripcion } = req.body;
    const autor_id = req.user.id; // Obtenemos el ID del usuario autenticado

    if (!titulo || !descripcion) return res.status(400).json({ error: 'Título y descripción son requeridos' });

    db.query('INSERT INTO historias (titulo, descripcion, autor_id) VALUES (?, ?, ?)', 
    [titulo, descripcion, autor_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, titulo, descripcion, autor_id });
    });
};

// Actualizar una historia (solo el autor puede hacerlo)
export const updateHistoria = (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion } = req.body;
    const autor_id = req.user.id; // Obtenemos el ID del usuario autenticado

    db.query('SELECT autor_id FROM historias WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Historia no encontrada' });

        if (results[0].autor_id !== autor_id) {
            return res.status(403).json({ error: 'No tienes permiso para modificar esta historia' });
        }

        db.query('UPDATE historias SET titulo = ?, descripcion = ? WHERE id = ?', [titulo, descripcion, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Historia actualizada correctamente' });
        });
    });
};

// Eliminar una historia (solo el autor puede hacerlo)
export const deleteHistoria = (req, res) => {
    const { id } = req.params;
    const autor_id = req.user.id; // Obtenemos el ID del usuario autenticado

    db.query('SELECT autor_id FROM historias WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Historia no encontrada' });

        if (results[0].autor_id !== autor_id) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta historia' });
        }

        db.query('DELETE FROM historias WHERE id = ?', [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Historia eliminada correctamente' });
        });
    });
};