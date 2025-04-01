import express from 'express';
import {registrarJugador, getHistoriaInicio, getEscena, elegirOpcion, getProgresoJugador } from '../controllers/juego.controller.js';

const router = express.Router();

//Ruta para registrar jugadores
router.post('/jugador', registrarJugador);
// Obtener la historia y la escena inicial------------------>FALLA
router.get('/inicio/:historiaId', getHistoriaInicio);
// Obtener una escena por ID
router.get('/escena/:escenaId', getEscena);
// Elegir una opción y navegar a la siguiente escena----------->FALLA
router.post('/opcion/:opcionId', elegirOpcion);
//Obtener el progreso del jugador
router.get('/progreso/:historiaId', getProgresoJugador);

export default router;