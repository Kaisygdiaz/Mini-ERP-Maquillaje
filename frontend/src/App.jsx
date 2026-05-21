import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Categorias from './pages/Categorias';
import Productos from './pages/Productos';
import Clientes from './pages/Clientes';
import Ventas from './pages/Ventas';
import Login from './pages/Login';

import './styles/dashboard.css';

/*
  Componente principal de la aplicación.
  Controla si hay sesión iniciada y muestra el sistema según el usuario autenticado.
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

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/ventas" element={<Ventas />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;