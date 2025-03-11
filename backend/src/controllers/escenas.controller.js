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
export const crearEscena = (req, res) => {
    const { historia_id, contenido, es_inicio } = req.body;
    const autor_id = req.user.id;

    if (!contenido) return res.status(400).json({
        success: false, 
        error: 'El contenido es obligatorio'
    });
    if (typeof es_inicio !== 'boolean') return res.status(400).json({ 
        success: false,
        error: 'El campo "es_inicio" debe ser un valor booleano' });
    db.query('SELECT autor_id FROM historias WHERE id = ?', [historia_id], (err, results) => {
        if (err) return res.status(500).json({
            success: false, 
            error: "Error al verificar la historia en la base de datos", err});
        if (results.length === 0) return res.status(404).json({ success:false, error: 'Historia no encontrada' });

        if (results[0].autor_id !== autor_id) {
            return res.status(403).json({success:false, error: 'No puedes agregar escenas a esta historia' });
        }

        db.query('INSERT INTO escenas (historia_id, contenido, es_inicio) VALUES (?, ?, ?)', [historia_id, contenido, es_inicio], (err, result) => {
            if (err) return res.status(500).json({ success:false, error: "Error al crear la escena" });
            res.json({ 
                success: true, data:{ id: result.insertId, historia_id, contenido, es_inicio }
            });
        });
    });
};

// Modificar una escena (Solo el autor)
export const actualizarEscena = (req, res) => {
    const { id } = req.params;
    const { contenido, es_inicio } = req.body;
    const autor_id = req.user.id;

    db.query('SELECT historias.autor_id FROM escenas JOIN historias ON escenas.historia_id = historias.id WHERE escenas.id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ success: false,
            error: 'Error al verificar la escena en la base de datos' });
        if (results.length === 0) return res.status(404).json({ success: false, error: 'Escena no encontrada' });

        if (results[0].autor_id !== autor_id) {
            return res.status(403).json({success:false, error: 'No puedes modificar esta escena' });
        }

        db.query('UPDATE escenas SET contenido = ?, es_inicio = ? WHERE id = ?', [contenido, es_inicio, id], (err) => {
            if (err) return res.status(500).json({ success: false,
                error: 'Error al actualizar la escena' });
            res.json({ success:true,data: {message: 'Escena actualizada correctamente'} });
        });
    });
};

// Eliminar una escena (Solo el autor)
export const eliminarEscena = (req, res) => {
    const { id } = req.params;
    const autor_id = req.user.id;

    db.query('SELECT historias.autor_id FROM escenas JOIN historias ON escenas.historia_id = historias.id WHERE escenas.id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ success: false,
            error: 'Error al verificar la escena en la base de datos' });
        if (results.length === 0) return res.status(404).json({ success: false, error: 'Escena no encontrada' });

        if (results[0].autor_id !== autor_id) {
            return res.status(403).json({ success:false,error: 'No puedes eliminar esta escena' });
        }

        db.query('DELETE FROM escenas WHERE id = ?', [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({success:true, data: {message: 'Escena eliminada correctamente'}});
        });
    });
};