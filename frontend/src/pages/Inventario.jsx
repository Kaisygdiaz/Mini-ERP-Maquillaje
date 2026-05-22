import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosConfig';

import {
  puedeGestionarInventario
} from '../utils/permisos';

/*
  Página de inventario y movimientos.
  Permite consultar stock actual, valor de inventario y trazabilidad de movimientos.
  Solo el administrador puede registrar entradas o ajustes manuales.
*/
const Inventario = () => {
  const [inventario, setInventario] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [mensaje, setMensaje] = useState('');

  const [busquedaInventario, setBusquedaInventario] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroStock, setFiltroStock] = useState('Todos');

  const [busquedaMovimientos, setBusquedaMovimientos] = useState('');
  const [filtroMovimiento, setFiltroMovimiento] = useState('Todos');

  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
  const puedeGestionar = puedeGestionarInventario(usuarioActual);

  const [formularioEntrada, setFormularioEntrada] = useState({
    id_producto: '',
    cantidad: '',
    descripcion: ''
  });

  const [formularioAjuste, setFormularioAjuste] = useState({
    id_producto: '',
    cantidad: '',
    descripcion: ''
  });

  const obtenerInventario = async () => {
    try {
      const respuesta = await api.get('/inventario');

      const datos = respuesta.data.map((item) => ({
        ...item,
        precio_compra: Number(item.precio_compra),
        precio_venta: Number(item.precio_venta),
        stock_actual: Number(item.stock_actual),
        stock_minimo: Number(item.stock_minimo),
        valor_compra: Number(item.valor_compra),
        valor_venta: Number(item.valor_venta)
      }));

      setInventario(datos);
    } catch (error) {
      console.error('Error al obtener inventario:', error);
      setMensaje('Error al cargar el inventario');
    }
  };

  const obtenerMovimientos = async () => {
    try {
      const respuesta = await api.get('/inventario/movimientos');

      const datos = respuesta.data.map((item) => ({
        ...item,
        cantidad: Number(item.cantidad)
      }));

      setMovimientos(datos);
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      setMensaje('Error al cargar los movimientos de inventario');
    }
  };

  useEffect(() => {
    obtenerInventario();
    obtenerMovimientos();
  }, []);

  const formatoMoneda = (valor) => {
    const numero = Number(valor || 0);

    return numero.toLocaleString('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    });
  };

  const formatoFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';

    return new Date(fecha).toLocaleString('es-GT', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  const manejarCambioEntrada = (e) => {
    const { name, value } = e.target;

    setFormularioEntrada({
      ...formularioEntrada,
      [name]: value
    });
  };

  const manejarCambioAjuste = (e) => {
    const { name, value } = e.target;

    setFormularioAjuste({
      ...formularioAjuste,
      [name]: value
    });
  };

  const limpiarEntrada = () => {
    setFormularioEntrada({
      id_producto: '',
      cantidad: '',
      descripcion: ''
    });
  };

  const limpiarAjuste = () => {
    setFormularioAjuste({
      id_producto: '',
      cantidad: '',
      descripcion: ''
    });
  };

  const limpiarFiltrosInventario = () => {
    setBusquedaInventario('');
    setFiltroEstado('Todos');
    setFiltroStock('Todos');
  };

  const limpiarFiltrosMovimientos = () => {
    setBusquedaMovimientos('');
    setFiltroMovimiento('Todos');
  };

  const obtenerClaseEstado = (estado) => {
    if (estado === 'Activo') return 'badge bg-success';
    if (estado === 'Agotado') return 'badge bg-danger';
    return 'badge bg-secondary';
  };

  const obtenerClaseStock = (producto) => {
    if (producto.stock_actual <= producto.stock_minimo) {
      return 'badge bg-danger';
    }

    return 'badge bg-success';
  };

  const obtenerClaseMovimiento = (tipoMovimiento) => {
    if (tipoMovimiento === 'Entrada') return 'badge bg-success';
    if (tipoMovimiento === 'Salida') return 'badge bg-danger';
    return 'badge bg-warning text-dark';
  };

  const registrarEntrada = async (e) => {
    e.preventDefault();

    if (!puedeGestionar) {
      setMensaje('No tienes permisos para registrar entradas de inventario');
      return;
    }

    if (!formularioEntrada.id_producto || !formularioEntrada.cantidad) {
      setMensaje('Producto y cantidad son obligatorios');
      return;
    }

    if (Number(formularioEntrada.cantidad) <= 0) {
      setMensaje('La entrada debe ser mayor a cero');
      return;
    }

    try {
      await api.post('/inventario/entrada', {
        id_producto: Number(formularioEntrada.id_producto),
        cantidad: Number(formularioEntrada.cantidad),
        descripcion: formularioEntrada.descripcion || 'Entrada manual de inventario',
        id_usuario: usuarioActual.id_usuario
      });

      setMensaje('Entrada de inventario registrada correctamente');
      limpiarEntrada();
      obtenerInventario();
      obtenerMovimientos();
    } catch (error) {
      console.error('Error al registrar entrada:', error);
      setMensaje(error.response?.data?.mensaje || 'Error al registrar entrada');
    }
  };

  const registrarAjuste = async (e) => {
    e.preventDefault();

    if (!puedeGestionar) {
      setMensaje('No tienes permisos para registrar ajustes de inventario');
      return;
    }

    if (!formularioAjuste.id_producto || formularioAjuste.cantidad === '') {
      setMensaje('Producto y cantidad son obligatorios');
      return;
    }

    if (Number(formularioAjuste.cantidad) === 0) {
      setMensaje('El ajuste no puede ser cero');
      return;
    }

    try {
      await api.post('/inventario/ajuste', {
        id_producto: Number(formularioAjuste.id_producto),
        cantidad: Number(formularioAjuste.cantidad),
        descripcion: formularioAjuste.descripcion || 'Ajuste manual de inventario',
        id_usuario: usuarioActual.id_usuario
      });

      setMensaje('Ajuste de inventario registrado correctamente');
      limpiarAjuste();
      obtenerInventario();
      obtenerMovimientos();
    } catch (error) {
      console.error('Error al registrar ajuste:', error);
      setMensaje(error.response?.data?.mensaje || 'Error al registrar ajuste');
    }
  };

  const inventarioFiltrado = useMemo(() => {
    const texto = busquedaInventario.trim().toLowerCase();

    return inventario.filter((producto) => {
      const stockActual = Number(producto.stock_actual || 0);
      const stockMinimo = Number(producto.stock_minimo || 0);

      const coincideBusqueda =
        !texto ||
        producto.nombre?.toLowerCase().includes(texto) ||
        producto.marca?.toLowerCase().includes(texto) ||
        producto.categoria?.toLowerCase().includes(texto) ||
        producto.estado?.toLowerCase().includes(texto);

      const coincideEstado =
        filtroEstado === 'Todos' || producto.estado === filtroEstado;

      const coincideStock =
        filtroStock === 'Todos' ||
        (filtroStock === 'Stock bajo' && stockActual <= stockMinimo) ||
        (filtroStock === 'Disponible' && stockActual > stockMinimo) ||
        (filtroStock === 'Sin stock' && stockActual === 0);

      return coincideBusqueda && coincideEstado && coincideStock;
    });
  }, [inventario, busquedaInventario, filtroEstado, filtroStock]);

  const movimientosFiltrados = useMemo(() => {
    const texto = busquedaMovimientos.trim().toLowerCase();

    return movimientos.filter((movimiento) => {
      const fechaTexto = formatoFecha(movimiento.fecha_movimiento).toLowerCase();

      const coincideBusqueda =
        !texto ||
        String(movimiento.id_movimiento).includes(texto) ||
        movimiento.producto?.toLowerCase().includes(texto) ||
        movimiento.categoria?.toLowerCase().includes(texto) ||
        movimiento.tipo_movimiento?.toLowerCase().includes(texto) ||
        movimiento.usuario?.toLowerCase().includes(texto) ||
        movimiento.descripcion?.toLowerCase().includes(texto) ||
        fechaTexto.includes(texto);

      const coincideTipo =
        filtroMovimiento === 'Todos' ||
        movimiento.tipo_movimiento === filtroMovimiento;

      return coincideBusqueda && coincideTipo;
    });
  }, [movimientos, busquedaMovimientos, filtroMovimiento]);

  const resumenInventario = useMemo(() => {
    const totalProductos = inventario.length;

    const totalValorCompra = inventario.reduce(
      (total, item) => total + Number(item.valor_compra || 0),
      0
    );

    const totalValorVenta = inventario.reduce(
      (total, item) => total + Number(item.valor_venta || 0),
      0
    );

    const productosStockBajo = inventario.filter(
      (item) => item.stock_actual <= item.stock_minimo && item.estado === 'Activo'
    ).length;

    const productosDisponibles = inventario.filter(
      (item) => item.stock_actual > item.stock_minimo && item.estado === 'Activo'
    ).length;

    return {
      totalProductos,
      totalValorCompra,
      totalValorVenta,
      productosStockBajo,
      productosDisponibles
    };
  }, [inventario]);

  return (
    <div>
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h2 className="page-title">Inventario</h2>
            <p className="page-subtitle">
              Control de existencias, valor del inventario y trazabilidad de movimientos.
            </p>
          </div>

          <div className="text-end">
            <span className="badge bg-light text-dark">
              {inventarioFiltrado.length} de {inventario.length} productos
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
          Estás consultando inventario en modo lectura. Solo administración puede registrar entradas o ajustes.
        </div>
      )}

      <div className="dashboard-kpi-grid mb-4">
        <div className="stat-card stat-card-primary">
          <div className="stat-card-top">
            <span className="stat-card-label">Valor inventario compra</span>
            <span className="stat-card-accent"></span>
          </div>
          <div className="stat-card-value">
            {formatoMoneda(resumenInventario.totalValorCompra)}
          </div>
          <p className="stat-card-description">Costo estimado del stock actual</p>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-card-top">
            <span className="stat-card-label">Valor inventario venta</span>
            <span className="stat-card-accent"></span>
          </div>
          <div className="stat-card-value">
            {formatoMoneda(resumenInventario.totalValorVenta)}
          </div>
          <p className="stat-card-description">Valor potencial de venta</p>
        </div>

        <div className="stat-card stat-card-danger">
          <div className="stat-card-top">
            <span className="stat-card-label">Stock bajo</span>
            <span className="stat-card-accent"></span>
          </div>
          <div className="stat-card-value">{resumenInventario.productosStockBajo}</div>
          <p className="stat-card-description">Productos que requieren revisión</p>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-card-top">
            <span className="stat-card-label">Disponibles</span>
            <span className="stat-card-accent"></span>
          </div>
          <div className="stat-card-value">{resumenInventario.productosDisponibles}</div>
          <p className="stat-card-description">Productos con stock saludable</p>
        </div>
      </div>

      {puedeGestionar && (
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 form-card">
              <div className="card-body">
                <div className="mb-3">
                  <h5 className="fw-bold mb-1">Registrar entrada de inventario</h5>
                  <p className="text-muted small mb-0">
                    Suma unidades al stock por compras o reposición.
                  </p>
                </div>

                <form onSubmit={registrarEntrada}>
                  <div className="mb-3">
                    <label className="form-label">Producto</label>
                    <select
                      name="id_producto"
                      className="form-select"
                      value={formularioEntrada.id_producto}
                      onChange={manejarCambioEntrada}
                    >
                      <option value="">Seleccionar producto</option>
                      {inventario.map((producto) => (
                        <option key={producto.id_producto} value={producto.id_producto}>
                          {producto.nombre} - Stock: {producto.stock_actual}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Cantidad a ingresar</label>
                    <input
                      type="number"
                      name="cantidad"
                      min="1"
                      className="form-control"
                      value={formularioEntrada.cantidad}
                      onChange={manejarCambioEntrada}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      name="descripcion"
                      className="form-control"
                      rows="2"
                      value={formularioEntrada.descripcion}
                      onChange={manejarCambioEntrada}
                      placeholder="Ej. Compra de reposición de inventario"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Registrar entrada
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card shadow-sm border-0 form-card">
              <div className="card-body">
                <div className="mb-3">
                  <h5 className="fw-bold mb-1">Registrar ajuste de inventario</h5>
                  <p className="text-muted small mb-0">
                    Ajusta diferencias por conteo físico, pérdida o corrección.
                  </p>
                </div>

                <form onSubmit={registrarAjuste}>
                  <div className="mb-3">
                    <label className="form-label">Producto</label>
                    <select
                      name="id_producto"
                      className="form-select"
                      value={formularioAjuste.id_producto}
                      onChange={manejarCambioAjuste}
                    >
                      <option value="">Seleccionar producto</option>
                      {inventario.map((producto) => (
                        <option key={producto.id_producto} value={producto.id_producto}>
                          {producto.nombre} - Stock: {producto.stock_actual}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Cantidad de ajuste</label>
                    <input
                      type="number"
                      name="cantidad"
                      className="form-control"
                      value={formularioAjuste.cantidad}
                      onChange={manejarCambioAjuste}
                      placeholder="Ej. 3 o -2"
                    />
                    <small className="text-muted">
                      Usa positivo para sumar stock y negativo para restar.
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      name="descripcion"
                      className="form-control"
                      rows="2"
                      value={formularioAjuste.descripcion}
                      onChange={manejarCambioAjuste}
                      placeholder="Ej. Ajuste por diferencia física"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Registrar ajuste
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
            <div>
              <h5 className="fw-bold mb-1">Inventario actual</h5>
              <p className="text-muted small mb-0">
                Consulta productos por disponibilidad, estado, categoría o valor comercial.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-dark btn-sm"
              onClick={limpiarFiltrosInventario}
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
                value={busquedaInventario}
                onChange={(e) => setBusquedaInventario(e.target.value)}
                placeholder="Buscar por producto, marca, categoría o estado"
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
              <label className="form-label">Condición de stock</label>
              <select
                className="form-select"
                value={filtroStock}
                onChange={(e) => setFiltroStock(e.target.value)}
              >
                <option value="Todos">Todos</option>
                <option value="Disponible">Disponible</option>
                <option value="Stock bajo">Stock bajo</option>
                <option value="Sin stock">Sin stock</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle productos-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio compra</th>
                  <th>Precio venta</th>
                  <th>Stock</th>
                  <th>Mínimo</th>
                  <th>Estado</th>
                  <th>Valor compra</th>
                  <th>Valor venta</th>
                </tr>
              </thead>

              <tbody>
                {inventarioFiltrado.map((producto) => (
                  <tr key={producto.id_producto}>
                    <td>
                      <div className="fw-semibold">{producto.nombre}</div>
                      <small className="text-muted">{producto.marca || 'Sin marca'}</small>
                    </td>

                    <td>{producto.categoria}</td>

                    <td>{formatoMoneda(producto.precio_compra)}</td>

                    <td>{formatoMoneda(producto.precio_venta)}</td>

                    <td>
                      <span className={obtenerClaseStock(producto)}>
                        {producto.stock_actual}
                      </span>
                    </td>

                    <td>{producto.stock_minimo}</td>

                    <td>
                      <span className={obtenerClaseEstado(producto.estado)}>
                        {producto.estado}
                      </span>
                    </td>

                    <td>{formatoMoneda(producto.valor_compra)}</td>

                    <td>{formatoMoneda(producto.valor_venta)}</td>
                  </tr>
                ))}

                {inventarioFiltrado.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-muted">
                      No se encontraron productos con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
            <div>
              <h5 className="fw-bold mb-1">Movimientos de inventario</h5>
              <p className="text-muted small mb-0">
                Trazabilidad de entradas, salidas y ajustes registrados.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-dark btn-sm"
              onClick={limpiarFiltrosMovimientos}
            >
              Limpiar filtros
            </button>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-xl-8 col-lg-12">
              <label className="form-label">Buscar movimiento</label>
              <input
                type="text"
                className="form-control"
                value={busquedaMovimientos}
                onChange={(e) => setBusquedaMovimientos(e.target.value)}
                placeholder="Buscar por producto, tipo, usuario, fecha o descripción"
              />
            </div>

            <div className="col-xl-4 col-md-6">
              <label className="form-label">Tipo de movimiento</label>
              <select
                className="form-select"
                value={filtroMovimiento}
                onChange={(e) => setFiltroMovimiento(e.target.value)}
              >
                <option value="Todos">Todos</option>
                <option value="Entrada">Entrada</option>
                <option value="Salida">Salida</option>
                <option value="Ajuste">Ajuste</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Usuario</th>
                  <th>Descripción</th>
                </tr>
              </thead>

              <tbody>
                {movimientosFiltrados.map((movimiento) => (
                  <tr key={movimiento.id_movimiento}>
                    <td>{movimiento.id_movimiento}</td>

                    <td>{formatoFecha(movimiento.fecha_movimiento)}</td>

                    <td>{movimiento.producto}</td>

                    <td>{movimiento.categoria}</td>

                    <td>
                      <span className={obtenerClaseMovimiento(movimiento.tipo_movimiento)}>
                        {movimiento.tipo_movimiento}
                      </span>
                    </td>

                    <td>{movimiento.cantidad}</td>

                    <td>{movimiento.usuario || 'Sin usuario'}</td>

                    <td>{movimiento.descripcion || 'Sin descripción'}</td>
                  </tr>
                ))}

                {movimientosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-muted">
                      No se encontraron movimientos con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Inventario;