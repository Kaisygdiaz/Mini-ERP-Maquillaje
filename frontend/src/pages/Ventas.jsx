import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosConfig';

import {
  puedeRegistrarVentas,
  puedeAnularVentas
} from '../utils/permisos';

/*
  Página para registrar y consultar ventas.
  Administrador y Vendedor pueden registrar ventas.
  Solo Administrador puede anular ventas.
  Gerencia únicamente puede consultar historial y detalle.
*/
const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [detalleVenta, setDetalleVenta] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroMetodo, setFiltroMetodo] = useState('Todos');

  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));

  const puedeRegistrar = puedeRegistrarVentas(usuarioActual);
  const puedeAnular = puedeAnularVentas(usuarioActual);

  const [formulario, setFormulario] = useState({
    id_cliente: '',
    metodo_pago: 'Efectivo',
    id_producto: '',
    cantidad: 1
  });

  const obtenerVentas = async () => {
    try {
      const respuesta = await api.get('/ventas');
      setVentas(respuesta.data);
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      setMensaje('Error al cargar las ventas');
    }
  };

  const obtenerClientes = async () => {
    try {
      const respuesta = await api.get('/clientes');
      setClientes(respuesta.data);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      setMensaje('Error al cargar los clientes');
    }
  };

  const obtenerProductos = async () => {
    try {
      const respuesta = await api.get('/productos');

      const productosActivos = respuesta.data.filter(
        (producto) => producto.estado === 'Activo' && producto.stock_actual > 0
      );

      setProductos(productosActivos);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setMensaje('Error al cargar los productos');
    }
  };

  useEffect(() => {
    obtenerVentas();
    obtenerClientes();
    obtenerProductos();
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value
    });
  };

  const formatoMoneda = (valor) => {
    const numero = Number(valor || 0);

    return numero.toLocaleString('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    });
  };

  const obtenerClaseEstado = (estado) => {
    if (estado === 'Completada') return 'badge bg-success';
    return 'badge bg-danger';
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('Todos');
    setFiltroMetodo('Todos');
  };

  const agregarProductoDetalle = () => {
    if (!puedeRegistrar) {
      setMensaje('No tienes permisos para registrar ventas');
      return;
    }

    if (!formulario.id_producto || formulario.cantidad <= 0) {
      setMensaje('Selecciona un producto y una cantidad válida');
      return;
    }

    const producto = productos.find(
      (item) => item.id_producto === Number(formulario.id_producto)
    );

    if (!producto) {
      setMensaje('Producto no encontrado');
      return;
    }

    if (Number(formulario.cantidad) > producto.stock_actual) {
      setMensaje('La cantidad supera el stock disponible');
      return;
    }

    const productoExistente = detalleVenta.find(
      (item) => item.id_producto === producto.id_producto
    );

    if (productoExistente) {
      const nuevaCantidad =
        Number(productoExistente.cantidad) + Number(formulario.cantidad);

      if (nuevaCantidad > producto.stock_actual) {
        setMensaje('La cantidad total supera el stock disponible');
        return;
      }

      const detalleActualizado = detalleVenta.map((item) =>
        item.id_producto === producto.id_producto
          ? {
              ...item,
              cantidad: nuevaCantidad,
              subtotal: nuevaCantidad * Number(producto.precio_venta)
            }
          : item
      );

      setDetalleVenta(detalleActualizado);
    } else {
      setDetalleVenta([
        ...detalleVenta,
        {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          stock_actual: producto.stock_actual,
          precio_unitario: Number(producto.precio_venta),
          cantidad: Number(formulario.cantidad),
          subtotal: Number(producto.precio_venta) * Number(formulario.cantidad)
        }
      ]);
    }

    setFormulario({
      ...formulario,
      id_producto: '',
      cantidad: 1
    });

    setMensaje('');
  };

  const quitarProductoDetalle = (idProducto) => {
    if (!puedeRegistrar) {
      setMensaje('No tienes permisos para modificar el detalle de la venta');
      return;
    }

    const detalleFiltrado = detalleVenta.filter(
      (item) => item.id_producto !== idProducto
    );

    setDetalleVenta(detalleFiltrado);
  };

  const totalVenta = detalleVenta.reduce(
    (total, item) => total + Number(item.subtotal),
    0
  );

  const ventasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return ventas.filter((venta) => {
      const totalTexto = formatoMoneda(venta.total).toLowerCase();

      const coincideBusqueda =
        !texto ||
        String(venta.id_venta).includes(texto) ||
        venta.cliente?.toLowerCase().includes(texto) ||
        venta.usuario?.toLowerCase().includes(texto) ||
        venta.metodo_pago?.toLowerCase().includes(texto) ||
        venta.estado?.toLowerCase().includes(texto) ||
        totalTexto.includes(texto);

      const coincideEstado =
        filtroEstado === 'Todos' || venta.estado === filtroEstado;

      const coincideMetodo =
        filtroMetodo === 'Todos' || venta.metodo_pago === filtroMetodo;

      return coincideBusqueda && coincideEstado && coincideMetodo;
    });
  }, [ventas, busqueda, filtroEstado, filtroMetodo]);

  const resumenVentas = useMemo(() => {
    const totalVentas = ventas.length;

    const completadas = ventas.filter(
      (venta) => venta.estado === 'Completada'
    );

    const anuladas = ventas.filter(
      (venta) => venta.estado === 'Anulada'
    );

    const ingresosCompletados = completadas.reduce(
      (total, venta) => total + Number(venta.total || 0),
      0
    );

    const totalAnulado = anuladas.reduce(
      (total, venta) => total + Number(venta.total || 0),
      0
    );

    return {
      totalVentas,
      completadas: completadas.length,
      anuladas: anuladas.length,
      ingresosCompletados,
      totalAnulado
    };
  }, [ventas]);

  const registrarVenta = async (e) => {
    e.preventDefault();

    if (!puedeRegistrar) {
      setMensaje('No tienes permisos para registrar ventas');
      return;
    }

    if (detalleVenta.length === 0) {
      setMensaje('Debe agregar al menos un producto a la venta');
      return;
    }

    const datosVenta = {
      id_cliente: formulario.id_cliente ? Number(formulario.id_cliente) : null,
      id_usuario: usuarioActual.id_usuario,
      metodo_pago: formulario.metodo_pago,
      productos: detalleVenta.map((item) => ({
        id_producto: item.id_producto,
        cantidad: item.cantidad
      }))
    };

    try {
      await api.post('/ventas', datosVenta);

      setMensaje('Venta registrada correctamente');

      setFormulario({
        id_cliente: '',
        metodo_pago: 'Efectivo',
        id_producto: '',
        cantidad: 1
      });

      setDetalleVenta([]);
      obtenerVentas();
      obtenerProductos();
    } catch (error) {
      console.error('Error al registrar venta:', error);
      setMensaje(error.response?.data?.error || 'Error al registrar la venta');
    }
  };

  const verDetalleVenta = async (idVenta) => {
    try {
      const respuesta = await api.get(`/ventas/${idVenta}`);
      setVentaSeleccionada(respuesta.data);
    } catch (error) {
      console.error('Error al obtener detalle de venta:', error);
      setMensaje('Error al obtener el detalle de la venta');
    }
  };

  const anularVenta = async (idVenta) => {
    if (!puedeAnular) {
      setMensaje('No tienes permisos para anular ventas');
      return;
    }

    const confirmar = window.confirm('¿Seguro que deseas anular esta venta?');

    if (!confirmar) return;

    try {
      await api.put(`/ventas/${idVenta}/anular`);

      setMensaje('Venta anulada correctamente');
      setVentaSeleccionada(null);

      obtenerVentas();
      obtenerProductos();
    } catch (error) {
      console.error('Error al anular venta:', error);
      setMensaje(error.response?.data?.mensaje || 'Error al anular la venta');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h2 className="page-title">Ventas</h2>
            <p className="page-subtitle">
              Registro de ventas, control de productos vendidos y actualización automática del inventario.
            </p>
          </div>

          <div className="text-end">
            <span className="badge bg-light text-dark">
              {ventasFiltradas.length} de {ventas.length} ventas
            </span>
          </div>
        </div>
      </div>

      {mensaje && (
        <div className="alert alert-info py-2">
          {mensaje}
        </div>
      )}

      {!puedeRegistrar && (
        <div className="alert alert-light border py-2">
          Estás consultando el módulo en modo lectura. Solo administración y ventas
          pueden registrar operaciones.
        </div>
      )}

      <div className="dashboard-kpi-grid mb-4">
        <div className="stat-card stat-card-info">
          <div className="stat-card-top">
            <span className="stat-card-label">Total ventas</span>
            <span className="stat-card-accent"></span>
          </div>
          <div className="stat-card-value">{resumenVentas.totalVentas}</div>
          <p className="stat-card-description">Ventas registradas en el sistema</p>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-card-top">
            <span className="stat-card-label">Completadas</span>
            <span className="stat-card-accent"></span>
          </div>
          <div className="stat-card-value">{resumenVentas.completadas}</div>
          <p className="stat-card-description">Operaciones efectivas</p>
        </div>

        <div className="stat-card stat-card-primary">
          <div className="stat-card-top">
            <span className="stat-card-label">Ingresos</span>
            <span className="stat-card-accent"></span>
          </div>
          <div className="stat-card-value">
            {formatoMoneda(resumenVentas.ingresosCompletados)}
          </div>
          <p className="stat-card-description">Total de ventas completadas</p>
        </div>

        <div className="stat-card stat-card-danger">
          <div className="stat-card-top">
            <span className="stat-card-label">Anuladas</span>
            <span className="stat-card-accent"></span>
          </div>
          <div className="stat-card-value">{resumenVentas.anuladas}</div>
          <p className="stat-card-description">
            {formatoMoneda(resumenVentas.totalAnulado)} anulados
          </p>
        </div>
      </div>

      <div className="row g-4">
        {puedeRegistrar && (
          <div className="col-xl-4 col-lg-5">
            <div className="card shadow-sm border-0 mb-4 form-card">
              <div className="card-body">
                <div className="mb-3">
                  <h5 className="fw-bold mb-1">Nueva venta</h5>
                  <p className="text-muted small mb-0">
                    Selecciona cliente, método de pago y productos a vender.
                  </p>
                </div>

                <form onSubmit={registrarVenta}>
                  <div className="mb-3">
                    <label className="form-label">Cliente</label>
                    <select
                      name="id_cliente"
                      className="form-select"
                      value={formulario.id_cliente}
                      onChange={manejarCambio}
                    >
                      <option value="">Cliente no especificado</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id_cliente} value={cliente.id_cliente}>
                          {cliente.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Método de pago</label>
                    <select
                      name="metodo_pago"
                      className="form-select"
                      value={formulario.metodo_pago}
                      onChange={manejarCambio}
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Tarjeta</option>
                      <option value="Transferencia">Transferencia</option>
                    </select>
                  </div>

                  <div className="alert alert-light border py-2">
                    <small className="text-muted">Usuario responsable:</small>
                    <div className="fw-semibold">{usuarioActual.nombre}</div>
                  </div>

                  <hr />

                  <div className="mb-3">
                    <label className="form-label">Producto</label>
                    <select
                      name="id_producto"
                      className="form-select"
                      value={formulario.id_producto}
                      onChange={manejarCambio}
                    >
                      <option value="">Seleccionar producto</option>
                      {productos.map((producto) => (
                        <option key={producto.id_producto} value={producto.id_producto}>
                          {producto.nombre} - Stock: {producto.stock_actual}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Cantidad</label>
                    <input
                      type="number"
                      name="cantidad"
                      min="1"
                      className="form-control"
                      value={formulario.cantidad}
                      onChange={manejarCambio}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary w-100 mb-3"
                    onClick={agregarProductoDetalle}
                  >
                    Agregar producto
                  </button>

                  <div className="table-responsive mb-3">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cant.</th>
                          <th>Subtotal</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalleVenta.map((item) => (
                          <tr key={item.id_producto}>
                            <td>{item.nombre}</td>
                            <td>{item.cantidad}</td>
                            <td>{formatoMoneda(item.subtotal)}</td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => quitarProductoDetalle(item.id_producto)}
                              >
                                X
                              </button>
                            </td>
                          </tr>
                        ))}

                        {detalleVenta.length === 0 && (
                          <tr>
                            <td colSpan="4" className="text-muted">
                              No hay productos agregados.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-semibold">Total</span>
                    <span className="fs-5 fw-bold">{formatoMoneda(totalVenta)}</span>
                  </div>

                  <button type="submit" className="btn btn-primary w-100">
                    Registrar venta
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className={puedeRegistrar ? 'col-xl-8 col-lg-7' : 'col-12'}>
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1">Historial de ventas</h5>
                  <p className="text-muted small mb-0">
                    Consulta ventas por cliente, usuario, estado, método de pago o total.
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
                  <label className="form-label">Buscar venta</label>
                  <input
                    type="text"
                    className="form-control"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por ID, cliente, usuario, método o estado"
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
                    <option value="Completada">Completada</option>
                    <option value="Anulada">Anulada</option>
                  </select>
                </div>

                <div className="col-xl-4 col-md-6">
                  <label className="form-label">Método de pago</label>
                  <select
                    className="form-select"
                    value={filtroMetodo}
                    onChange={(e) => setFiltroMetodo(e.target.value)}
                  >
                    <option value="Todos">Todos</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle ventas-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Usuario</th>
                      <th>Total</th>
                      <th>Método</th>
                      <th>Estado</th>
                      <th className="text-end acciones-tabla">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ventasFiltradas.map((venta) => (
                      <tr key={venta.id_venta}>
                        <td>{venta.id_venta}</td>

                        <td>
                          <div className="fw-semibold">
                            {venta.cliente || 'Sin cliente'}
                          </div>
                          <small className="text-muted">
                            Venta registrada
                          </small>
                        </td>

                        <td>{venta.usuario}</td>

                        <td>{formatoMoneda(venta.total)}</td>

                        <td>{venta.metodo_pago}</td>

                        <td>
                          <span className={obtenerClaseEstado(venta.estado)}>
                            {venta.estado}
                          </span>
                        </td>

                        <td className="text-end acciones-tabla">
                          <button
                            className="btn btn-sm btn-info me-2"
                            onClick={() => verDetalleVenta(venta.id_venta)}
                          >
                            Detalle
                          </button>

                          {puedeAnular && venta.estado === 'Completada' && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => anularVenta(venta.id_venta)}
                            >
                              Anular
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}

                    {ventasFiltradas.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-muted">
                          No se encontraron ventas con los filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>

          {ventaSeleccionada && (
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                  <div>
                    <h5 className="fw-bold mb-1">
                      Detalle de venta No. {ventaSeleccionada.venta.id_venta}
                    </h5>
                    <p className="text-muted small mb-0">
                      Productos incluidos en la operación seleccionada.
                    </p>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setVentaSeleccionada(null)}
                  >
                    Cerrar detalle
                  </button>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <div className="alert alert-light border py-2 mb-0">
                      <small className="text-muted">Cliente</small>
                      <div className="fw-semibold">
                        {ventaSeleccionada.venta.cliente || 'Sin cliente'}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="alert alert-light border py-2 mb-0">
                      <small className="text-muted">Usuario</small>
                      <div className="fw-semibold">
                        {ventaSeleccionada.venta.usuario}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="alert alert-light border py-2 mb-0">
                      <small className="text-muted">Total</small>
                      <div className="fw-semibold">
                        {formatoMoneda(ventaSeleccionada.venta.total)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio unitario</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>

                    <tbody>
                      {ventaSeleccionada.detalle.map((item) => (
                        <tr key={item.id_detalle}>
                          <td>{item.producto}</td>
                          <td>{item.cantidad}</td>
                          <td>{formatoMoneda(item.precio_unitario)}</td>
                          <td>{formatoMoneda(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ventas;