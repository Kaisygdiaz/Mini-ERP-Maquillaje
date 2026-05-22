import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

import api from '../api/axiosConfig';
import StatCard from '../components/StatCard';

const PIE_COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'];

const CLIENTES_COLORS = ['#22c55e', '#64748b'];

const ESTADO_COLORS = {
  Completada: '#22c55e',
  Anulada: '#ef4444'
};

const Dashboard = () => {
  const [resumen, setResumen] = useState(null);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [ventasPorCategoria, setVentasPorCategoria] = useState([]);
  const [ventasPorVendedor, setVentasPorVendedor] = useState([]);
  const [ventasPorEstado, setVentasPorEstado] = useState([]);
  const [diasConMasVentas, setDiasConMasVentas] = useState([]);
  const [ventasPorMes, setVentasPorMes] = useState([]);
  const [relacionVentasInventario, setRelacionVentasInventario] = useState([]);
  const [stockBajo, setStockBajo] = useState([]);

  const obtenerDatosDashboard = async () => {
    try {
      const [
        resumenRes,
        masVendidosRes,
        categoriaRes,
        vendedorRes,
        estadoRes,
        diasRes,
        ventasMesRes,
        relacionRes,
        stockBajoRes
      ] = await Promise.all([
        api.get('/dashboard/resumen'),
        api.get('/dashboard/productos-mas-vendidos'),
        api.get('/dashboard/ventas-por-categoria'),
        api.get('/dashboard/ventas-por-vendedor'),
        api.get('/dashboard/ventas-por-estado'),
        api.get('/dashboard/dias-con-mas-ventas'),
        api.get('/dashboard/ventas-por-mes'),
        api.get('/dashboard/relacion-ventas-inventario'),
        api.get('/dashboard/stock-bajo')
      ]);

      setResumen({
        total_productos: Number(resumenRes.data.total_productos || 0),
        productos_activos: Number(resumenRes.data.productos_activos || 0),
        productos_inactivos: Number(resumenRes.data.productos_inactivos || 0),
        productos_agotados: Number(resumenRes.data.productos_agotados || 0),

        total_clientes: Number(resumenRes.data.total_clientes || 0),
        clientes_activos: Number(resumenRes.data.clientes_activos || 0),
        clientes_inactivos: Number(resumenRes.data.clientes_inactivos || 0),

        total_ventas: Number(resumenRes.data.total_ventas || 0),
        ingresos_totales: Number(resumenRes.data.ingresos_totales || 0),

        ventas_anuladas: Number(resumenRes.data.ventas_anuladas || 0),
        total_anulado: Number(resumenRes.data.total_anulado || 0),

        ventas_mes_actual: Number(resumenRes.data.ventas_mes_actual || 0),
        ingresos_mes_actual: Number(resumenRes.data.ingresos_mes_actual || 0),

        valor_inventario_compra: Number(resumenRes.data.valor_inventario_compra || 0),
        valor_inventario_venta: Number(resumenRes.data.valor_inventario_venta || 0),

        productos_stock_bajo: Number(resumenRes.data.productos_stock_bajo || 0)
      });

      setProductosMasVendidos(
        masVendidosRes.data.map((item) => ({
          ...item,
          unidades_vendidas: Number(item.unidades_vendidas || 0),
          total_generado: Number(item.total_generado || 0)
        }))
      );

      setVentasPorCategoria(
        categoriaRes.data.map((item) => ({
          ...item,
          total_vendido: Number(item.total_vendido || 0),
          unidades_vendidas: Number(item.unidades_vendidas || 0)
        }))
      );

      setVentasPorVendedor(
        vendedorRes.data.map((item) => ({
          ...item,
          cantidad_ventas: Number(item.cantidad_ventas || 0),
          total_vendido: Number(item.total_vendido || 0)
        }))
      );

      setVentasPorEstado(
        estadoRes.data.map((item) => ({
          ...item,
          cantidad_ventas: Number(item.cantidad_ventas || 0),
          total_ventas: Number(item.total_ventas || 0)
        }))
      );

      setDiasConMasVentas(
        diasRes.data.map((item) => ({
          ...item,
          cantidad_ventas: Number(item.cantidad_ventas || 0),
          total_vendido: Number(item.total_vendido || 0)
        }))
      );

      setVentasPorMes(
        ventasMesRes.data.map((item) => ({
          ...item,
          mes_texto: `${item.mes}/${item.anio}`,
          total_ventas: Number(item.total_ventas || 0),
          ingresos: Number(item.ingresos || 0)
        }))
      );

      setRelacionVentasInventario(
        relacionRes.data.map((item) => ({
          ...item,
          stock_actual: Number(item.stock_actual || 0),
          stock_minimo: Number(item.stock_minimo || 0),
          unidades_vendidas: Number(item.unidades_vendidas || 0),
          total_vendido: Number(item.total_vendido || 0),
          precio_venta: Number(item.precio_venta || 0)
        }))
      );

      setStockBajo(
        stockBajoRes.data.map((item) => ({
          ...item,
          stock_actual: Number(item.stock_actual || 0),
          stock_minimo: Number(item.stock_minimo || 0)
        }))
      );
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    }
  };

  useEffect(() => {
    obtenerDatosDashboard();
  }, []);

  const formatoMoneda = (valor) => {
    const numero = Number(valor || 0);

    return numero.toLocaleString('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    });
  };

  const acortarTexto = (texto = '', limite = 16) => {
    if (texto.length <= limite) return texto;
    return `${texto.slice(0, limite)}...`;
  };

  const calcularPorcentaje = (valor, total) => {
    if (!total || total <= 0) return 0;
    return Math.round((Number(valor || 0) / total) * 100);
  };

  const renderEtiquetaPorcentaje = ({ percent }) => {
    if (!percent || percent <= 0) return '';
    return `${Math.round(percent * 100)}%`;
  };

  const datosClientes = [
    {
      estado: 'Activos',
      cantidad: resumen?.clientes_activos || 0
    },
    {
      estado: 'Inactivos',
      cantidad: resumen?.clientes_inactivos || 0
    }
  ];

  const totalVentasCategoria = ventasPorCategoria.reduce(
    (total, item) => total + Number(item.total_vendido || 0),
    0
  );

  const totalClientesGrafica = datosClientes.reduce(
    (total, item) => total + Number(item.cantidad || 0),
    0
  );

  const totalVentasEstado = ventasPorEstado.reduce(
    (total, item) => total + Number(item.cantidad_ventas || 0),
    0
  );

  const oportunidadesGerenciales = relacionVentasInventario.filter((producto) => {
    return (
      producto.situacion === 'Alta demanda y bajo stock' ||
      producto.situacion === 'Baja rotación y alto stock' ||
      producto.situacion === 'Sin movimiento' ||
      producto.situacion === 'Agotado'
    );
  });

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <span className="dashboard-overline">Resumen ejecutivo</span>
          <h2>Dashboard Gerencial</h2>
          <p>
            Relaciona ventas e inventario para apoyar decisiones de reposición,
            promoción, control de stock y seguimiento comercial.
          </p>
        </div>

        <div className="dashboard-hero-stats">
          <div className="hero-metric">
            <span className="hero-metric-label">Ingresos totales</span>
            <strong>{formatoMoneda(resumen?.ingresos_totales)}</strong>
            <small>Ventas completadas acumuladas</small>
          </div>

          <div className="hero-metric">
            <span className="hero-metric-label">Inventario venta</span>
            <strong>{formatoMoneda(resumen?.valor_inventario_venta)}</strong>
            <small>Valor potencial del stock</small>
          </div>

          <div className="hero-metric">
            <span className="hero-metric-label">Ventas anuladas</span>
            <strong>{resumen?.ventas_anuladas || 0}</strong>
            <small>{formatoMoneda(resumen?.total_anulado)} anulados</small>
          </div>

          <div className="hero-metric">
            <span className="hero-metric-label">Stock bajo</span>
            <strong>{resumen?.productos_stock_bajo || 0}</strong>
            <small>Productos por revisar</small>
          </div>
        </div>
      </section>

      <section className="dashboard-kpi-grid">
        <StatCard
          titulo="Ingresos del mes"
          valor={formatoMoneda(resumen?.ingresos_mes_actual)}
          descripcion={`${resumen?.ventas_mes_actual || 0} ventas completadas este mes`}
          variant="primary"
        />

        <StatCard
          titulo="Ventas completadas"
          valor={resumen?.total_ventas || 0}
          descripcion="Operaciones efectivas"
          variant="success"
        />

        <StatCard
          titulo="Productos registrados"
          valor={resumen?.total_productos || 0}
          descripcion={`${resumen?.productos_activos || 0} activos y ${resumen?.productos_agotados || 0} agotados`}
          variant="info"
        />

        <StatCard
          titulo="Inventario a costo"
          valor={formatoMoneda(resumen?.valor_inventario_compra)}
          descripcion="Costo estimado del stock actual"
          variant="default"
        />

        <StatCard
          titulo="Productos inactivos"
          valor={resumen?.productos_inactivos || 0}
          descripcion="No disponibles para venta"
          variant="danger"
        />

        <StatCard
          titulo="Productos agotados"
          valor={resumen?.productos_agotados || 0}
          descripcion="Requieren revisión"
          variant="secondary"
        />
      </section>

      <section className="dashboard-panels-grid dashboard-panels-grid-tendencia">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h5 className="panel-title">Ingresos por mes</h5>
              <p className="panel-subtitle">
                Evolución mensual de ingresos generados por ventas completadas.
              </p>
            </div>

            <span className="panel-insight">
              {ventasPorMes.length} meses
            </span>
          </div>

          <div className="chart-container chart-container-large">
            {ventasPorMes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ventasPorMes}>
                  <defs>
                    <linearGradient id="colorIngresosMes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />

                  <XAxis dataKey="mes_texto" tick={{ fontSize: 12 }} />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `Q${value}`}
                  />

                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'ingresos') {
                        return [formatoMoneda(value), 'Ingresos'];
                      }

                      return [`${value} ventas`, 'Cantidad de ventas'];
                    }}
                    labelFormatter={(label) => `Mes: ${label}`}
                  />

                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#ec4899"
                    strokeWidth={3}
                    fill="url(#colorIngresosMes)"
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="panel-empty">
                No hay ventas completadas para mostrar ingresos por mes.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="dashboard-panels-grid dashboard-panels-grid-tendencia">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h5 className="panel-title">Relación ventas e inventario por producto</h5>
              <p className="panel-subtitle">
                Compara la demanda de cada producto con su disponibilidad actual.
              </p>
            </div>

            <span className="panel-insight">
              {relacionVentasInventario.length} productos analizados
            </span>
          </div>

          <div className="chart-container chart-container-large">
            {relacionVentasInventario.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={relacionVentasInventario}
                  margin={{ top: 10, right: 25, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />

                  <XAxis
                    dataKey="nombre"
                    tickFormatter={(value) => acortarTexto(value, 14)}
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />

                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'unidades_vendidas') {
                        return [`${value} unidades`, 'Vendidas'];
                      }

                      if (name === 'stock_actual') {
                        return [`${value} unidades`, 'Stock actual'];
                      }

                      return [value, name];
                    }}
                    labelFormatter={(label) => `Producto: ${label}`}
                  />

                  <Bar
                    dataKey="unidades_vendidas"
                    fill="#ec4899"
                    name="Vendidas"
                    radius={[10, 10, 0, 0]}
                  />

                  <Bar
                    dataKey="stock_actual"
                    fill="#06b6d4"
                    name="Stock actual"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="panel-empty">
                No hay datos suficientes para relacionar ventas e inventario.
              </div>
            )}
          </div>

          <div className="dashboard-legend">
            <div className="legend-chip">
              <span className="legend-dot" style={{ backgroundColor: '#ec4899' }}></span>
              <span>Unidades vendidas</span>
            </div>

            <div className="legend-chip">
              <span className="legend-dot" style={{ backgroundColor: '#06b6d4' }}></span>
              <span>Stock actual</span>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-panels-grid dashboard-panels-grid-tendencia">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h5 className="panel-title">Decisión gerencial sugerida</h5>
              <p className="panel-subtitle">
                Interpretación automática según ventas, stock actual y stock mínimo.
              </p>
            </div>

            <span className="panel-insight">
              Ventas + Inventario
            </span>
          </div>

          <div className="executive-table executive-table-relacion">
            <div className="executive-table-header">
              <span>Producto</span>
              <span>Vendidas</span>
              <span>Stock</span>
              <span>Situación</span>
              <span>Recomendación</span>
            </div>

            {relacionVentasInventario.map((producto) => (
              <div className="executive-table-row" key={producto.id_producto}>
                <span className="executive-table-main">{producto.nombre}</span>
                <span>{producto.unidades_vendidas}</span>
                <span>{producto.stock_actual}</span>
                <span>
                  <span className="decision-badge">
                    {producto.situacion}
                  </span>
                </span>
                <span>{producto.recomendacion}</span>
              </div>
            ))}

            {relacionVentasInventario.length === 0 && (
              <div className="panel-empty">
                No hay recomendaciones disponibles.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="dashboard-panels-grid">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h5 className="panel-title">Productos más vendidos</h5>
              <p className="panel-subtitle">
                Productos con mayor demanda en ventas completadas.
              </p>
            </div>

            <span className="panel-insight">
              {productosMasVendidos.length} con movimiento
            </span>
          </div>

          <div className="chart-container">
            {productosMasVendidos.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productosMasVendidos}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />

                  <XAxis
                    dataKey="nombre"
                    tickFormatter={(value) => acortarTexto(value, 14)}
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />

                  <Tooltip
                    formatter={(value) => [`${value} unidades`, 'Vendidas']}
                    labelFormatter={(label) => `Producto: ${label}`}
                  />

                  <Bar
                    dataKey="unidades_vendidas"
                    fill="#ec4899"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="panel-empty">
                No hay ventas completadas para mostrar productos más vendidos.
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h5 className="panel-title">Ventas por categoría</h5>
              <p className="panel-subtitle">
                Distribución porcentual de ingresos por categoría.
              </p>
            </div>

            <span className="panel-insight">
              {ventasPorCategoria.length} categorías
            </span>
          </div>

          <div className="chart-container">
            {ventasPorCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ventasPorCategoria}
                    dataKey="total_vendido"
                    nameKey="categoria"
                    innerRadius={72}
                    outerRadius={108}
                    paddingAngle={3}
                    label={renderEtiquetaPorcentaje}
                  >
                    {ventasPorCategoria.map((item, index) => (
                      <Cell
                        key={`cell-${item.categoria}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => [
                      `${formatoMoneda(value)} (${calcularPorcentaje(value, totalVentasCategoria)}%)`,
                      'Participación'
                    ]}
                    labelFormatter={(label) => `Categoría: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="panel-empty">
                No hay ventas completadas para mostrar por categoría.
              </div>
            )}
          </div>

          {ventasPorCategoria.length > 0 && (
            <div className="dashboard-legend">
              {ventasPorCategoria.map((item, index) => (
                <div className="legend-chip" key={item.categoria}>
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  ></span>
                  <span>
                    {item.categoria}: {calcularPorcentaje(item.total_vendido, totalVentasCategoria)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-panels-grid dashboard-panels-grid-vendedores">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h5 className="panel-title">Ventas por vendedor</h5>
              <p className="panel-subtitle">
                Compara el rendimiento comercial según el total vendido.
              </p>
            </div>

            <span className="panel-insight">
              {ventasPorVendedor.length} vendedores
            </span>
          </div>

          <div className="chart-container">
            {ventasPorVendedor.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ventasPorVendedor}
                  layout="vertical"
                  margin={{ top: 10, right: 25, left: 35, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />

                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `Q${value}`}
                  />

                  <YAxis
                    type="category"
                    dataKey="vendedor"
                    tickFormatter={(value) => acortarTexto(value, 16)}
                    tick={{ fontSize: 12 }}
                    width={110}
                  />

                  <Tooltip
                    formatter={(value) => [formatoMoneda(value), 'Total vendido']}
                    labelFormatter={(label) => `Vendedor: ${label}`}
                  />

                  <Bar
                    dataKey="total_vendido"
                    fill="#8b5cf6"
                    radius={[0, 10, 10, 0]}
                    barSize={26}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="panel-empty">
                No hay ventas completadas para mostrar rendimiento por vendedor.
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h5 className="panel-title">Clientes activos vs inactivos</h5>
              <p className="panel-subtitle">
                Distribución porcentual del estado de la cartera de clientes.
              </p>
            </div>

            <span className="panel-insight">
              {resumen?.total_clientes || 0} clientes
            </span>
          </div>

          <div className="chart-container">
            {(resumen?.total_clientes || 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datosClientes}
                    dataKey="cantidad"
                    nameKey="estado"
                    innerRadius={72}
                    outerRadius={108}
                    paddingAngle={3}
                    label={renderEtiquetaPorcentaje}
                  >
                    {datosClientes.map((item, index) => (
                      <Cell
                        key={`cliente-${item.estado}`}
                        fill={CLIENTES_COLORS[index % CLIENTES_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => [
                      `${value} clientes (${calcularPorcentaje(value, totalClientesGrafica)}%)`,
                      'Cantidad'
                    ]}
                    labelFormatter={(label) => `Estado: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="panel-empty">
                No hay clientes registrados para mostrar.
              </div>
            )}
          </div>

          {(resumen?.total_clientes || 0) > 0 && (
            <div className="dashboard-legend">
              {datosClientes.map((item, index) => (
                <div className="legend-chip" key={item.estado}>
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: CLIENTES_COLORS[index % CLIENTES_COLORS.length] }}
                  ></span>
                  <span>
                    {item.estado}: {calcularPorcentaje(item.cantidad, totalClientesGrafica)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-panels-grid dashboard-panels-grid-estados">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h5 className="panel-title">Ventas completadas vs anuladas</h5>
              <p className="panel-subtitle">
                Proporción de ventas efectivas frente a ventas anuladas.
              </p>
            </div>

            <span className="panel-insight">
              {ventasPorEstado.length} estados
            </span>
          </div>

          <div className="chart-container">
            {ventasPorEstado.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ventasPorEstado}
                    dataKey="cantidad_ventas"
                    nameKey="estado"
                    innerRadius={72}
                    outerRadius={108}
                    paddingAngle={3}
                    label={renderEtiquetaPorcentaje}
                  >
                    {ventasPorEstado.map((item) => (
                      <Cell
                        key={`estado-${item.estado}`}
                        fill={ESTADO_COLORS[item.estado] || '#64748b'}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => [
                      `${value} ventas (${calcularPorcentaje(value, totalVentasEstado)}%)`,
                      'Cantidad'
                    ]}
                    labelFormatter={(label) => `Estado: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="panel-empty">
                No hay ventas registradas para comparar estados.
              </div>
            )}
          </div>

          {ventasPorEstado.length > 0 && (
            <div className="dashboard-legend">
              {ventasPorEstado.map((item) => (
                <div className="legend-chip" key={item.estado}>
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: ESTADO_COLORS[item.estado] || '#64748b' }}
                  ></span>
                  <span>
                    {item.estado}: {calcularPorcentaje(item.cantidad_ventas, totalVentasEstado)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h5 className="panel-title">Días con más ventas</h5>
              <p className="panel-subtitle">
                Días con mayor actividad comercial registrada.
              </p>
            </div>

            <span className="panel-insight">
              Top {diasConMasVentas.length}
            </span>
          </div>

          <div className="chart-container">
            {diasConMasVentas.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diasConMasVentas}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />

                  <XAxis dataKey="dia" tick={{ fontSize: 12 }} />

                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />

                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'total_vendido') {
                        return [formatoMoneda(value), 'Total vendido'];
                      }

                      return [`${value} ventas`, 'Cantidad de ventas'];
                    }}
                    labelFormatter={(label) => `Día: ${label}`}
                  />

                  <Bar
                    dataKey="cantidad_ventas"
                    fill="#06b6d4"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="panel-empty">
                No hay ventas completadas para mostrar días con mayor movimiento.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="dashboard-panels-grid dashboard-panels-grid-bottom">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h5 className="panel-title">Oportunidades gerenciales</h5>
              <p className="panel-subtitle">
                Productos que requieren decisión comercial o revisión de inventario.
              </p>
            </div>

            <span className="panel-insight">
              {oportunidadesGerenciales.length} oportunidades
            </span>
          </div>

          <div className="executive-table executive-table-oportunidades">
            <div className="executive-table-header">
              <span>Producto</span>
              <span>Situación</span>
              <span>Acción sugerida</span>
            </div>

            {oportunidadesGerenciales.map((producto) => (
              <div className="executive-table-row" key={producto.id_producto}>
                <span className="executive-table-main">{producto.nombre}</span>
                <span>
                  <span className="decision-badge">
                    {producto.situacion}
                  </span>
                </span>
                <span>{producto.recomendacion}</span>
              </div>
            ))}

            {oportunidadesGerenciales.length === 0 && (
              <div className="panel-empty">
                No hay oportunidades críticas en este momento.
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h5 className="panel-title">Productos con bajo stock</h5>
              <p className="panel-subtitle">
                Productos que requieren revisión o reposición inmediata.
              </p>
            </div>

            <span className="panel-insight">
              {stockBajo.length} alertas
            </span>
          </div>

          {stockBajo.length > 0 ? (
            <div className="stock-alert-list">
              {stockBajo.map((producto) => (
                <div className="stock-alert-item" key={producto.id_producto}>
                  <div className="stock-alert-meta">
                    <h6>{producto.nombre}</h6>
                    <p>{producto.categoria}</p>
                  </div>

                  <div className="stock-alert-values">
                    <span className="stock-pill stock-pill-danger">
                      Stock: {producto.stock_actual}
                    </span>
                    <span className="stock-pill stock-pill-light">
                      Mínimo: {producto.stock_minimo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="panel-empty">
              No hay productos con bajo stock.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;