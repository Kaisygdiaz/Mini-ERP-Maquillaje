/*
  Archivo centralizado de permisos por rol.
  Permite controlar qué acciones puede realizar cada usuario dentro del sistema.
*/

export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  VENDEDOR: 'Vendedor',
  GERENCIA: 'Gerencia'
};

export const esAdministrador = (usuario) => {
  return usuario?.rol === ROLES.ADMINISTRADOR;
};

export const esVendedor = (usuario) => {
  return usuario?.rol === ROLES.VENDEDOR;
};

export const esGerencia = (usuario) => {
  return usuario?.rol === ROLES.GERENCIA;
};

/*
  Permisos para visualización de módulos.
*/
export const puedeVerDashboard = (usuario) => {
  return esAdministrador(usuario) || esGerencia(usuario);
};

export const puedeVerProductos = (usuario) => {
  return esAdministrador(usuario) || esVendedor(usuario) || esGerencia(usuario);
};

export const puedeVerCategorias = (usuario) => {
  return esAdministrador(usuario);
};

export const puedeVerClientes = (usuario) => {
  return esAdministrador(usuario) || esVendedor(usuario) || esGerencia(usuario);
};

export const puedeVerVentas = (usuario) => {
  return esAdministrador(usuario) || esVendedor(usuario) || esGerencia(usuario);
};

/*
  Permisos operativos.
*/
export const puedeGestionarProductos = (usuario) => {
  return esAdministrador(usuario);
};

export const puedeGestionarCategorias = (usuario) => {
  return esAdministrador(usuario);
};

export const puedeGestionarClientes = (usuario) => {
  return esAdministrador(usuario) || esVendedor(usuario);
};

export const puedeRegistrarVentas = (usuario) => {
  return esAdministrador(usuario) || esVendedor(usuario);
};

export const puedeAnularVentas = (usuario) => {
  return esAdministrador(usuario);
};

export const puedeVerReportesGerenciales = (usuario) => {
  return esAdministrador(usuario) || esGerencia(usuario);
};