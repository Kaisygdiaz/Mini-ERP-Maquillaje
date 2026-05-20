import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

/*
  Página para registrar y consultar ventas.
  Permite seleccionar cliente, productos, cantidades, método de pago,
  calcular el total y registrar la venta en el backend.
*/
const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [detalleVenta, setDetalleVenta] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const [formulario, setFormulario] = useState({
    id_cliente: '',
    metodo_pago: 'Efectivo',
    id_producto: '',
    cantidad: 1
  });

  /*
    Usuario temporal.
    Más adelante este dato vendrá del login y se guardará en localStorage.
  */
  const usuarioActual = JSON.parse(localStorage.getItem('usuario')) || {
    id_usuario: 1,
    nombre: 'Administrador Principal',
    rol: 'Administrador'
  };

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

  const agregarProductoDetalle = () => {
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
    const detalleFiltrado = detalleVenta.filter(
      (item) => item.id_producto !== idProducto
    );

    setDetalleVenta(detalleFiltrado);
  };

  const totalVenta = detalleVenta.reduce(
    (total, item) => total + Number(item.subtotal),
    0
  );

  const registrarVenta = async (e) => {
    e.preventDefault();

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
        <h2 className="page-title">Ventas</h2>
        <p className="page-subtitle">
          Registro de ventas, control de productos vendidos y actualización automática del inventario.
        </p>
      </div>

      {mensaje && (
        <div className="alert alert-info py-2">
          {mensaje}
        </div>
      )}

      <div className="row g-4">
        <div className="col-xl-4 col-lg-5">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Nueva venta</h5>

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

        <div className="col-xl-8 col-lg-7">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Historial de ventas</h5>

              <div className="table-responsive">
                <table className="table table-hover align-middle">
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
                    {ventas.map((venta) => (
                      <tr key={venta.id_venta}>
                        <td>{venta.id_venta}</td>
                        <td>{venta.cliente || 'Sin cliente'}</td>
                        <td>{venta.usuario}</td>
                        <td>{formatoMoneda(venta.total)}</td>
                        <td>{venta.metodo_pago}</td>
                        <td>
                          <span
                            className={
                              venta.estado === 'Completada'
                                ? 'badge bg-success'
                                : 'badge bg-danger'
                            }
                          >
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

                          {venta.estado === 'Completada' && (
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

                    {ventas.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-muted">
                          No hay ventas registradas.
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
                <h5 className="fw-bold mb-3">
                  Detalle de venta No. {ventaSeleccionada.venta.id_venta}
                </h5>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <small className="text-muted">Cliente</small>
                    <div className="fw-semibold">
                      {ventaSeleccionada.venta.cliente || 'Sin cliente'}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <small className="text-muted">Usuario</small>
                    <div className="fw-semibold">
                      {ventaSeleccionada.venta.usuario}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <small className="text-muted">Total</small>
                    <div className="fw-semibold">
                      {formatoMoneda(ventaSeleccionada.venta.total)}
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

                <button
                  className="btn btn-secondary mt-2"
                  onClick={() => setVentaSeleccionada(null)}
                >
                  Cerrar detalle
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ventas;