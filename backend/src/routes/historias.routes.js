import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
    getHistoriasPublicas,
    getHistoriaById,
    borrarHistoria,
    actuarlizarHistoria,
    crearHistoria
} from '../controllers/historias.controller.js';

const router = express.Router();

// 🔓 Ruta pública para obtener todas las historias (Lectores pueden verlas)
router.get('/', getHistoriasPublicas);
// 🔓 Ruta pública para ver detalles de una historia específica
router.get('/:id', getHistoriaById);

// 🔒 Ruta protegida para que un autor cree una historia
router.post('/', verifyToken, crearHistoria);
// 🔒 Ruta protegida para que un autor modifique su historia
router.put('/:id', verifyToken, actuarlizarHistoria);
// 🔒 Ruta protegida para que un autor elimine su historia
router.delete('/:id', verifyToken, borrarHistoria);

export default router;