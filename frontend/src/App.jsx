import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Categorias from './pages/Categorias';
import Productos from './pages/Productos';
import Clientes from './pages/Clientes';
import Ventas from './pages/Ventas';
import Usuarios from './pages/Usuarios';
import Inventario from './pages/Inventario';
import Login from './pages/Login';

import {
  puedeVerDashboard,
  puedeVerProductos,
  puedeVerCategorias,
  puedeVerClientes,
  puedeVerVentas,
  puedeVerUsuarios,
  puedeVerInventario
} from './utils/permisos';

import './styles/dashboard.css';

/*
  Ruta protegida por permisos.
  Si el usuario no tiene acceso, se redirige a una ruta permitida según su rol.
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

  if (puedeVerInventario(usuario)) {
    return '/inventario';
  }

  if (puedeVerUsuarios(usuario)) {
    return '/usuarios';
  }

  return '/';
};

/*
  Componente principal de la aplicación.
  Controla sesión, rutas protegidas y navegación según roles.
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

            <Route
              path="/inventario"
              element={
                <RutaProtegida
                  permitido={puedeVerInventario(usuario)}
                  redireccion={rutaInicial}
                >
                  <Inventario />
                </RutaProtegida>
              }
            />

            <Route
              path="/usuarios"
              element={
                <RutaProtegida
                  permitido={puedeVerUsuarios(usuario)}
                  redireccion={rutaInicial}
                >
                  <Usuarios />
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