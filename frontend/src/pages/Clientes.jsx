import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosConfig';

import {
  puedeGestionarClientes,
  puedeVerReportesGerenciales
} from '../utils/permisos';

/*
  Página para administrar clientes.
  Administrador y Vendedor pueden crear, editar, activar e inactivar clientes.
  Gerencia solo puede consultar el listado y resumen gerencial.
*/
const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const puedeGestionar = puedeGestionarClientes(usuarioActual);
  const puedeVerResumenGerencial = puedeVerReportesGerenciales(usuarioActual);

  const [formulario, setFormulario] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    direccion: '',
    estado: 'Activo'
  });

  const obtenerClientes = async () => {
    try {
      const respuesta = await api.get('/clientes');
      setClientes(respuesta.data);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      setMensaje('Error al cargar los clientes');
    }
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const limpiarFormulario = () => {
    setFormulario({
      nombre: '',
      telefono: '',
      correo: '',
      direccion: '',
      estado: 'Activo'
    });

    setClienteEditando(null);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('Todos');
  };

  const obtenerClaseEstado = (estado) => {
    if (estado === 'Activo') return 'badge bg-success';
    return 'badge bg-secondary';
  };

  const clientesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return clientes.filter((cliente) => {
      const estadoCliente = cliente.estado || 'Activo';

      const coincideBusqueda =
        !texto ||
        cliente.nombre?.toLowerCase().includes(texto) ||
        cliente.telefono?.toLowerCase().includes(texto) ||
        cliente.correo?.toLowerCase().includes(texto) ||
        cliente.direccion?.toLowerCase().includes(texto) ||
        estadoCliente.toLowerCase().includes(texto);

      const coincideEstado =
        filtroEstado === 'Todos' || estadoCliente === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [clientes, busqueda, filtroEstado]);

  const resumenClientes = useMemo(() => {
    const total = clientes.length;
    const activos = clientes.filter((cliente) => (cliente.estado || 'Activo') === 'Activo').length;
    const inactivos = clientes.filter((cliente) => cliente.estado === 'Inactivo').length;
    const conCorreo = clientes.filter((cliente) => cliente.correo && cliente.correo.trim() !== '').length;
    const conTelefono = clientes.filter((cliente) => cliente.telefono && cliente.telefono.trim() !== '').length;

    return {
      total,
      activos,
      inactivos,
      conCorreo,
      conTelefono
    };
  }, [clientes]);

  const guardarCliente = async (e) => {
    e.preventDefault();

    if (!puedeGestionar) {
      setMensaje('No tienes permisos para gestionar clientes');
      return;
    }

    if (!formulario.nombre.trim()) {
      setMensaje('El nombre del cliente es obligatorio');
      return;
    }

    try {
      if (clienteEditando) {
        await api.put(`/clientes/${clienteEditando}`, formulario);
        setMensaje('Cliente actualizado correctamente');
      } else {
        await api.post('/clientes', formulario);
        setMensaje('Cliente creado correctamente');
      }

      limpiarFormulario();
      obtenerClientes();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      setMensaje('Error al guardar el cliente');
    }
  };

  const cargarClienteParaEditar = (cliente) => {
    if (!puedeGestionar) {
      setMensaje('No tienes permisos para editar clientes');
      return;
    }

    setClienteEditando(cliente.id_cliente);

    setFormulario({
      nombre: cliente.nombre || '',
      telefono: cliente.telefono || '',
      correo: cliente.correo || '',
      direccion: cliente.direccion || '',
      estado: cliente.estado || 'Activo'
    });
  };

  const inactivarCliente = async (cliente) => {
    if (!puedeGestionar) {
      setMensaje('No tienes permisos para inactivar clientes');
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas inactivar al cliente "${cliente.nombre}"?`
    );

    if (!confirmar) return;

    try {
      await api.put(`/clientes/${cliente.id_cliente}/inactivar`);
      setMensaje('Cliente inactivado correctamente');
      obtenerClientes();
    } catch (error) {
      console.error('Error al inactivar cliente:', error);
      setMensaje('Error al inactivar el cliente');
    }
  };

  const activarCliente = async (cliente) => {
    if (!puedeGestionar) {
      setMensaje('No tienes permisos para activar clientes');
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas activar al cliente "${cliente.nombre}"?`
    );

    if (!confirmar) return;

    try {
      await api.put(`/clientes/${cliente.id_cliente}/activar`);
      setMensaje('Cliente activado correctamente');
      obtenerClientes();
    } catch (error) {
      console.error('Error al activar cliente:', error);
      setMensaje('Error al activar el cliente');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h2 className="page-title">Clientes</h2>
            <p className="page-subtitle">
              Gestión de clientes registrados para ventas, seguimiento y consultas comerciales.
            </p>
          </div>

          <div className="text-end">
            <span className="badge bg-light text-dark">
              {clientesFiltrados.length} de {clientes.length} clientes
            </span>
          </div>
        </div>
      </div>

      {mensaje && (
        <div className="alert alert-info py-2">
          {mensaje}
        </div>
      )}

      {!puedeGestionar && (
        <div className="alert alert-light border py-2">
          Estás consultando el módulo en modo lectura. Solo administración y ventas
          pueden crear o editar clientes.
        </div>
      )}

      {puedeVerResumenGerencial && (
        <div className="dashboard-kpi-grid mb-4">
          <div className="stat-card stat-card-info">
            <div className="stat-card-top">
              <span className="stat-card-label">Total clientes</span>
              <span className="stat-card-accent"></span>
            </div>
            <div className="stat-card-value">{resumenClientes.total}</div>
            <p className="stat-card-description">Clientes registrados en el ERP</p>
          </div>

          <div className="stat-card stat-card-success">
            <div className="stat-card-top">
              <span className="stat-card-label">Activos</span>
              <span className="stat-card-accent"></span>
            </div>
            <div className="stat-card-value">{resumenClientes.activos}</div>
            <p className="stat-card-description">Clientes disponibles para ventas</p>
          </div>

          <div className="stat-card stat-card-secondary">
            <div className="stat-card-top">
              <span className="stat-card-label">Inactivos</span>
              <span className="stat-card-accent"></span>
            </div>
            <div className="stat-card-value">{resumenClientes.inactivos}</div>
            <p className="stat-card-description">Clientes conservados por historial</p>
          </div>

          <div className="stat-card stat-card-primary">
            <div className="stat-card-top">
              <span className="stat-card-label">Con contacto</span>
              <span className="stat-card-accent"></span>
            </div>
            <div className="stat-card-value">{resumenClientes.conTelefono}</div>
            <p className="stat-card-description">Clientes con teléfono registrado</p>
          </div>
        </div>
      )}

      <div className="row g-4">
        {puedeGestionar && (
          <div className="col-xl-3 col-lg-4">
            <div className="card shadow-sm border-0 form-card">
              <div className="card-body">
                <div className="mb-3">
                  <h5 className="fw-bold mb-1">
                    {clienteEditando ? 'Editar cliente' : 'Nuevo cliente'}
                  </h5>
                  <p className="text-muted small mb-0">
                    Registra los datos básicos del cliente para el proceso de ventas.
                  </p>
                </div>

                <form onSubmit={guardarCliente}>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      className="form-control"
                      value={formulario.nombre}
                      onChange={manejarCambio}
                      placeholder="Ej. María López"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="text"
                      name="telefono"
                      className="form-control"
                      value={formulario.telefono}
                      onChange={manejarCambio}
                      placeholder="Ej. 5555-1111"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Correo</label>
                    <input
                      type="email"
                      name="correo"
                      className="form-control"
                      value={formulario.correo}
                      onChange={manejarCambio}
                      placeholder="Ej. cliente@email.com"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Dirección</label>
                    <textarea
                      name="direccion"
                      className="form-control"
                      rows="3"
                      value={formulario.direccion}
                      onChange={manejarCambio}
                      placeholder="Dirección del cliente"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Estado</label>
                    <select
                      name="estado"
                      className="form-select"
                      value={formulario.estado}
                      onChange={manejarCambio}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      {clienteEditando ? 'Actualizar' : 'Guardar'}
                    </button>

                    {clienteEditando && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={limpiarFormulario}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className={puedeGestionar ? 'col-xl-9 col-lg-8' : 'col-12'}>
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1">Listado de clientes</h5>
                  <p className="text-muted small mb-0">
                    Consulta clientes por nombre, teléfono, correo, dirección o estado.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm"
                  onClick={limpiarFiltros}
                >
                  Limpiar filtros
                </button>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-xl-8 col-lg-12">
                  <label className="form-label">Buscar cliente</label>
                  <input
                    type="text"
                    className="form-control"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre, teléfono, correo, dirección o estado"
                  />
                </div>

                <div className="col-xl-4 col-md-6">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="Todos">Todos</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle clientes-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Teléfono</th>
                      <th>Correo</th>
                      <th>Dirección</th>
                      <th>Estado</th>
                      {puedeGestionar && (
                        <th className="text-end acciones-tabla">Acciones</th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {clientesFiltrados.map((cliente) => (
                      <tr key={cliente.id_cliente}>
                        <td>{cliente.id_cliente}</td>

                        <td>
                          <div className="fw-semibold">{cliente.nombre}</div>
                          <small className="text-muted">
                            Cliente registrado
                          </small>
                        </td>

                        <td>{cliente.telefono || 'Sin teléfono'}</td>

                        <td>{cliente.correo || 'Sin correo'}</td>

                        <td>{cliente.direccion || 'Sin dirección'}</td>

                        <td>
                          <span className={obtenerClaseEstado(cliente.estado || 'Activo')}>
                            {cliente.estado || 'Activo'}
                          </span>
                        </td>

                        {puedeGestionar && (
                          <td className="text-end acciones-tabla">
                            <button
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => cargarClienteParaEditar(cliente)}
                            >
                              Editar
                            </button>

                            {(cliente.estado || 'Activo') === 'Activo' && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => inactivarCliente(cliente)}
                              >
                                Inactivar
                              </button>
                            )}

                            {cliente.estado === 'Inactivo' && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => activarCliente(cliente)}
                              >
                                Activar
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}

                    {clientesFiltrados.length === 0 && (
                      <tr>
                        <td
                          colSpan={puedeGestionar ? 7 : 6}
                          className="text-muted"
                        >
                          No se encontraron clientes con los filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clientes;