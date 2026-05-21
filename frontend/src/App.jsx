import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Categorias from './pages/Categorias';
import Productos from './pages/Productos';
import Clientes from './pages/Clientes';
import Ventas from './pages/Ventas';
import Login from './pages/Login';

import {
  puedeVerDashboard,
  puedeVerProductos,
  puedeVerCategorias,
  puedeVerClientes,
  puedeVerVentas
} from './utils/permisos';

import './styles/dashboard.css';

/*
  Ruta protegida por permisos.
  Si el usuario no tiene permiso para acceder a una página,
  se redirige automáticamente a la página inicial permitida para su rol.
*/
const RutaProtegida = ({ permitido, redireccion, children }) => {
  if (!permitido) {
    return <Navigate to={redireccion} replace />;
  }

  return children;
};

/*
  Define la página inicial según el rol del usuario.
  Administrador y Gerencia entran al Dashboard.
  Vendedor entra directamente a Ventas.
*/
const obtenerRutaInicial = (usuario) => {
  if (puedeVerDashboard(usuario)) {
    return '/';
  }

  if (puedeVerVentas(usuario)) {
    return '/ventas';
  }

  if (puedeVerProductos(usuario)) {
    return '/productos';
  }

  if (puedeVerClientes(usuario)) {
    return '/clientes';
  }

  return '/login';
};

/*
  Componente principal de la aplicación.
  Controla la sesión activa, las rutas protegidas y la navegación según roles.
*/
function App() {
  const [usuario, setUsuario] = useState(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  const rutaInicial = obtenerRutaInicial(usuario);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <RutaProtegida
                  permitido={puedeVerDashboard(usuario)}
                  redireccion={rutaInicial}
                >
                  <Dashboard />
                </RutaProtegida>
              }
            />

            <Route
              path="/productos"
              element={
                <RutaProtegida
                  permitido={puedeVerProductos(usuario)}
                  redireccion={rutaInicial}
                >
                  <Productos />
                </RutaProtegida>
              }
            />

            <Route
              path="/categorias"
              element={
                <RutaProtegida
                  permitido={puedeVerCategorias(usuario)}
                  redireccion={rutaInicial}
                >
                  <Categorias />
                </RutaProtegida>
              }
            />

            <Route
              path="/clientes"
              element={
                <RutaProtegida
                  permitido={puedeVerClientes(usuario)}
                  redireccion={rutaInicial}
                >
                  <Clientes />
                </RutaProtegida>
              }
            />

            <Route
              path="/ventas"
              element={
                <RutaProtegida
                  permitido={puedeVerVentas(usuario)}
                  redireccion={rutaInicial}
                >
                  <Ventas />
                </RutaProtegida>
              }
            />

            <Route path="*" element={<Navigate to={rutaInicial} replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;