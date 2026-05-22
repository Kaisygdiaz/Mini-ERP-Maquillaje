import { useEffect, useState } from 'react';
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

  return (
    <div>
      <div className="mb-4">
        <h2 className="page-title">Inventario</h2>
        <p className="page-subtitle">
          Consulta de existencias, valor de inventario y trazabilidad de movimientos.
        </p>
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

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Valor inventario compra</p>
              <h3 className="fw-bold mb-1">{formatoMoneda(totalValorCompra)}</h3>
              <small className="text-muted">Costo estimado del inventario actual</small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Valor inventario venta</p>
              <h3 className="fw-bold mb-1">{formatoMoneda(totalValorVenta)}</h3>
              <small className="text-muted">Valor potencial de venta</small>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <p className="text-muted mb-1">Productos con bajo stock</p>
              <h3 className="fw-bold mb-1">{productosStockBajo}</h3>
              <small className="text-muted">Productos que requieren revisión</small>
            </div>
          </div>
        </div>
      </div>

      {puedeGestionar && (
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Registrar entrada de inventario</h5>

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
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Registrar ajuste de inventario</h5>

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
          <h5 className="fw-bold mb-3">Inventario actual</h5>

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
                {inventario.map((producto) => (
                  <tr key={producto.id_producto}>
                    <td>
                      <div className="fw-semibold">{producto.nombre}</div>
                      <small className="text-muted">{producto.marca || 'Sin marca'}</small>
                    </td>
                    <td>{producto.categoria}</td>
                    <td>{formatoMoneda(producto.precio_compra)}</td>
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
                    <td>{producto.stock_minimo}</td>
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
                    <td>{formatoMoneda(producto.valor_compra)}</td>
                    <td>{formatoMoneda(producto.valor_venta)}</td>
                  </tr>
                ))}

                {inventario.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-muted">
                      No hay productos en inventario.
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
          <h5 className="fw-bold mb-3">Movimientos de inventario</h5>

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
                {movimientos.map((movimiento) => (
                  <tr key={movimiento.id_movimiento}>
                    <td>{movimiento.id_movimiento}</td>
                    <td>{formatoFecha(movimiento.fecha_movimiento)}</td>
                    <td>{movimiento.producto}</td>
                    <td>{movimiento.categoria}</td>
                    <td>
                      <span
                        className={
                          movimiento.tipo_movimiento === 'Entrada'
                            ? 'badge bg-success'
                            : movimiento.tipo_movimiento === 'Salida'
                              ? 'badge bg-danger'
                              : 'badge bg-warning text-dark'
                        }
                      >
                        {movimiento.tipo_movimiento}
                      </span>
                    </td>
                    <td>{movimiento.cantidad}</td>
                    <td>{movimiento.usuario || 'Sin usuario'}</td>
                    <td>{movimiento.descripcion || 'Sin descripción'}</td>
                  </tr>
                ))}

                {movimientos.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-muted">
                      No hay movimientos registrados.
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