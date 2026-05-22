import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { puedeGestionarProductos } from '../utils/permisos';

/*
  Página para administrar productos.
  El administrador puede crear, editar, activar e inactivar productos.
  Vendedor y Gerencia solo pueden consultar el listado de productos.
*/
const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productoEditando, setProductoEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const puedeGestionar = puedeGestionarProductos(usuarioActual);

  const [formulario, setFormulario] = useState({
    id_categoria: '',
    nombre: '',
    marca: '',
    descripcion: '',
    precio_compra: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: '',
    fecha_ingreso: '',
    estado: 'Activo'
  });

  const obtenerProductos = async () => {
    try {
      const respuesta = await api.get('/productos');
      setProductos(respuesta.data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setMensaje('Error al cargar los productos');
    }
  };

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
    obtenerProductos();
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
      id_categoria: '',
      nombre: '',
      marca: '',
      descripcion: '',
      precio_compra: '',
      precio_venta: '',
      stock_actual: '',
      stock_minimo: '',
      fecha_ingreso: '',
      estado: 'Activo'
    });

    setProductoEditando(null);
  };

  const formatoMoneda = (valor) => {
    const numero = Number(valor || 0);

    return numero.toLocaleString('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    });
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    if (!puedeGestionar) {
      setMensaje('No tienes permisos para gestionar productos');
      return;
    }

    if (
      !formulario.id_categoria ||
      !formulario.nombre.trim() ||
      !formulario.precio_compra ||
      !formulario.precio_venta
    ) {
      setMensaje('Categoría, nombre, precio de compra y precio de venta son obligatorios');
      return;
    }

    const datosProducto = {
      ...formulario,
      id_categoria: Number(formulario.id_categoria),
      precio_compra: Number(formulario.precio_compra),
      precio_venta: Number(formulario.precio_venta),
      stock_actual: Number(formulario.stock_actual || 0),
      stock_minimo: Number(formulario.stock_minimo || 5),
      fecha_ingreso: formulario.fecha_ingreso || null
    };

    try {
      if (productoEditando) {
        await api.put(`/productos/${productoEditando}`, datosProducto);
        setMensaje('Producto actualizado correctamente');
      } else {
        await api.post('/productos', datosProducto);
        setMensaje('Producto creado correctamente');
      }

      limpiarFormulario();
      obtenerProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      setMensaje('Error al guardar el producto');
    }
  };

  const cargarProductoParaEditar = (producto) => {
    if (!puedeGestionar) {
      setMensaje('No tienes permisos para editar productos');
      return;
    }

    setProductoEditando(producto.id_producto);

    setFormulario({
      id_categoria: producto.id_categoria || '',
      nombre: producto.nombre || '',
      marca: producto.marca || '',
      descripcion: producto.descripcion || '',
      precio_compra: producto.precio_compra || '',
      precio_venta: producto.precio_venta || '',
      stock_actual: producto.stock_actual || '',
      stock_minimo: producto.stock_minimo || '',
      fecha_ingreso: producto.fecha_ingreso
        ? producto.fecha_ingreso.substring(0, 10)
        : '',
      estado: producto.estado || 'Activo'
    });
  };

  const inactivarProducto = async (producto) => {
    if (!puedeGestionar) {
      setMensaje('No tienes permisos para inactivar productos');
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas inactivar el producto "${producto.nombre}"?`
    );

    if (!confirmar) return;

    try {
      await api.put(`/productos/${producto.id_producto}/inactivar`);
      setMensaje('Producto inactivado correctamente');
      obtenerProductos();
    } catch (error) {
      console.error('Error al inactivar producto:', error);
      setMensaje('Error al inactivar el producto');
    }
  };

  const activarProducto = async (producto) => {
    if (!puedeGestionar) {
      setMensaje('No tienes permisos para activar productos');
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas activar el producto "${producto.nombre}"?`
    );

    if (!confirmar) return;

    try {
      await api.put(`/productos/${producto.id_producto}/activar`);
      setMensaje('Producto activado correctamente');
      obtenerProductos();
    } catch (error) {
      console.error('Error al activar producto:', error);
      setMensaje('Error al activar el producto');
    }
  };

  const marcarAgotado = async (producto) => {
    if (!puedeGestionar) {
      setMensaje('No tienes permisos para cambiar el estado del producto');
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas marcar como agotado el producto "${producto.nombre}"?`
    );

    if (!confirmar) return;

    try {
      await api.put(`/productos/${producto.id_producto}/agotado`);
      setMensaje('Producto marcado como agotado correctamente');
      obtenerProductos();
    } catch (error) {
      console.error('Error al marcar producto como agotado:', error);
      setMensaje('Error al marcar el producto como agotado');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="page-title">Productos</h2>
        <p className="page-subtitle">
          Administración de productos de maquillaje, skincare y cuidado personal.
        </p>
      </div>

      {mensaje && (
        <div className="alert alert-info py-2">
          {mensaje}
        </div>
      )}

      {!puedeGestionar && (
        <div className="alert alert-light border py-2">
          Estás consultando el módulo en modo lectura. Solo el administrador puede crear,
          editar, activar o inactivar productos.
        </div>
      )}

      <div className="row g-4">
        {puedeGestionar && (
          <div className="col-xl-3 col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="fw-bold mb-3">
                  {productoEditando ? 'Editar producto' : 'Nuevo producto'}
                </h5>

                <form onSubmit={guardarProducto}>
                  <div className="mb-3">
                    <label className="form-label">Categoría</label>
                    <select
                      name="id_categoria"
                      className="form-select"
                      value={formulario.id_categoria}
                      onChange={manejarCambio}
                    >
                      <option value="">Seleccionar categoría</option>
                      {categorias.map((categoria) => (
                        <option
                          key={categoria.id_categoria}
                          value={categoria.id_categoria}
                        >
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      className="form-control"
                      value={formulario.nombre}
                      onChange={manejarCambio}
                      placeholder="Ej. Base líquida tono natural"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Marca</label>
                    <input
                      type="text"
                      name="marca"
                      className="form-control"
                      value={formulario.marca}
                      onChange={manejarCambio}
                      placeholder="Ej. Maybelline"
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
                      placeholder="Descripción del producto"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Precio compra</label>
                      <input
                        type="number"
                        step="0.01"
                        name="precio_compra"
                        className="form-control"
                        value={formulario.precio_compra}
                        onChange={manejarCambio}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Precio venta</label>
                      <input
                        type="number"
                        step="0.01"
                        name="precio_venta"
                        className="form-control"
                        value={formulario.precio_venta}
                        onChange={manejarCambio}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Stock actual</label>
                      <input
                        type="number"
                        name="stock_actual"
                        className="form-control"
                        value={formulario.stock_actual}
                        onChange={manejarCambio}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Stock mínimo</label>
                      <input
                        type="number"
                        name="stock_minimo"
                        className="form-control"
                        value={formulario.stock_minimo}
                        onChange={manejarCambio}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Fecha ingreso</label>
                    <input
                      type="date"
                      name="fecha_ingreso"
                      className="form-control"
                      value={formulario.fecha_ingreso}
                      onChange={manejarCambio}
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
                      <option value="Agotado">Agotado</option>
                    </select>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      {productoEditando ? 'Actualizar' : 'Guardar'}
                    </button>

                    {productoEditando && (
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
              <h5 className="fw-bold mb-3">Listado de productos</h5>

              <div className="table-responsive">
                <table className="table table-hover align-middle productos-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Precio venta</th>
                      <th>Stock</th>
                      <th>Estado</th>
                      {puedeGestionar && (
                        <th className="text-end acciones-tabla">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((producto) => (
                      <tr key={producto.id_producto}>
                        <td>
                          <div className="fw-semibold">{producto.nombre}</div>
                          <small className="text-muted">
                            {producto.marca || 'Sin marca'}
                          </small>
                        </td>
                        <td>{producto.categoria}</td>
                        <td>{formatoMoneda(producto.precio_venta)}</td>
                        <td>
                          <span
                            className={
                              producto.stock_actual <= producto.stock_minimo
                                ? 'badge bg-danger'
                                : 'badge bg-success'
                            }
                          >
                            {producto.stock_actual}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              producto.estado === 'Activo'
                                ? 'badge bg-success'
                                : producto.estado === 'Agotado'
                                  ? 'badge bg-danger'
                                  : 'badge bg-secondary'
                            }
                          >
                            {producto.estado}
                          </span>
                        </td>

                        {puedeGestionar && (
                          <td className="text-end acciones-tabla">
                            <button
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => cargarProductoParaEditar(producto)}
                            >
                              Editar
                            </button>

                            {producto.estado === 'Activo' && (
                              <>
                                <button
                                  className="btn btn-sm btn-secondary me-2"
                                  onClick={() => marcarAgotado(producto)}
                                >
                                  Agotado
                                </button>

                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => inactivarProducto(producto)}
                                >
                                  Inactivar
                                </button>
                              </>
                            )}

                            {(producto.estado === 'Inactivo' || producto.estado === 'Agotado') && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => activarProducto(producto)}
                              >
                                Activar
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}

                    {productos.length === 0 && (
                      <tr>
                        <td
                          colSpan={puedeGestionar ? 6 : 5}
                          className="text-muted"
                        >
                          No hay productos registrados.
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

export default Productos;