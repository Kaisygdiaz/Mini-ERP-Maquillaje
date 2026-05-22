import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

/*
  Página de reportes gerenciales.
  Permite consultar ventas con filtros, imprimir el reporte y exportar datos a CSV.
*/
const Reportes = () => {
  const [ventas, setVentas] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [ventasMetodoPago, setVentasMetodoPago] = useState([]);
  const [ventasClientes, setVentasClientes] = useState([]);
  const [mensaje, setMensaje] = useState('');

  const usuarioActual = JSON.parse(localStorage.getItem('usuario'));

  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    estado: '',
    metodo_pago: ''
  });

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

  const fechaGeneracion = () => {
    return new Date().toLocaleString('es-GT', {
      dateStyle: 'full',
      timeStyle: 'short'
    });
  };

  const obtenerTextoFiltros = () => {
    const filtrosAplicados = [];

    if (filtros.fecha_inicio) {
      filtrosAplicados.push(`Fecha inicio: ${filtros.fecha_inicio}`);
    }

    if (filtros.fecha_fin) {
      filtrosAplicados.push(`Fecha fin: ${filtros.fecha_fin}`);
    }

    if (filtros.estado) {
      filtrosAplicados.push(`Estado: ${filtros.estado}`);
    }

    if (filtros.metodo_pago) {
      filtrosAplicados.push(`Método de pago: ${filtros.metodo_pago}`);
    }

    return filtrosAplicados.length > 0
      ? filtrosAplicados.join(' | ')
      : 'Sin filtros aplicados';
  };

  const obtenerReporteVentas = async () => {
    try {
      const params = {};

      if (filtros.fecha_inicio) params.fecha_inicio = filtros.fecha_inicio;
      if (filtros.fecha_fin) params.fecha_fin = filtros.fecha_fin;
      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.metodo_pago) params.metodo_pago = filtros.metodo_pago;

      const respuesta = await api.get('/reportes/ventas', { params });

      setResumen({
        cantidad_ventas: Number(respuesta.data.resumen.cantidad_ventas || 0),
        total_completado: Number(respuesta.data.resumen.total_completado || 0),
        total_anulado: Number(respuesta.data.resumen.total_anulado || 0),
        total_general: Number(respuesta.data.resumen.total_general || 0)
      });

      setVentas(
        respuesta.data.ventas.map((venta) => ({
          ...venta,
          total: Number(venta.total || 0)
        }))
      );

      setMensaje('');
    } catch (error) {
      console.error('Error al obtener reporte de ventas:', error);
      setMensaje('Error al cargar el reporte de ventas');
    }
  };

  const obtenerVentasMetodoPago = async () => {
    try {
      const respuesta = await api.get('/reportes/ventas/metodo-pago');

      setVentasMetodoPago(
        respuesta.data.map((item) => ({
          ...item,
          cantidad_ventas: Number(item.cantidad_ventas || 0),
          total_vendido: Number(item.total_vendido || 0)
        }))
      );
    } catch (error) {
      console.error('Error al obtener ventas por método de pago:', error);
      setMensaje('Error al cargar ventas por método de pago');
    }
  };

  const obtenerVentasClientes = async () => {
    try {
      const respuesta = await api.get('/reportes/ventas/clientes');

      setVentasClientes(
        respuesta.data.map((item) => ({
          ...item,
          cantidad_compras: Number(item.cantidad_compras || 0),
          total_comprado: Number(item.total_comprado || 0)
        }))
      );
    } catch (error) {
      console.error('Error al obtener ventas por cliente:', error);
      setMensaje('Error al cargar ventas por cliente');
    }
  };

  useEffect(() => {
    obtenerReporteVentas();
    obtenerVentasMetodoPago();
    obtenerVentasClientes();
  }, []);

  const manejarCambioFiltro = (e) => {
    const { name, value } = e.target;

    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
    obtenerReporteVentas();
  };

  const imprimirReporte = () => {
    window.print();
  };

  const exportarCSV = () => {
    if (ventas.length === 0) {
      setMensaje('No hay ventas para exportar');
      return;
    }

    const encabezados = [
      'ID',
      'Fecha',
      'Cliente',
      'Usuario',
      'Metodo de pago',
      'Estado',
      'Total'
    ];

    const filas = ventas.map((venta) => [
      venta.id_venta,
      formatoFecha(venta.fecha_venta),
      venta.cliente || 'Sin cliente',
      venta.usuario,
      venta.metodo_pago,
      venta.estado,
      venta.total
    ]);

    const contenidoCSV = [
      encabezados.join(','),
      ...filas.map((fila) =>
        fila
          .map((valor) => `"${String(valor).replace(/"/g, '""')}"`)
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([contenidoCSV], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = 'reporte_ventas.csv';
    enlace.click();

    URL.revokeObjectURL(url);
  };

  const limpiarFiltros = () => {
    const filtrosLimpios = {
      fecha_inicio: '',
      fecha_fin: '',
      estado: '',
      metodo_pago: ''
    };

    setFiltros(filtrosLimpios);

    setTimeout(() => {
      obtenerReporteVentas();
    }, 0);
  };

  return (
    <div>
      <div className="print-header">
        <h1>Reporte de Ventas - Beauty ERP</h1>
        <p>Sistema de ventas e inventario</p>
        <p><strong>Fecha de generación:</strong> {fechaGeneracion()}</p>
        <p><strong>Usuario:</strong> {usuarioActual?.nombre || 'Usuario del sistema'}</p>
        <p><strong>Filtros aplicados:</strong> {obtenerTextoFiltros()}</p>
      </div>

      <div className="mb-4 no-print">
        <h2 className="page-title">Reportes</h2>
        <p className="page-subtitle">
          Consulta gerencial de ventas, estados, métodos de pago y clientes con mayor compra.
        </p>
      </div>

      {mensaje && (
        <div className="alert alert-info py-2 no-print">
          {mensaje}
        </div>
      )}

      <div className="card shadow-sm border-0 mb-4 no-print">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Filtros de ventas</h5>

          <form onSubmit={aplicarFiltros}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Fecha inicio</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  className="form-control"
                  value={filtros.fecha_inicio}
                  onChange={manejarCambioFiltro}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Fecha fin</label>
                <input
                  type="date"
                  name="fecha_fin"
                  className="form-control"
                  value={filtros.fecha_fin}
                  onChange={manejarCambioFiltro}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Estado</label>
                <select
                  name="estado"
                  className="form-select"
                  value={filtros.estado}
                  onChange={manejarCambioFiltro}
                >
                  <option value="">Todos</option>
                  <option value="Completada">Completada</option>
                  <option value="Anulada">Anulada</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Método de pago</label>
                <select
                  name="metodo_pago"
                  className="form-select"
                  value={filtros.metodo_pago}
                  onChange={manejarCambioFiltro}
                >
                  <option value="">Todos</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>
            </div>

            <div className="mt-3 d-flex flex-wrap gap-2">
              <button type="submit" className="btn btn-primary">
                Aplicar filtros
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={limpiarFiltros}
              >
                Limpiar
              </button>

              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={imprimirReporte}
              >
                Imprimir reporte
              </button>

              <button
                type="button"
                className="btn btn-outline-success"
                onClick={exportarCSV}
              >
                Exportar CSV
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="row g-4 mb-4 print-section">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100 report-card">
            <div className="card-body">
              <p className="text-muted mb-1">Cantidad de ventas</p>
              <h3 className="fw-bold mb-1">{resumen?.cantidad_ventas || 0}</h3>
              <small className="text-muted">Ventas según filtros</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100 report-card">
            <div className="card-body">
              <p className="text-muted mb-1">Total completado</p>
              <h3 className="fw-bold mb-1">
                {formatoMoneda(resumen?.total_completado)}
              </h3>
              <small className="text-muted">Ingresos efectivos</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100 report-card">
            <div className="card-body">
              <p className="text-muted mb-1">Total anulado</p>
              <h3 className="fw-bold mb-1">
                {formatoMoneda(resumen?.total_anulado)}
              </h3>
              <small className="text-muted">Ventas anuladas</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100 report-card">
            <div className="card-body">
              <p className="text-muted mb-1">Total general</p>
              <h3 className="fw-bold mb-1">
                {formatoMoneda(resumen?.total_general)}
              </h3>
              <small className="text-muted">Total histórico filtrado</small>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4 print-section">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Detalle de ventas</h5>

          <div className="table-responsive">
            <table className="table table-hover align-middle report-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Usuario</th>
                  <th>Método</th>
                  <th>Estado</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((venta) => (
                  <tr key={venta.id_venta}>
                    <td>{venta.id_venta}</td>
                    <td>{formatoFecha(venta.fecha_venta)}</td>
                    <td>{venta.cliente || 'Sin cliente'}</td>
                    <td>{venta.usuario}</td>
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
                    <td>{formatoMoneda(venta.total)}</td>
                  </tr>
                ))}

                {ventas.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-muted">
                      No hay ventas para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 print-section">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Ventas por método de pago</h5>

              <div className="table-responsive">
                <table className="table table-hover align-middle report-table">
                  <thead>
                    <tr>
                      <th>Método</th>
                      <th>Cantidad</th>
                      <th>Total vendido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventasMetodoPago.map((item) => (
                      <tr key={item.metodo_pago}>
                        <td>{item.metodo_pago}</td>
                        <td>{item.cantidad_ventas}</td>
                        <td>{formatoMoneda(item.total_vendido)}</td>
                      </tr>
                    ))}

                    {ventasMetodoPago.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-muted">
                          No hay ventas por método de pago.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm border-0 print-section">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Clientes con mayor compra</h5>

              <div className="table-responsive">
                <table className="table table-hover align-middle report-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Compras</th>
                      <th>Total comprado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventasClientes.map((cliente) => (
                      <tr key={cliente.id_cliente || cliente.cliente}>
                        <td>{cliente.cliente || 'Sin cliente'}</td>
                        <td>{cliente.cantidad_compras}</td>
                        <td>{formatoMoneda(cliente.total_comprado)}</td>
                      </tr>
                    ))}

                    {ventasClientes.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-muted">
                          No hay datos de clientes.
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

export default Reportes;