import { db } from '../config/db.js';
// 🔓 Obtener todas las opciones de una escena específica (Público)
export const getOpcionesByEscena = (req, res) => {
    const { escena_origen_id } = req.params;
    db.query(
        'SELECT * FROM opciones WHERE escena_origen_id = ?',
        [escena_origen_id],
        (err, opciones) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(opciones);
        }
    );
};
// 🔒 Crear una opción (Solo el autor de la historia puede hacerlo)
export const crearOpcion = (req, res) => {
    const { escena_origen_id, escena_destino_id, texto } = req.body;
    const autor_id = req.user.id;

    // Verificar que la escena de origen pertenece al autor
    db.query(
        `SELECT historias.autor_id FROM escenas 
        JOIN historias ON escenas.historia_id = historias.id 
        WHERE escenas.id = ?`,
        [escena_origen_id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) return res.status(404).json({ error: 'Escena no encontrada' });

            if (results[0].autor_id !== autor_id) {
                return res.status(403).json({ error: 'No puedes agregar opciones a esta escena' });
            }
            // Insertar la nueva opción
            db.query(
                'INSERT INTO opciones (escena_origen_id, escena_destino_id, texto) VALUES (?, ?, ?)',
                [escena_origen_id, escena_destino_id, texto],
                (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({
                        id: result.insertId,
                        escena_origen_id,
                        escena_destino_id,
                        texto,
                    });
                }
            );
        }
    );
};

// 🔒 Eliminar una opción (Solo el autor de la historia puede hacerlo)
export const eliminarOpcion = (req, res) => {
    const { id } = req.params;
    const autor_id = req.user.id;

    // Verificar que la opción existe y pertenece a una historia del autor
    db.query(
        `SELECT historias.autor_id, escenas.id AS escena_id FROM opciones 
         JOIN escenas ON opciones.escena_origen_id = escenas.id 
         JOIN historias ON escenas.historia_id = historias.id 
         WHERE opciones.id = ?`,
        [id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) return res.status(404).json({ error: 'Opción no encontrada' });

            if (results[0].autor_id !== autor_id) {
                return res.status(403).json({ error: 'No puedes eliminar esta opción' });
            }

            // Si todo está bien, eliminamos la opción
            db.query('DELETE FROM opciones WHERE id = ?', [id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Opción eliminada correctamente' });
            });
        }
    );
};

// 🔒 Actualizar una opción (Solo el autor de la historia puede hacerlo)
export const actualizarOpcion = (req, res) => {
    const { id } = req.params;
    const { escena_origen_id, escena_destino_id, texto } = req.body;
    const autor_id = req.user.id;
    // Verificar que la opción existe y pertenece a una historia del autor
    db.query(
        `SELECT historias.autor_id FROM opciones 
         JOIN escenas ON opciones.escena_origen_id = escenas.id 
         JOIN historias ON escenas.historia_id = historias.id 
         WHERE opciones.id = ?`,
        [id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) return res.status(404).json({ error: 'Opción no encontrada' });

            if (results[0].autor_id !== autor_id) {
                return res.status(403).json({ error: 'No puedes actualizar esta opción' });
            }

            // Si todo está bien, actualizamos la opción
            db.query(
                'UPDATE opciones SET escena_origen_id = ?, escena_destino_id = ?, texto = ? WHERE id = ?',
                [escena_origen_id, escena_destino_id, texto, id],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Opción actualizada correctamente' });
                }
            );
        }
    );
};