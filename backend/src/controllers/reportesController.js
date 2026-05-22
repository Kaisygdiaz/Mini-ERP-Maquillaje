const pool = require('../db/conexion');

/*
  Permite filtrar por fecha inicial, fecha final, estado y método de pago.
*/
const obtenerReporteVentas = async (req, res) => {
  try {
    const {
      fecha_inicio,
      fecha_fin,
      estado,
      metodo_pago
    } = req.query;

    let condiciones = [];
    let valores = [];

    if (fecha_inicio) {
      condiciones.push('DATE(v.fecha_venta) >= ?');
      valores.push(fecha_inicio);
    }

    if (fecha_fin) {
      condiciones.push('DATE(v.fecha_venta) <= ?');
      valores.push(fecha_fin);
    }

    if (estado) {
      condiciones.push('v.estado = ?');
      valores.push(estado);
    }

    if (metodo_pago) {
      condiciones.push('v.metodo_pago = ?');
      valores.push(metodo_pago);
    }

    const whereSQL = condiciones.length > 0
      ? `WHERE ${condiciones.join(' AND ')}`
      : '';

    const [ventas] = await pool.query(
      `
      SELECT
        v.id_venta,
        v.fecha_venta,
        v.total,
        v.metodo_pago,
        v.estado,
        c.nombre AS cliente,
        u.nombre AS usuario
      FROM ventas v
      LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
      INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
      ${whereSQL}
      ORDER BY v.fecha_venta DESC, v.id_venta DESC
      `,
      valores
    );

    const [resumen] = await pool.query(
      `
      SELECT
        COUNT(v.id_venta) AS cantidad_ventas,
        COALESCE(SUM(CASE WHEN v.estado = 'Completada' THEN v.total ELSE 0 END), 0) AS total_completado,
        COALESCE(SUM(CASE WHEN v.estado = 'Anulada' THEN v.total ELSE 0 END), 0) AS total_anulado,
        COALESCE(SUM(v.total), 0) AS total_general
      FROM ventas v
      LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
      INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
      ${whereSQL}
      `,
      valores
    );

    res.json({
      resumen: resumen[0],
      ventas
    });
  } catch (error) {
    console.error('Error al obtener reporte de ventas:', error);

    res.status(500).json({
      mensaje: 'Error al obtener reporte de ventas',
      error: error.message
    });
  }
};

/*
  Reporte de ventas agrupadas por método de pago.
  Ayuda a identificar cómo pagan más los clientes.
*/
const obtenerVentasPorMetodoPago = async (req, res) => {
  try {
    const [datos] = await pool.query(`
      SELECT
        metodo_pago,
        COUNT(id_venta) AS cantidad_ventas,
        COALESCE(SUM(total), 0) AS total_vendido
      FROM ventas
      WHERE estado = 'Completada'
      GROUP BY metodo_pago
      ORDER BY total_vendido DESC
    `);

    res.json(datos);
  } catch (error) {
    console.error('Error al obtener ventas por método de pago:', error);

    res.status(500).json({
      mensaje: 'Error al obtener ventas por método de pago',
      error: error.message
    });
  }
};

/*
  Reporte de ventas por cliente.
  Permite identificar clientes con mayor valor de compra.
*/
const obtenerVentasPorCliente = async (req, res) => {
  try {
    const [datos] = await pool.query(`
      SELECT
        c.id_cliente,
        c.nombre AS cliente,
        COUNT(v.id_venta) AS cantidad_compras,
        COALESCE(SUM(v.total), 0) AS total_comprado
      FROM ventas v
      LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
      WHERE v.estado = 'Completada'
      GROUP BY c.id_cliente, c.nombre
      ORDER BY total_comprado DESC
      LIMIT 10
    `);

    res.json(datos);
  } catch (error) {
    console.error('Error al obtener ventas por cliente:', error);

    res.status(500).json({
      mensaje: 'Error al obtener ventas por cliente',
      error: error.message
    });
  }
};

module.exports = {
  obtenerReporteVentas,
  obtenerVentasPorMetodoPago,
  obtenerVentasPorCliente
};