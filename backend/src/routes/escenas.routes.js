import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
    getEscenasPublicas,
    getEscenaById,
    crearEscena,
    actualizarEscena,
    eliminarEscena
} from '../controllers/escenas.controller.js';
const router = express.Router();
// 🔓 Ruta pública para obtener todas las escenas de una historia
router.get('/:historia_id', getEscenasPublicas);
// 🔓 Ruta pública para ver una escena específica
router.get('/escena/:id', getEscenaById);

// 🔒 Ruta protegida para que un autor cree una escena
router.post('/nuevaEscena', verifyToken, crearEscena);
// 🔒 Ruta protegida para que un autor modifique su escena
router.put('/:id', verifyToken, actualizarEscena);
// 🔒 Ruta protegida para que un autor elimine su escena
router.delete('/:id', verifyToken, eliminarEscena);

export default router;