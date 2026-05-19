import { NavLink } from 'react-router-dom';

/*
  Menú lateral principal del sistema.
  Permite navegar entre las páginas del Mini ERP.
*/
const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h4>Beauty ERP</h4>
        <small>Ventas e Inventario</small>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/" className="sidebar-link">
          Dashboard
        </NavLink>

        <NavLink to="/productos" className="sidebar-link">
          Productos
        </NavLink>

        <NavLink to="/categorias" className="sidebar-link">
          Categorías
        </NavLink>

        <NavLink to="/clientes" className="sidebar-link">
          Clientes
        </NavLink>

        <NavLink to="/ventas" className="sidebar-link">
          Ventas
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;