import dotenv from 'dotenv';
dotenv.config();
import express, { json } from 'express';//crear un servidor express
import cors from 'cors';//habilita cors para permitir solicitudes desde diferentes orígenes
const port = process.env.PORT || 5000;//se configura el puerto desde .env
import autoresRoutes from './src/routes/autores.routes.js';
import historiasRoutes from './src/routes/historias.routes.js';
import escenasRoutes from './src/routes/escenas.routes.js';
import opcionesRoutes from './src/routes/opciones.routes.js';
import juegoRoutes from './src/routes/juego.routes.js';

const app = express();//crear la aplicacion de express
app.use(cors());//habilitar cors
app.use(express.json());//habilitar el parsing de json
//rutas
app.use('/api/autores', autoresRoutes);
app.use('/api/historias', historiasRoutes);
app.use('/api/escenas', escenasRoutes);
app.use('/api/opciones', opcionesRoutes);
app.use('/api/juego', juegoRoutes);

//inicia el servidor escuchando en el puerto 5000
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});




