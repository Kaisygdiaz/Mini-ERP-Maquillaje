import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
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

      setResumen(resumenRes.data);
      setProductosMasVendidos(masVendidosRes.data);
      setVentasPorCategoria(categoriaRes.data);
      setProductosPromocion(promocionRes.data);
      setStockBajo(stockBajoRes.data);
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
            titulo="Productos"
            valor={resumen?.total_productos || 0}
            descripcion="Productos registrados"
          />
        </div>

        <div className="col-md-3">
          <StatCard
            titulo="Clientes"
            valor={resumen?.total_clientes || 0}
            descripcion="Clientes registrados"
          />
        </div>

        <div className="col-md-3">
          <StatCard
            titulo="Ventas"
            valor={resumen?.total_ventas || 0}
            descripcion="Ventas completadas"
          />
        </div>

        <div className="col-md-3">
          <StatCard
            titulo="Ingresos"
            valor={formatoMoneda(resumen?.ingresos_totales)}
            descripcion="Total vendido"
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Productos más vendidos</h5>

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
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Ventas por categoría</h5>

              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={ventasPorCategoria}
                      dataKey="total_vendido"
                      nameKey="categoria"
                      outerRadius={100}
                      label
                    >
                      {ventasPorCategoria.map((item, index) => (
                        <Cell key={index} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
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
                        <td>{producto.stock_actual}</td>
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