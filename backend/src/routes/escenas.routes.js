import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
    getEscenasPublicas,
    getEscenaById,
    createEscena,
    updateEscena,
    deleteEscena
} from '../controllers/escenas.controller.js';
const router = express.Router();
// 🔓 Ruta pública para obtener todas las escenas de una historia
router.get('/:historia_id', getEscenasPublicas);
// 🔓 Ruta pública para ver una escena específica
router.get('/detalle/:id', getEscenaById);

// 🔒 Ruta protegida para que un autor cree una escena
router.post('/', verifyToken, createEscena);
// 🔒 Ruta protegida para que un autor modifique su escena
router.put('/:id', verifyToken, updateEscena);
// 🔒 Ruta protegida para que un autor elimine su escena
router.delete('/:id', verifyToken, deleteEscena);

export default router;