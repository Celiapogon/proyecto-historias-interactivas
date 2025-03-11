import express from 'express';
import { registro, login, getPerfil, updateAutor } from '../controllers/autores.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js'; // Importar el middleware
const router = express.Router();

// Ruta para registrar un autor (usuario)
router.post('/register', registro); // Registro de usuario
// Ruta para hacer login y obtener un token JWT
router.post('/login', login); // Login y obtener token JWT
// Ruta protegida para obtener el perfil de un autor (usuario)
router.get('/profile', verifyToken, getPerfil); // Perfil del usuario (requiere JWT)
// Ruta para actualizar los datos del autor (nombre, email, contraseña)
router.put('/update', verifyToken, updateAutor); // Requiere autenticación (JWT)

export default router;