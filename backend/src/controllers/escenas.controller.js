import { db } from '../config/db.js';

// Obtener todas las escenas de una historia (Público)
export const getEscenasPublicas = (req, res) => {
    const { historia_id } = req.params;

    db.query('SELECT id, historia_id, contenido, es_inicio FROM escenas WHERE historia_id = ?', [historia_id], (err, escenas) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(escenas);
    });
};
// Obtener una escena específica (Público)
export const getEscenaById = (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM escenas WHERE id = ?', [id], (err, escena) => {
        if (err) return res.status(500).json({ error: err.message });
        if (escena.length === 0) return res.status(404).json({ error: 'Escena no encontrada' });

        res.json(escena[0]);
    });
};
// Crear una nueva escena (Solo el autor)
export const createEscena = (req, res) => {
    const { historia_id, contenido, es_inicio } = req.body;
    const autor_id = req.user.id;

    if (!contenido) return res.status(400).json({ error: 'El contenido es obligatorio' });

    db.query('SELECT autor_id FROM historias WHERE id = ?', [historia_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Historia no encontrada' });

        if (results[0].autor_id !== autor_id) {
            return res.status(403).json({ error: 'No puedes agregar escenas a esta historia' });
        }

        db.query('INSERT INTO escenas (historia_id, contenido, es_inicio) VALUES (?, ?, ?)', [historia_id, contenido, es_inicio], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, historia_id, contenido, es_inicio });
        });
    });
};

// Modificar una escena (Solo el autor)
export const updateEscena = (req, res) => {
    const { id } = req.params;
    const { contenido, es_inicio } = req.body;
    const autor_id = req.user.id;

    db.query('SELECT historias.autor_id FROM escenas JOIN historias ON escenas.historia_id = historias.id WHERE escenas.id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Escena no encontrada' });

        if (results[0].autor_id !== autor_id) {
            return res.status(403).json({ error: 'No puedes modificar esta escena' });
        }

        db.query('UPDATE escenas SET contenido = ?, es_inicio = ? WHERE id = ?', [contenido, es_inicio, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Escena actualizada correctamente' });
        });
    });
};

// Eliminar una escena (Solo el autor)
export const deleteEscena = (req, res) => {
    const { id } = req.params;
    const autor_id = req.user.id;

    db.query('SELECT historias.autor_id FROM escenas JOIN historias ON escenas.historia_id = historias.id WHERE escenas.id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Escena no encontrada' });

        if (results[0].autor_id !== autor_id) {
            return res.status(403).json({ error: 'No puedes eliminar esta escena' });
        }

        db.query('DELETE FROM escenas WHERE id = ?', [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Escena eliminada correctamente' });
        });
    });
};