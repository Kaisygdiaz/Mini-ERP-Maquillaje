import { NavLink } from 'react-router-dom';

import {
  puedeVerDashboard,
  puedeVerProductos,
  puedeVerCategorias,
  puedeVerClientes,
  puedeVerVentas,
  puedeVerUsuarios
} from '../utils/permisos';


const Sidebar = ({ usuario, cerrarSesion }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h4>Beauty ERP</h4>
        <small>Ventas e Inventario</small>
      </div>

      <div className="sidebar-user mb-4">
        <small className="text-light">Usuario</small>
        <div className="fw-bold">{usuario.nombre}</div>
        <span className="badge bg-light text-dark mt-1">
          {usuario.rol}
        </span>
      </div>

      <nav className="sidebar-menu">
        {puedeVerDashboard(usuario) && (
          <NavLink to="/" className="sidebar-link">
            Dashboard
          </NavLink>
        )}

        {puedeVerProductos(usuario) && (
          <NavLink to="/productos" className="sidebar-link">
            Productos
          </NavLink>
        )}

        {puedeVerCategorias(usuario) && (
          <NavLink to="/categorias" className="sidebar-link">
            Categorías
          </NavLink>
        )}

        {puedeVerClientes(usuario) && (
          <NavLink to="/clientes" className="sidebar-link">
            Clientes
          </NavLink>
        )}

        {puedeVerVentas(usuario) && (
          <NavLink to="/ventas" className="sidebar-link">
            Ventas
          </NavLink>
        )}

        {puedeVerUsuarios(usuario) && (
          <NavLink to="/usuarios" className="sidebar-link">
            Usuarios
          </NavLink>
        )}
      </nav>

      <button
        type="button"
        className="btn btn-outline-light w-100 mt-4"
        onClick={cerrarSesion}
      >
        Cerrar sesión
      </button>
    </aside>
  );
};

export default Sidebar;