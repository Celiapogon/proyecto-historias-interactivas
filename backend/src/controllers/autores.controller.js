import { db } from '../config/db.js';
import jwt from 'jsonwebtoken'; //de momento se usa para generar y verificar tokens
//mas adelante se podria agregar cifrado con bcrypt, pero en desarrollo no es necesario
//de momento las peticiones get sin mostrar la contrasenia

//RUTAS REALES PARA LOS AUTORES
// Registro de un nuevo autor (usuario)
export const registro = (req, res) => {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
        return res.status(400).json({succes:false, error: 'Nombre, email y contraseña son requeridos' });
    }
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({succes:false, error: 'Este email ya está registrado' });
    }
    // Insertar el nuevo autor (usuario) en la base de datos
    db.query('INSERT INTO autores (nombre, email, password) VALUES (?, ?, ?)', [nombre, email, password], (err, result) => {
        if (err) return res.status(500).json({ succes:false,error: err.message });
        res.status(201).json({ succes:true,data: {id: result.insertId, nombre, email} });
    });
};
// Iniciar sesión 
export const login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success:false, error: 'Email y contraseña son requeridos' });
    }
    // Buscar el autor en la base de datos
    db.query('SELECT * FROM autores WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ success:false, error: err.message });
        if (results.length === 0) return res.status(404).json({ success:false, error: 'Autor no encontrado' });
        const autor = results[0];
        // Comparar las contraseñas (sin cifrado, solo comparación directa)
        if (password !== autor.password) {
            return res.status(401).json({success:false, error: 'Contraseña incorrecta' });
        }
        // Generar el token JWT.Cuando el usuario se autentica correctamente, se genera un token JWT usando jwt.sign, que contiene el ID y el email del autor. Este token se enviará al cliente para futuras solicitudes.
        const token = jwt.sign({ id: autor.id, email: autor.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ success:true, data:{message: 'Autenticación exitosa', token }});
    });
};

// Obtener el perfil de un autor (usuario)
export const getPerfil = (req, res) => {
    const { id } = req.user; // Obtengo el ID del usuario desde el token (middleware)
    // Buscar los datos del autor en la base de datos
    db.query('SELECT nombre, email FROM autores WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Autor no encontrado' });
        res.json(results[0]);
    });
};

export const updateAutor = (req, res) => {
    const { id } = req.user; // Obtener el ID del autor desde el token
    const { nombre, email, password } = req.body;
    if (!nombre && !email && !password) {
        return res.status(400).json({ error: 'Al menos uno de los campos (nombre, email o contraseña) debe ser proporcionado.' });
    }
    // Construir la consulta de actualización dinámica
    let query = 'UPDATE autores SET ';
    const params = [];
    if (nombre) {
        query += 'nombre = ?, ';
        params.push(nombre);
    }
    if (email) {
        query += 'email = ?, ';
        params.push(email);
    }
    if (password) {
        query += 'password = ?, ';
        params.push(password);
    }
    // Eliminar la coma al final de la consulta
    query = query.slice(0, -2);
    query += ' WHERE id = ?';
    params.push(id);
    db.query(query, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        // Verificar si algún registro fue actualizado
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Autor no encontrado o no se realizaron cambios' });
        }

        res.json({ message: 'Datos del autor actualizados correctamente' });
    });
};

//Si authorization no esta presente, da un error 403, para dar mas detalle al usuario:
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ error: 'Acceso denegado. Token requerido.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ error: 'Formato de token incorrecto. Se espera "Bearer <token>".' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido o expirado.' });
        }
        req.user = decoded;
        next();
    });
};


// export const updatePerfil = (req, res) => {
//     const { id } = req.params;
//     const { nombre, email, password } = req.body;
//     if (!nombre || !email||!password) return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
//     db.query('UPDATE nombre SET nombre = ? WHERE id = ?', [nombre, email,password, id], (err, result) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json({ message: 'Autor actualizado correctamente' });
//     });
// // };
//RUTAS DE PRUEBA
// export const getAutores = (req, res) => {
//     db.query('SELECT id,nombre,email,fecha_creacion FROM autores', (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json(results);
//     });
// };
// export const getAutorById = (req, res) => {
//     const { id } = req.params;
//     db.query('SELECT id,nombre,email,fecha_creacion FROM autores WHERE id = ?', [id], (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         if (results.length === 0) return res.status(404).json({ error: 'Autor no encontrado' });
//         res.json(results[0]);
//     });
// };
// export const createAutor = (req, res) => {
//     const { nombre, email, password } = req.body;
//     if (!nombre || !email||!password) return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
//     const fecha_creacion = new Date();
//     db.query('INSERT INTO autores (nombre, email,password,fecha_creacion) VALUES (?, ?,?,?)', [nombre, email,password,fecha_creacion], (err, result) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json({ id: result.insertId, nombre, email,fecha_creacion });
//     });
// };
// export const updateAutor = (req, res) => {
//     const { id } = req.params;
//     const { nombre, email, password } = req.body;
//     if (!nombre || !email||!password) return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });

//     db.query('UPDATE autores SET nombre = ?, email = ?, password = ? WHERE id = ?', [nombre, email,password, id], (err, result) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json({ message: 'Autor actualizado correctamente' });
//     });
// };
// export const deleteAutor = (req, res) => {
//     const { id } = req.params;
//     db.query('DELETE FROM autores WHERE id = ?', [id], (err, result) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json({ message: 'Autor eliminado correctamente' });
//     });
// };
