import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie
} from 'recharts';

import api from '../api/axiosConfig';
import StatCard from '../components/StatCard';

/*
  Página principal del dashboard gerencial.
  Consume las rutas del backend para mostrar indicadores, gráficas y alertas.
*/
const Dashboard = () => {
  const [resumen, setResumen] = useState(null);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [ventasPorCategoria, setVentasPorCategoria] = useState([]);
  const [productosPromocion, setProductosPromocion] = useState([]);
  const [stockBajo, setStockBajo] = useState([]);

  const obtenerDatosDashboard = async () => {
    try {
      const [
        resumenRes,
        masVendidosRes,
        categoriaRes,
        promocionRes,
        stockBajoRes
      ] = await Promise.all([
        api.get('/dashboard/resumen'),
        api.get('/dashboard/productos-mas-vendidos'),
        api.get('/dashboard/ventas-por-categoria'),
        api.get('/dashboard/productos-promocion'),
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

      setProductosPromocion(
        promocionRes.data.map((item) => ({
          ...item,
          stock_actual: Number(item.stock_actual || 0),
          stock_minimo: Number(item.stock_minimo || 0),
          precio_venta: Number(item.precio_venta || 0),
          unidades_vendidas: Number(item.unidades_vendidas || 0)
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

  const formatoTooltipMoneda = (value) => {
    return formatoMoneda(value);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="page-title">Dashboard Gerencial</h2>
        <p className="page-subtitle">
          Indicadores generales para analizar ventas, inventario, rotación y promociones.
        </p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <StatCard
            titulo="Ingresos totales"
            valor={formatoMoneda(resumen?.ingresos_totales)}
            descripcion="Ventas completadas acumuladas"
          />
        </div>

        <div className="col-md-3">
          <StatCard
            titulo="Ingresos del mes"
            valor={formatoMoneda(resumen?.ingresos_mes_actual)}
            descripcion={`${resumen?.ventas_mes_actual || 0} ventas completadas este mes`}
          />
        </div>

        <div className="col-md-3">
          <StatCard
            titulo="Ventas completadas"
            valor={resumen?.total_ventas || 0}
            descripcion="Operaciones confirmadas"
          />
        </div>

        <div className="col-md-3">
          <StatCard
            titulo="Ventas anuladas"
            valor={resumen?.ventas_anuladas || 0}
            descripcion={`${formatoMoneda(resumen?.total_anulado)} anulados`}
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <StatCard
            titulo="Productos"
            valor={resumen?.total_productos || 0}
            descripcion={`${resumen?.productos_activos || 0} activos, ${resumen?.productos_agotados || 0} agotados`}
          />
        </div>

        <div className="col-md-3">
          <StatCard
            titulo="Clientes"
            valor={resumen?.total_clientes || 0}
            descripcion={`${resumen?.clientes_activos || 0} activos, ${resumen?.clientes_inactivos || 0} inactivos`}
          />
        </div>

        <div className="col-md-3">
          <StatCard
            titulo="Inventario compra"
            valor={formatoMoneda(resumen?.valor_inventario_compra)}
            descripcion="Costo estimado del stock actual"
          />
        </div>

        <div className="col-md-3">
          <StatCard
            titulo="Inventario venta"
            valor={formatoMoneda(resumen?.valor_inventario_venta)}
            descripcion="Valor potencial de venta"
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <StatCard
            titulo="Stock bajo"
            valor={resumen?.productos_stock_bajo || 0}
            descripcion="Productos que requieren revisión"
          />
        </div>

        <div className="col-md-3">
          <StatCard
            titulo="Productos inactivos"
            valor={resumen?.productos_inactivos || 0}
            descripcion="No disponibles para venta"
          />
        </div>

        <div className="col-md-3">
          <StatCard
            titulo="Productos agotados"
            valor={resumen?.productos_agotados || 0}
            descripcion="Requieren reposición"
          />
        </div>

        <div className="col-md-3">
          <StatCard
            titulo="Clientes inactivos"
            valor={resumen?.clientes_inactivos || 0}
            descripcion="Clientes conservados por historial"
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Productos más vendidos</h5>

              {productosMasVendidos.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={productosMasVendidos}>
                      <XAxis dataKey="nombre" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="unidades_vendidas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted">
                  No hay ventas completadas para mostrar productos más vendidos.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Ventas por categoría</h5>

              {ventasPorCategoria.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={ventasPorCategoria}
                        dataKey="total_vendido"
                        nameKey="categoria"
                        outerRadius={100}
                        label
                      />
                      <Tooltip formatter={formatoTooltipMoneda} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted">
                  No hay ventas completadas para mostrar por categoría.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Productos sugeridos para promoción</h5>

              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Stock</th>
                      <th>Vendidas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosPromocion.map((producto) => (
                      <tr key={producto.id_producto}>
                        <td>{producto.nombre}</td>
                        <td>{producto.categoria}</td>
                        <td>{producto.stock_actual}</td>
                        <td>{producto.unidades_vendidas}</td>
                      </tr>
                    ))}

                    {productosPromocion.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-muted">
                          No hay productos sugeridos para promoción.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Productos con bajo stock</h5>

              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Stock</th>
                      <th>Mínimo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockBajo.map((producto) => (
                      <tr key={producto.id_producto}>
                        <td>{producto.nombre}</td>
                        <td>{producto.categoria}</td>
                        <td>
                          <span className="badge bg-danger">
                            {producto.stock_actual}
                          </span>
                        </td>
                        <td>{producto.stock_minimo}</td>
                      </tr>
                    ))}

                    {stockBajo.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-muted">
                          No hay productos con bajo stock.
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

export default Dashboard;