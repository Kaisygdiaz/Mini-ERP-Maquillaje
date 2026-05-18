const pool = require('../db/conexion');


const obtenerVentas = async (req, res) => {
  try {
    const [ventas] = await pool.query(`
      SELECT 
        v.id_venta,
        v.id_cliente,
        c.nombre AS cliente,
        v.id_usuario,
        u.nombre AS usuario,
        v.fecha_venta,
        v.total,
        v.metodo_pago,
        v.estado
      FROM ventas v
      LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
      INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
      ORDER BY v.id_venta DESC
    `);

    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas:', error);

    res.status(500).json({
      mensaje: 'Error al obtener las ventas',
      error: error.message
    });
  }
};


const obtenerVentaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [venta] = await pool.query(
      `
      SELECT 
        v.id_venta,
        v.id_cliente,
        c.nombre AS cliente,
        v.id_usuario,
        u.nombre AS usuario,
        v.fecha_venta,
        v.total,
        v.metodo_pago,
        v.estado
      FROM ventas v
      LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
      INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
      WHERE v.id_venta = ?
      `,
      [id]
    );

    if (venta.length === 0) {
      return res.status(404).json({
        mensaje: 'Venta no encontrada'
      });
    }

    const [detalle] = await pool.query(
      `
      SELECT 
        dv.id_detalle,
        dv.id_producto,
        p.nombre AS producto,
        dv.cantidad,
        dv.precio_unitario,
        dv.subtotal
      FROM detalle_ventas dv
      INNER JOIN productos p ON dv.id_producto = p.id_producto
      WHERE dv.id_venta = ?
      `,
      [id]
    );

    res.json({
      venta: venta[0],
      detalle
    });
  } catch (error) {
    console.error('Error al obtener venta:', error);

    res.status(500).json({
      mensaje: 'Error al obtener la venta',
      error: error.message
    });
  }
};


const crearVenta = async (req, res) => {
  const conexion = await pool.getConnection();

  try {
    const { id_cliente, id_usuario, metodo_pago, productos } = req.body;

    if (!id_usuario || !productos || productos.length === 0) {
      return res.status(400).json({
        mensaje: 'El usuario y los productos de la venta son obligatorios'
      });
    }

    await conexion.beginTransaction();

    let totalVenta = 0;

    /*
      Primero se valida que cada producto exista y tenga stock suficiente.
      También se calcula el total general de la venta.
    */
    for (const item of productos) {
      const { id_producto, cantidad } = item;

      if (!id_producto || !cantidad || cantidad <= 0) {
        throw new Error('Cada producto debe tener un ID válido y una cantidad mayor a cero');
      }

      const [productoBD] = await conexion.query(
        'SELECT id_producto, nombre, precio_venta, stock_actual FROM productos WHERE id_producto = ?',
        [id_producto]
      );

      if (productoBD.length === 0) {
        throw new Error(`El producto con ID ${id_producto} no existe`);
      }

      const producto = productoBD[0];

      if (producto.stock_actual < cantidad) {
        throw new Error(`Stock insuficiente para el producto: ${producto.nombre}`);
      }

      totalVenta += Number(producto.precio_venta) * Number(cantidad);
    }

    /*
      Se crea el encabezado de la venta.
    */
    const [resultadoVenta] = await conexion.query(
      `
      INSERT INTO ventas (id_cliente, id_usuario, total, metodo_pago, estado)
      VALUES (?, ?, ?, ?, 'Completada')
      `,
      [
        id_cliente || null,
        id_usuario,
        totalVenta,
        metodo_pago || 'Efectivo'
      ]
    );

    const idVenta = resultadoVenta.insertId;

    /*
      Se guarda el detalle de la venta, se descuenta el stock
      y se registra el movimiento de inventario como salida.
    */
    for (const item of productos) {
      const { id_producto, cantidad } = item;

      const [productoBD] = await conexion.query(
        'SELECT nombre, precio_venta FROM productos WHERE id_producto = ?',
        [id_producto]
      );

      const producto = productoBD[0];
      const precioUnitario = Number(producto.precio_venta);
      const subtotal = precioUnitario * Number(cantidad);

      await conexion.query(
        `
        INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
        `,
        [idVenta, id_producto, cantidad, precioUnitario, subtotal]
      );

      await conexion.query(
        `
        UPDATE productos
        SET stock_actual = stock_actual - ?
        WHERE id_producto = ?
        `,
        [cantidad, id_producto]
      );

      await conexion.query(
        `
        INSERT INTO movimientos_inventario (id_producto, tipo_movimiento, cantidad, descripcion, id_usuario)
        VALUES (?, 'Salida', ?, ?, ?)
        `,
        [
          id_producto,
          cantidad,
          `Salida por venta No. ${idVenta}`,
          id_usuario
        ]
      );
    }

    await conexion.commit();

    res.status(201).json({
      mensaje: 'Venta registrada correctamente',
      id_venta: idVenta,
      total: totalVenta
    });
  } catch (error) {
    await conexion.rollback();

    console.error('Error al crear venta:', error);

    res.status(500).json({
      mensaje: 'Error al registrar la venta',
      error: error.message
    });
  } finally {
    conexion.release();
  }
};

/*
  Controlador para anular una venta.
  Cambia el estado de la venta a Anulada, devuelve el stock de los productos
  y registra movimientos de inventario como ajuste.
*/
const anularVenta = async (req, res) => {
  const conexion = await pool.getConnection();

  try {
    const { id } = req.params;

    await conexion.beginTransaction();

    const [venta] = await conexion.query(
      'SELECT * FROM ventas WHERE id_venta = ?',
      [id]
    );

    if (venta.length === 0) {
      await conexion.rollback();

      return res.status(404).json({
        mensaje: 'Venta no encontrada'
      });
    }

    if (venta[0].estado === 'Anulada') {
      await conexion.rollback();

      return res.status(400).json({
        mensaje: 'La venta ya se encuentra anulada'
      });
    }

    const [detalle] = await conexion.query(
      'SELECT id_producto, cantidad FROM detalle_ventas WHERE id_venta = ?',
      [id]
    );

    for (const item of detalle) {
      await conexion.query(
        `
        UPDATE productos
        SET stock_actual = stock_actual + ?
        WHERE id_producto = ?
        `,
        [item.cantidad, item.id_producto]
      );

      await conexion.query(
        `
        INSERT INTO movimientos_inventario (id_producto, tipo_movimiento, cantidad, descripcion, id_usuario)
        VALUES (?, 'Ajuste', ?, ?, ?)
        `,
        [
          item.id_producto,
          item.cantidad,
          `Devolución de stock por anulación de venta No. ${id}`,
          venta[0].id_usuario
        ]
      );
    }

    await conexion.query(
      `
      UPDATE ventas
      SET estado = 'Anulada'
      WHERE id_venta = ?
      `,
      [id]
    );

    await conexion.commit();

    res.json({
      mensaje: 'Venta anulada correctamente y stock restaurado'
    });
  } catch (error) {
    await conexion.rollback();

    console.error('Error al anular venta:', error);

    res.status(500).json({
      mensaje: 'Error al anular la venta',
      error: error.message
    });
  } finally {
    conexion.release();
  }
};

module.exports = {
  obtenerVentas,
  obtenerVentaPorId,
  crearVenta,
  anularVenta
};