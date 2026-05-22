const pool = require('../db/conexion');

/*
  Controlador para obtener indicadores generales del dashboard.
  Resume información clave para la gerencia: productos, clientes, ventas e inventario.
*/
const obtenerResumenDashboard = async (req, res) => {
  try {
    const [[productos]] = await pool.query(`
      SELECT 
        COUNT(*) AS total_productos,
        SUM(CASE WHEN estado = 'Activo' THEN 1 ELSE 0 END) AS productos_activos,
        SUM(CASE WHEN estado = 'Inactivo' THEN 1 ELSE 0 END) AS productos_inactivos,
        SUM(CASE WHEN estado = 'Agotado' THEN 1 ELSE 0 END) AS productos_agotados
      FROM productos
    `);

    const [[clientes]] = await pool.query(`
      SELECT 
        COUNT(*) AS total_clientes,
        SUM(CASE WHEN estado = 'Activo' THEN 1 ELSE 0 END) AS clientes_activos,
        SUM(CASE WHEN estado = 'Inactivo' THEN 1 ELSE 0 END) AS clientes_inactivos
      FROM clientes
    `);

    const [[ventasCompletadas]] = await pool.query(`
      SELECT 
        COUNT(*) AS total_ventas,
        COALESCE(SUM(total), 0) AS ingresos_totales
      FROM ventas
      WHERE estado = 'Completada'
    `);

    const [[ventasAnuladas]] = await pool.query(`
      SELECT 
        COUNT(*) AS ventas_anuladas,
        COALESCE(SUM(total), 0) AS total_anulado
      FROM ventas
      WHERE estado = 'Anulada'
    `);

    const [[ventasMesActual]] = await pool.query(`
      SELECT
        COUNT(*) AS ventas_mes_actual,
        COALESCE(SUM(total), 0) AS ingresos_mes_actual
      FROM ventas
      WHERE estado = 'Completada'
      AND YEAR(fecha_venta) = YEAR(CURDATE())
      AND MONTH(fecha_venta) = MONTH(CURDATE())
    `);

    const [[inventario]] = await pool.query(`
      SELECT 
        COALESCE(SUM(stock_actual * precio_compra), 0) AS valor_inventario_compra,
        COALESCE(SUM(stock_actual * precio_venta), 0) AS valor_inventario_venta
      FROM productos
      WHERE estado = 'Activo'
    `);

    const [[stockBajo]] = await pool.query(`
      SELECT COUNT(*) AS productos_stock_bajo
      FROM productos
      WHERE stock_actual <= stock_minimo
      AND estado = 'Activo'
    `);

    res.json({
      total_productos: productos.total_productos || 0,
      productos_activos: productos.productos_activos || 0,
      productos_inactivos: productos.productos_inactivos || 0,
      productos_agotados: productos.productos_agotados || 0,

      total_clientes: clientes.total_clientes || 0,
      clientes_activos: clientes.clientes_activos || 0,
      clientes_inactivos: clientes.clientes_inactivos || 0,

      total_ventas: ventasCompletadas.total_ventas || 0,
      ingresos_totales: ventasCompletadas.ingresos_totales || 0,

      ventas_anuladas: ventasAnuladas.ventas_anuladas || 0,
      total_anulado: ventasAnuladas.total_anulado || 0,

      ventas_mes_actual: ventasMesActual.ventas_mes_actual || 0,
      ingresos_mes_actual: ventasMesActual.ingresos_mes_actual || 0,

      valor_inventario_compra: inventario.valor_inventario_compra || 0,
      valor_inventario_venta: inventario.valor_inventario_venta || 0,

      productos_stock_bajo: stockBajo.productos_stock_bajo || 0
    });
  } catch (error) {
    console.error('Error al obtener resumen del dashboard:', error);

    res.status(500).json({
      mensaje: 'Error al obtener el resumen del dashboard',
      error: error.message
    });
  }
};

/*
  Controlador para obtener los productos con bajo stock.
*/
const obtenerProductosStockBajo = async (req, res) => {
  try {
    const [productos] = await pool.query(`
      SELECT 
        p.id_producto,
        p.nombre,
        c.nombre AS categoria,
        p.stock_actual,
        p.stock_minimo
      FROM productos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE p.stock_actual <= p.stock_minimo
      AND p.estado = 'Activo'
      ORDER BY p.stock_actual ASC
    `);

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);

    res.status(500).json({
      mensaje: 'Error al obtener productos con stock bajo',
      error: error.message
    });
  }
};

/*
  Controlador para obtener los productos más vendidos.
*/
const obtenerProductosMasVendidos = async (req, res) => {
  try {
    const [productos] = await pool.query(`
      SELECT 
        p.id_producto,
        p.nombre,
        c.nombre AS categoria,
        SUM(dv.cantidad) AS unidades_vendidas,
        SUM(dv.subtotal) AS total_generado
      FROM detalle_ventas dv
      INNER JOIN productos p ON dv.id_producto = p.id_producto
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      INNER JOIN ventas v ON dv.id_venta = v.id_venta
      WHERE v.estado = 'Completada'
      GROUP BY p.id_producto, p.nombre, c.nombre
      ORDER BY unidades_vendidas DESC
      LIMIT 5
    `);

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);

    res.status(500).json({
      mensaje: 'Error al obtener productos más vendidos',
      error: error.message
    });
  }
};

/*
  Controlador para obtener ventas agrupadas por categoría.
*/
const obtenerVentasPorCategoria = async (req, res) => {
  try {
    const [categorias] = await pool.query(`
      SELECT 
        c.nombre AS categoria,
        SUM(dv.cantidad) AS unidades_vendidas,
        SUM(dv.subtotal) AS total_vendido
      FROM detalle_ventas dv
      INNER JOIN productos p ON dv.id_producto = p.id_producto
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      INNER JOIN ventas v ON dv.id_venta = v.id_venta
      WHERE v.estado = 'Completada'
      GROUP BY c.id_categoria, c.nombre
      ORDER BY total_vendido DESC
    `);

    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener ventas por categoría:', error);

    res.status(500).json({
      mensaje: 'Error al obtener ventas por categoría',
      error: error.message
    });
  }
};

/*
  Controlador para obtener ventas por mes.
*/
const obtenerVentasPorMes = async (req, res) => {
  try {
    const [ventas] = await pool.query(`
      SELECT 
        YEAR(fecha_venta) AS anio,
        MONTH(fecha_venta) AS mes,
        COUNT(id_venta) AS total_ventas,
        SUM(total) AS ingresos
      FROM ventas
      WHERE estado = 'Completada'
      GROUP BY YEAR(fecha_venta), MONTH(fecha_venta)
      ORDER BY anio ASC, mes ASC
    `);

    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas por mes:', error);

    res.status(500).json({
      mensaje: 'Error al obtener ventas por mes',
      error: error.message
    });
  }
};

/*
  Controlador para obtener productos sugeridos para promoción.
*/
const obtenerProductosSugeridosPromocion = async (req, res) => {
  try {
    const [productos] = await pool.query(`
      SELECT 
        p.id_producto,
        p.nombre,
        c.nombre AS categoria,
        p.stock_actual,
        p.stock_minimo,
        p.precio_venta,
        COALESCE(SUM(CASE WHEN v.estado = 'Completada' THEN dv.cantidad ELSE 0 END), 0) AS unidades_vendidas
      FROM productos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN detalle_ventas dv ON p.id_producto = dv.id_producto
      LEFT JOIN ventas v ON dv.id_venta = v.id_venta
      WHERE p.estado = 'Activo'
      GROUP BY 
        p.id_producto,
        p.nombre,
        c.nombre,
        p.stock_actual,
        p.stock_minimo,
        p.precio_venta
      HAVING p.stock_actual > (p.stock_minimo * 3)
      AND unidades_vendidas <= 2
      ORDER BY p.stock_actual DESC
      LIMIT 10
    `);

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos sugeridos para promoción:', error);

    res.status(500).json({
      mensaje: 'Error al obtener productos sugeridos para promoción',
      error: error.message
    });
  }
};

/*
  Controlador para obtener ventas agrupadas por vendedor.
  Permite comparar el rendimiento de cada usuario que registra ventas.
*/
const obtenerVentasPorVendedor = async (req, res) => {
  try {
    const [vendedores] = await pool.query(`
      SELECT
        u.id_usuario,
        u.nombre AS vendedor,
        COUNT(v.id_venta) AS cantidad_ventas,
        COALESCE(SUM(v.total), 0) AS total_vendido
      FROM ventas v
      INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
      WHERE v.estado = 'Completada'
      GROUP BY u.id_usuario, u.nombre
      ORDER BY total_vendido DESC
    `);

    res.json(vendedores);
  } catch (error) {
    console.error('Error al obtener ventas por vendedor:', error);

    res.status(500).json({
      mensaje: 'Error al obtener ventas por vendedor',
      error: error.message
    });
  }
};

/*
  Controlador para obtener ventas agrupadas por estado.
  Permite comparar ventas completadas contra ventas anuladas.
*/
const obtenerVentasPorEstado = async (req, res) => {
  try {
    const [estados] = await pool.query(`
      SELECT
        estado,
        COUNT(id_venta) AS cantidad_ventas,
        COALESCE(SUM(total), 0) AS total_ventas
      FROM ventas
      GROUP BY estado
      ORDER BY cantidad_ventas DESC
    `);

    res.json(estados);
  } catch (error) {
    console.error('Error al obtener ventas por estado:', error);

    res.status(500).json({
      mensaje: 'Error al obtener ventas por estado',
      error: error.message
    });
  }
};

/*
  Controlador para obtener los días con más ventas realizadas.
  Toma únicamente ventas completadas para medir días reales de venta.
*/
const obtenerDiasConMasVentas = async (req, res) => {
  try {
    const [dias] = await pool.query(`
      SELECT
        DATE(fecha_venta) AS fecha,
        DATE_FORMAT(fecha_venta, '%d/%m/%Y') AS dia,
        COUNT(id_venta) AS cantidad_ventas,
        COALESCE(SUM(total), 0) AS total_vendido
      FROM ventas
      WHERE estado = 'Completada'
      GROUP BY DATE(fecha_venta), DATE_FORMAT(fecha_venta, '%d/%m/%Y')
      ORDER BY cantidad_ventas DESC, total_vendido DESC
      LIMIT 7
    `);

    res.json(dias);
  } catch (error) {
    console.error('Error al obtener días con más ventas:', error);

    res.status(500).json({
      mensaje: 'Error al obtener días con más ventas',
      error: error.message
    });
  }
};

/*
  Controlador para relacionar ventas e inventario.
  Compara unidades vendidas contra stock actual para apoyar decisiones gerenciales.
*/
const obtenerRelacionVentasInventario = async (req, res) => {
  try {
    const [productos] = await pool.query(`
      SELECT
        p.id_producto,
        p.nombre,
        c.nombre AS categoria,
        p.stock_actual,
        p.stock_minimo,
        p.precio_venta,
        COALESCE(SUM(CASE WHEN v.estado = 'Completada' THEN dv.cantidad ELSE 0 END), 0) AS unidades_vendidas,
        COALESCE(SUM(CASE WHEN v.estado = 'Completada' THEN dv.subtotal ELSE 0 END), 0) AS total_vendido
      FROM productos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN detalle_ventas dv ON p.id_producto = dv.id_producto
      LEFT JOIN ventas v ON dv.id_venta = v.id_venta
      WHERE p.estado IN ('Activo', 'Agotado')
      GROUP BY
        p.id_producto,
        p.nombre,
        c.nombre,
        p.stock_actual,
        p.stock_minimo,
        p.precio_venta
      ORDER BY unidades_vendidas DESC, p.stock_actual ASC
      LIMIT 10
    `);

    const resultado = productos.map((producto) => {
      const stockActual = Number(producto.stock_actual || 0);
      const stockMinimo = Number(producto.stock_minimo || 0);
      const unidadesVendidas = Number(producto.unidades_vendidas || 0);

      let situacion = 'Estable';
      let recomendacion = 'Mantener seguimiento normal';

      if (unidadesVendidas >= 5 && stockActual <= stockMinimo) {
        situacion = 'Alta demanda y bajo stock';
        recomendacion = 'Reponer inventario';
      } else if (unidadesVendidas <= 2 && stockActual > stockMinimo * 3) {
        situacion = 'Baja rotación y alto stock';
        recomendacion = 'Aplicar promoción';
      } else if (unidadesVendidas >= 5 && stockActual > stockMinimo) {
        situacion = 'Buena rotación';
        recomendacion = 'Mantener disponibilidad';
      } else if (unidadesVendidas === 0 && stockActual > 0) {
        situacion = 'Sin movimiento';
        recomendacion = 'Revisar precio o promoción';
      } else if (stockActual === 0) {
        situacion = 'Agotado';
        recomendacion = 'Evaluar reposición';
      }

      return {
        ...producto,
        stock_actual: stockActual,
        stock_minimo: stockMinimo,
        precio_venta: Number(producto.precio_venta || 0),
        unidades_vendidas: unidadesVendidas,
        total_vendido: Number(producto.total_vendido || 0),
        situacion,
        recomendacion
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener relación ventas e inventario:', error);

    res.status(500).json({
      mensaje: 'Error al obtener relación ventas e inventario',
      error: error.message
    });
  }
};

module.exports = {
  obtenerResumenDashboard,
  obtenerProductosStockBajo,
  obtenerProductosMasVendidos,
  obtenerVentasPorCategoria,
  obtenerVentasPorMes,
  obtenerProductosSugeridosPromocion,
  obtenerVentasPorVendedor,
  obtenerVentasPorEstado,
  obtenerDiasConMasVentas,
  obtenerRelacionVentasInventario
};