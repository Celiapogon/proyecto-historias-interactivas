import '../styles/Register.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

      // Validación local
  if (!formData.nombre || !formData.email || !formData.password || !formData.confirmPassword) {
    setError('Todos los campos son obligatorios');
    return;
  }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/autores/register',
        {
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password
        },
        {
          headers: { 'Content-Type': 'application/json' } // Se asegura de que el servidor lo reciba correctamente
        }
      );

      console.log('Server response:', response.data);

      if (response.data.success) {
        setSuccessMessage('Registro exitoso. Redirigiendo...');
        setTimeout(() => navigate('/login'), 1500); // Redirige después de 1.5 segundos
      }
    } catch (error) {
      console.error('Server error details:', error.response?.data);
      // Mostrar el mensaje de error específico del backend
      if (error.response?.data?.message) {
        setError(error.response.data.message); // Aquí capturas el mensaje de error específico
    } else {
        setError('Error en el registro');
    }
    }
  };

  return (
    <div className="register-container">
      <h2>Registro</h2>

      {/* Mensajes de éxito y error */}
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Usuario:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirmar Contraseña:</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Registrarse</button>
      </form>

      <p>
        ¿Ya tienes una cuenta? <a href="/login">Iniciar sesión</a>
      </p>
    </div>
  );
};

export default Register;
