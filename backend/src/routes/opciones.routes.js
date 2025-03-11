import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
    getOpcionesByEscena,
    crearOpcion,
    eliminarOpcion,
    actualizarOpcion

} from '../controllers/opciones.controller.js';
const router = express.Router();
// 🔓 Ruta pública para obtener las opciones de una escena (Ver hacia dónde puede ir un lector)
router.get('/:escena_origen_id', getOpcionesByEscena);
// 🔒 Ruta protegida para que un autor cree una opción
router.post('/', verifyToken,crearOpcion);
// 🔒 Ruta protegida para que un autor elimine una opción
router.delete('/:id', verifyToken, eliminarOpcion);
//Ruta protegida de actualizacion de opcion
router.put('/:id', verifyToken, actualizarOpcion);
export default router;