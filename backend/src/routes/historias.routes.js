import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
    getHistoriasPublicas,
    getHistoriaById,
    getHistoriasByAutor,
    crearHistoria,
    actuarlizarHistoria,
    borrarHistoria
} from '../controllers/historias.controller.js';

const router = express.Router();

// Protected routes
router.get('/mis-historias', verifyToken, getHistoriasByAutor); 
router.post('/nuevaHistoria', verifyToken, crearHistoria);
router.put('/:id', verifyToken, actuarlizarHistoria);
router.delete('/:id', verifyToken, borrarHistoria);

// Public routes
router.get('/getHistorias', getHistoriasPublicas);
router.get('/:id', getHistoriaById);

export default router;