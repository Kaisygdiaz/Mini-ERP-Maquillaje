import { NavLink } from 'react-router-dom';

/*
  Menú lateral principal del sistema.
  Muestra opciones según el rol del usuario autenticado.
*/
const Sidebar = ({ usuario, cerrarSesion }) => {
  const esAdministrador = usuario?.rol === 'Administrador';
  const esVendedor = usuario?.rol === 'Vendedor';
  const esGerencia = usuario?.rol === 'Gerencia';

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
        {(esAdministrador || esGerencia) && (
          <NavLink to="/" className="sidebar-link">
            Dashboard
          </NavLink>
        )}

        {(esAdministrador || esVendedor || esGerencia) && (
          <NavLink to="/productos" className="sidebar-link">
            Productos
          </NavLink>
        )}

        {esAdministrador && (
          <NavLink to="/categorias" className="sidebar-link">
            Categorías
          </NavLink>
        )}

        {(esAdministrador || esVendedor) && (
          <NavLink to="/clientes" className="sidebar-link">
            Clientes
          </NavLink>
        )}

        {(esAdministrador || esVendedor || esGerencia) && (
          <NavLink to="/ventas" className="sidebar-link">
            Ventas
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