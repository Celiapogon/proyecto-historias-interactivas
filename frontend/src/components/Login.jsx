import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔄 Si ya hay un token, redirigir al usuario automáticamente
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

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
    setLoading(true);

     // Validación local
  if (!formData.email || !formData.password) {
    setError('Por favor ingresa un email y una contraseña');
    setLoading(false);
    return;
  }

    try {
      console.log('Login attempt:', { email: formData.email });
      const response = await axios.post(
        'http://localhost:5000/api/autores/login',
        {
          email: formData.email,
          password: formData.password
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      console.log('Login response:', response.data);

      if (response.data.success && response.data.data.token) {
        sessionStorage.setItem('token', response.data.data.token);
        setSuccessMessage(' Entrando...');
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (error) {
      console.error('Login error:', error.response?.data);
     // Mostrar el mensaje de error específico del backend
      if (error.response?.data?.message) {
      setError(error.response.data.message); // Aquí se captura el mensaje de error específico
  } else {
      setError('Error en el inicio de sesión');
  }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>


      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
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
            autoComplete="current-password"
          />
        </div>

        {/* Botón de envío deshabilitado mientras se procesa */}
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
      </form>
      <hr />
            {/* Mensajes de error y éxito */}
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
      <p>
        ¿No tienes una cuenta? <a href="/register">Registrarse</a>
      </p>
    </div>
  );
};

export default Login;
