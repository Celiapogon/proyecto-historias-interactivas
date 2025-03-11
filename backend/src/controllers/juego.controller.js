import { db } from '../config/db.js';

// Obtener la historia inicial y la primera escena
export const getHistoriaInicio = (req, res) => {
    const { historiaId } = req.params;

    db.query('SELECT * FROM historias WHERE id = ?', [historiaId], (err, historia) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (historia.length === 0) {
            return res.status(404).json({ error: 'Historia no encontrada' });
        }

        // Obtener la escena inicial
        db.query('SELECT * FROM escenas WHERE historia_id = ? AND es_inicio = 1', [historiaId], (err, escena) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (escena.length === 0) {
                return res.status(404).json({ error: 'Escena inicial no encontrada' });
            }

            // Obtener las opciones de la escena inicial
            db.query('SELECT * FROM opciones WHERE escena_origen_id = ?', [escena[0].id], (err, opciones) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.json({
                    historia: historia[0],
                    escena: escena[0],
                    opciones: opciones
                });
            });
        });
    });
};

// Obtener una escena por su ID
export const getEscena = (req, res) => {
    const { escenaId } = req.params;

    db.query('SELECT * FROM escenas WHERE id = ?', [escenaId], (err, escena) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (escena.length === 0) {
            return res.status(404).json({ error: 'Escena no encontrada' });
        }

        // Obtener las opciones de la escena
        db.query('SELECT * FROM opciones WHERE escena_origen_id = ?', [escenaId], (err, opciones) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                escena: escena[0],
                opciones: opciones
            });
        });
    });
};

// Elegir una opción y redirigir al jugador a la escena destino
export const elegirOpcion = (req, res) => {
    const { opcionId } = req.params;

    // Obtener la opción seleccionada
    db.query('SELECT * FROM opciones WHERE id = ?', [opcionId], (err, opcion) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (opcion.length === 0) {
            return res.status(404).json({ error: 'Opción no encontrada' });
        }

        const escenaDestinoId = opcion[0].escena_destino_id;

        // Obtener la escena destino
        db.query('SELECT * FROM escenas WHERE id = ?', [escenaDestinoId], (err, escenaDestino) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (escenaDestino.length === 0) {
                return res.status(404).json({ error: 'Escena destino no encontrada' });
            }

            res.json({
                escenaDestino: escenaDestino[0],
                opciones: [] // Aquí puedes devolver las opciones de la nueva escena si las hay
            });
        });
    });
};