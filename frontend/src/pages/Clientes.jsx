import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

/*
  Página para administrar clientes.
  Permite listar, crear, editar y eliminar clientes desde el frontend.
*/
const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const [formulario, setFormulario] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    direccion: ''
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
      direccion: ''
    });

    setClienteEditando(null);
  };

  const guardarCliente = async (e) => {
    e.preventDefault();

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
    setClienteEditando(cliente.id_cliente);

    setFormulario({
      nombre: cliente.nombre || '',
      telefono: cliente.telefono || '',
      correo: cliente.correo || '',
      direccion: cliente.direccion || ''
    });
  };

  const eliminarCliente = async (id) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este cliente?');

    if (!confirmar) return;

    try {
      await api.delete(`/clientes/${id}`);
      setMensaje('Cliente eliminado correctamente');
      obtenerClientes();
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      setMensaje('No se pudo eliminar el cliente. Puede estar relacionado con ventas.');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="page-title">Clientes</h2>
        <p className="page-subtitle">
          Administración de clientes registrados para el proceso de ventas.
        </p>
      </div>

      {mensaje && (
        <div className="alert alert-info py-2">
          {mensaje}
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                {clienteEditando ? 'Editar cliente' : 'Nuevo cliente'}
              </h5>

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

        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Listado de clientes</h5>

              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Teléfono</th>
                      <th>Correo</th>
                      <th>Dirección</th>
                      <th className="text-end acciones-tabla">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((cliente) => (
                      <tr key={cliente.id_cliente}>
                        <td>{cliente.id_cliente}</td>
                        <td className="fw-semibold">{cliente.nombre}</td>
                        <td>{cliente.telefono || 'Sin teléfono'}</td>
                        <td>{cliente.correo || 'Sin correo'}</td>
                        <td>{cliente.direccion || 'Sin dirección'}</td>
                        <td className="text-end acciones-tabla">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => cargarClienteParaEditar(cliente)}
                          >
                            Editar
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => eliminarCliente(cliente.id_cliente)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}

                    {clientes.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-muted">
                          No hay clientes registrados.
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