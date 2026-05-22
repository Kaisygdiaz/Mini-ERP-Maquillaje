import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

/*
  Página para administrar categorías.
  Solo el administrador tiene acceso a este módulo desde el menú.
*/
const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    estado: 'Activo'
  });

  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const obtenerCategorias = async () => {
    try {
      const respuesta = await api.get('/categorias');
      setCategorias(respuesta.data);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      setMensaje('Error al cargar las categorías');
    }
  };

  useEffect(() => {
    obtenerCategorias();
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
      descripcion: '',
      estado: 'Activo'
    });

    setCategoriaEditando(null);
  };

  const guardarCategoria = async (e) => {
    e.preventDefault();

    if (!formulario.nombre.trim()) {
      setMensaje('El nombre de la categoría es obligatorio');
      return;
    }

    try {
      if (categoriaEditando) {
        await api.put(`/categorias/${categoriaEditando}`, formulario);
        setMensaje('Categoría actualizada correctamente');
      } else {
        await api.post('/categorias', formulario);
        setMensaje('Categoría creada correctamente');
      }

      limpiarFormulario();
      obtenerCategorias();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      setMensaje('Error al guardar la categoría');
    }
  };

  const cargarCategoriaParaEditar = (categoria) => {
    setCategoriaEditando(categoria.id_categoria);

    setFormulario({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      estado: categoria.estado || 'Activo'
    });
  };

  const inactivarCategoria = async (categoria) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas inactivar la categoría "${categoria.nombre}"?`
    );

    if (!confirmar) return;

    try {
      await api.put(`/categorias/${categoria.id_categoria}/inactivar`);
      setMensaje('Categoría inactivada correctamente');
      obtenerCategorias();
    } catch (error) {
      console.error('Error al inactivar categoría:', error);
      setMensaje('Error al inactivar la categoría');
    }
  };

  const activarCategoria = async (categoria) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas activar la categoría "${categoria.nombre}"?`
    );

    if (!confirmar) return;

    try {
      await api.put(`/categorias/${categoria.id_categoria}/activar`);
      setMensaje('Categoría activada correctamente');
      obtenerCategorias();
    } catch (error) {
      console.error('Error al activar categoría:', error);
      setMensaje('Error al activar la categoría');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="page-title">Categorías</h2>
        <p className="page-subtitle">
          Administración de categorías para productos de maquillaje, skincare y cuidado personal.
        </p>
      </div>

      {mensaje && (
        <div className="alert alert-info py-2">
          {mensaje}
        </div>
      )}

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                {categoriaEditando ? 'Editar categoría' : 'Nueva categoría'}
              </h5>

              <form onSubmit={guardarCategoria}>
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    value={formulario.nombre}
                    onChange={manejarCambio}
                    placeholder="Ej. Skincare"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Descripción</label>
                  <textarea
                    name="descripcion"
                    className="form-control"
                    rows="3"
                    value={formulario.descripcion}
                    onChange={manejarCambio}
                    placeholder="Descripción de la categoría"
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
                    {categoriaEditando ? 'Actualizar' : 'Guardar'}
                  </button>

                  {categoriaEditando && (
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

        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Listado de categorías</h5>

              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th className="text-end acciones-tabla">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map((categoria) => (
                      <tr key={categoria.id_categoria}>
                        <td>{categoria.id_categoria}</td>
                        <td>{categoria.nombre}</td>
                        <td>{categoria.descripcion || 'Sin descripción'}</td>
                        <td>
                          <span
                            className={
                              categoria.estado === 'Activo'
                                ? 'badge bg-success'
                                : 'badge bg-secondary'
                            }
                          >
                            {categoria.estado}
                          </span>
                        </td>
                        <td className="text-end acciones-tabla">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => cargarCategoriaParaEditar(categoria)}
                          >
                            Editar
                          </button>

                          {categoria.estado === 'Activo' && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => inactivarCategoria(categoria)}
                            >
                              Inactivar
                            </button>
                          )}

                          {categoria.estado === 'Inactivo' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => activarCategoria(categoria)}
                            >
                              Activar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {categorias.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-muted">
                          No hay categorías registradas.
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

export default Categorias;