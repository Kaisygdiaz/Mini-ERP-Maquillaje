import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosConfig';

import {
  puedeGestionarProductos,
  puedeVerReportesGerenciales
} from '../utils/permisos';

/*
  Página para administrar productos.
  El administrador puede crear, editar, activar e inactivar productos.
  Vendedor solo puede consultar y operar según permisos.
  Gerencia puede consultar listado y resumen gerencial.
*/
const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productoEditando, setProductoEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');

  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const puedeGestionar = puedeGestionarProductos(usuarioActual);
  const puedeVerResumenGerencial = puedeVerReportesGerenciales(usuarioActual);

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

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('Todos');
    setFiltroCategoria('Todas');
  };

  const formatoMoneda = (valor) => {
    const numero = Number(valor || 0);

    return numero.toLocaleString('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    });
  };

  const obtenerClaseEstado = (estado) => {
    if (estado === 'Activo') return 'badge bg-success';
    if (estado === 'Agotado') return 'badge bg-danger';
    return 'badge bg-secondary';
  };

  const obtenerClaseStock = (producto) => {
    if (Number(producto.stock_actual || 0) <= Number(producto.stock_minimo || 0)) {
      return 'badge bg-danger';
    }

    return 'badge bg-success';
  };

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return productos.filter((producto) => {
      const coincideBusqueda =
        !texto ||
        producto.nombre?.toLowerCase().includes(texto) ||
        producto.marca?.toLowerCase().includes(texto) ||
        producto.categoria?.toLowerCase().includes(texto) ||
        producto.descripcion?.toLowerCase().includes(texto);

      const coincideEstado =
        filtroEstado === 'Todos' || producto.estado === filtroEstado;

      const coincideCategoria =
        filtroCategoria === 'Todas' ||
        String(producto.id_categoria) === String(filtroCategoria) ||
        producto.categoria === filtroCategoria;

      return coincideBusqueda && coincideEstado && coincideCategoria;
    });
  }, [productos, busqueda, filtroEstado, filtroCategoria]);

  const resumenProductos = useMemo(() => {
    const total = productos.length;
    const activos = productos.filter((producto) => producto.estado === 'Activo').length;
    const agotados = productos.filter((producto) => producto.estado === 'Agotado').length;
    const inactivos = productos.filter((producto) => producto.estado === 'Inactivo').length;
    const stockBajo = productos.filter(
      (producto) =>
        Number(producto.stock_actual || 0) <= Number(producto.stock_minimo || 0)
    ).length;

    return {
      total,
      activos,
      agotados,
      inactivos,
      stockBajo
    };
  }, [productos]);

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
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h2 className="page-title">Productos</h2>
            <p className="page-subtitle">
              Control de productos, precios, stock y estado comercial del inventario.
            </p>
          </div>

          <div className="text-end">
            <span className="badge bg-light text-dark">
              {productosFiltrados.length} de {productos.length} productos
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
          Estás consultando el módulo en modo lectura. Solo el administrador puede crear,
          editar, activar o inactivar productos.
        </div>
      )}

      {puedeVerResumenGerencial && (
        <div className="dashboard-kpi-grid mb-4">
          <div className="stat-card stat-card-info">
            <div className="stat-card-top">
              <span className="stat-card-label">Total productos</span>
              <span className="stat-card-accent"></span>
            </div>
            <div className="stat-card-value">{resumenProductos.total}</div>
            <p className="stat-card-description">Productos registrados en el sistema</p>
          </div>

          <div className="stat-card stat-card-success">
            <div className="stat-card-top">
              <span className="stat-card-label">Activos</span>
              <span className="stat-card-accent"></span>
            </div>
            <div className="stat-card-value">{resumenProductos.activos}</div>
            <p className="stat-card-description">Disponibles para venta</p>
          </div>

          <div className="stat-card stat-card-danger">
            <div className="stat-card-top">
              <span className="stat-card-label">Stock bajo</span>
              <span className="stat-card-accent"></span>
            </div>
            <div className="stat-card-value">{resumenProductos.stockBajo}</div>
            <p className="stat-card-description">Requieren revisión de inventario</p>
          </div>

          <div className="stat-card stat-card-secondary">
            <div className="stat-card-top">
              <span className="stat-card-label">Agotados/Inactivos</span>
              <span className="stat-card-accent"></span>
            </div>
            <div className="stat-card-value">
              {resumenProductos.agotados + resumenProductos.inactivos}
            </div>
            <p className="stat-card-description">Fuera de venta actualmente</p>
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
                    {productoEditando ? 'Editar producto' : 'Nuevo producto'}
                  </h5>
                  <p className="text-muted small mb-0">
                    Registra la información comercial y de inventario del producto.
                  </p>
                </div>

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
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1">Listado de productos</h5>
                  <p className="text-muted small mb-0">
                    Consulta productos por categoría, estado, stock o datos comerciales.
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
                <div className="col-xl-5 col-lg-12">
                  <label className="form-label">Buscar producto</label>
                  <input
                    type="text"
                    className="form-control"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre, marca, categoría o descripción"
                  />
                </div>

                <div className="col-xl-3 col-md-6">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="Todos">Todos</option>
                    <option value="Activo">Activo</option>
                    <option value="Agotado">Agotado</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                <div className="col-xl-4 col-md-6">
                  <label className="form-label">Categoría</label>
                  <select
                    className="form-select"
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                  >
                    <option value="Todas">Todas</option>
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
              </div>

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
                    {productosFiltrados.map((producto) => (
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
                          <span className={obtenerClaseStock(producto)}>
                            {producto.stock_actual}
                          </span>

                          <small className="text-muted ms-2">
                            mín. {producto.stock_minimo}
                          </small>
                        </td>

                        <td>
                          <span className={obtenerClaseEstado(producto.estado)}>
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

                    {productosFiltrados.length === 0 && (
                      <tr>
                        <td
                          colSpan={puedeGestionar ? 6 : 5}
                          className="text-muted"
                        >
                          No se encontraron productos con los filtros aplicados.
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