import express from 'express';
import { getHistoriaInicio, getEscena, elegirOpcion } from '../controllers/juego.controller.js';

const router = express.Router();

// Obtener la historia y la escena inicial
router.get('/inicio/:historiaId', getHistoriaInicio);
// Obtener una escena por ID
router.get('/escena/:escenaId', getEscena);
// Elegir una opción y navegar a la siguiente escena
router.post('/opcion/:opcionId', elegirOpcion);

export default router;