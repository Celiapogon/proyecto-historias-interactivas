import { db } from '../config/db.js';
import jwt from 'jsonwebtoken'; //de momento se usa para generar y verificar tokens
//mas adelante se podria agregar cifrado con bcrypt, pero en desarrollo no es necesario
//de momento las peticiones get sin mostrar la contrasenia

//RUTAS REALES PARA LOS AUTORES
// Registro de un nuevo autor (usuario)
export const registro = (req, res) => {
    try{ 
        const { nombre, email, password } = req.body;
        // console.log('Received registration data:', { nombre, email }); // Debug log        
        if (!nombre || !email || !password) {
            console.log('Missing fields:', { nombre, email, password: !!password });
            return res.status(400).json({
                success: false, 
                message: 'Nombre, email y contraseña son requeridos' 
            });
        }

        // Check if username or email already exists
        db.query('SELECT id, email, nombre FROM autores WHERE email = ? OR nombre = ?', [email, nombre], (err, results) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error al verificar usuario' 
                });
            }

            if (results.length > 0) {
                const existingUser = results[0];
                if (existingUser.email === email) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'El email ya está registrado' 
                    });
                }
                if (existingUser.nombre === nombre) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'El nombre de usuario ya está en uso' 
                    });
                }
            }

            // If neither email nor username exists, proceed with registration
            db.query('INSERT INTO autores (nombre, email, password) VALUES (?, ?, ?)', 
                [nombre, email, password], 
                (err, result) => {
                    if (err) {
                        console.error('Database error during insertion:', err);
                        return res.status(500).json({ 
                            success: false,
                            message: 'Error al registrar usuario',
                            error: err.message 
                        });
                    }
                    
                    console.log('Registration successful:', result);
                    res.status(201).json({ 
                        success: true,
                        message: 'Usuario registrado exitosamente',
                        data: {
                            id: result.insertId, 
                            nombre, 
                            email
                        } 
                    });
                }
            );
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
// Iniciar sesión 
export const login = (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt for:', email); // Debug log
    
    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email y contraseña son requeridos' 
        });
    }
    

    // Buscar el autor en la base de datos
    db.query('SELECT * FROM autores WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error en el servidor' 
            });
        }

        if (results.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email o contraseña incorrectos' 
            });
        }

        const autor = results[0];
        // Comparar las contraseñas (sin cifrado, solo comparación directa)
        if (password !== autor.password) {
            return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: autor.id, email: autor.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        console.log('Login successful for:', email); // Debug log

        res.json({ 
            success: true, 
            data: {
                token,
                user: {
                    id: autor.id,
                    nombre: autor.nombre,
                    email: autor.email
                }
            }
        });
    });
};

// Obtener el perfil de un autor (usuario)
export const getPerfil = (req, res) => {
    const { id } = req.user; // Getting ID from JWT token
    console.log('User ID from token:', id); // Debug log

    // Explicitly select id in the query
    db.query(
        'SELECT id, nombre, email FROM autores WHERE id = ?', 
        [id], 
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error al obtener el perfil' 
                });
            }

            if (results.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Autor no encontrado' 
                });
            }

            console.log('Profile data being sent:', results[0]); // Debug log
            res.json(results[0]);
        }
    );
};

export const updateAutor = (req, res) => {
    const { id } = req.user; // Obtener el ID del autor desde el token
    const { nombre, email, password } = req.body;   
    if (!nombre || !email || !password) {
        console.log('Missing fields:', { nombre, email, password: !!password });
        return res.status(400).json({
            success: false, 
            message: 'Nombre, email y contraseña son requeridos' 
        });
    }


    // Check if username or email already exists
    db.query('SELECT id, email, nombre FROM autores WHERE email = ? OR nombre = ?', [email, nombre], (err, results) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Error al verificar usuario' 
            });
        }

        if (results.length > 0) {
            const existingUser = results[0];           
            if (existingUser.nombre === nombre) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'El nombre de usuario ya está en uso' 
                });
            }
        }
    });
        
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
            return res.status(404).json({ success: false, message: 'Autor no encontrado o no se realizaron cambios' });
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
