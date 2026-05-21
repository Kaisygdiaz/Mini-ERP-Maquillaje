import { useState } from 'react';
import api from '../api/axiosConfig';

/*
  Página de inicio de sesión.
  Valida las credenciales contra el backend y guarda el usuario autenticado en localStorage.
*/
const Login = ({ onLogin }) => {
  const [formulario, setFormulario] = useState({
    correo: '',
    contrasena: ''
  });

  const [mensaje, setMensaje] = useState('');

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const iniciarSesion = async (e) => {
    e.preventDefault();

    if (!formulario.correo || !formulario.contrasena) {
      setMensaje('El correo y la contraseña son obligatorios');
      return;
    }

    try {
      const respuesta = await api.post('/auth/login', formulario);

      localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));

      onLogin(respuesta.data.usuario);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setMensaje(error.response?.data?.mensaje || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card shadow">
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-1">Beauty ERP</h2>
          <p className="text-muted">
            Sistema de ventas e inventario
          </p>
        </div>

        {mensaje && (
          <div className="alert alert-danger py-2">
            {mensaje}
          </div>
        )}

        <form onSubmit={iniciarSesion}>
          <div className="mb-3">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              name="correo"
              className="form-control"
              value={formulario.correo}
              onChange={manejarCambio}
              placeholder="Ingrese su correo"
              autoComplete="email"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="contrasena"
              className="form-control"
              value={formulario.contrasena}
              onChange={manejarCambio}
              placeholder="Ingrese su contraseña"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;