import dotenv from 'dotenv';//cargar las variables de entorno
dotenv.config();
import { createConnection } from 'mysql2'; //se importa mysql2

//crear la conexion con la base de datos y poder importarla en otros archivos
export const db = createConnection({
    host: process.env.BD_HOST,
    user: process.env.BD_USER,
    password: process.env.BD_PASSWORD,
    database: process.env.DATABASE
});
db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos :D');
});