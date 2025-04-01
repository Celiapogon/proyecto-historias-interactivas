import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extrae el token del encabezado: Usa req.headers['authorization'] para obtener el valor del encabezado Authorization. El token debe ser precedido por la palabra Bearer, por eso lo partimos con split(' ')[1].
    if (!token) {
        console.log("Token no proporcionado");
        return res.status(403).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {//verificar que el token es válido, es decir, que ha sido firmado con la misma clave secreta y no ha expirado.
        if (err) {
            console.log("Error verificando token:", err.message);
            return res.status(401).json({ error: 'Token inválido' });
        }
        console.log("Token verificado correctamente, usuario:", decoded);
        req.user = decoded;//i el token es válido, la información del usuario (decodificada del token) se guarda en req.user, y el middleware llama a next() para que la solicitud siga su curso y llegue a la ruta solicitada.
        next();
    });
};