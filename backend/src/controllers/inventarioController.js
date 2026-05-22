const pool = require('../db/conexion');

/*
  Controlador para obtener todos los movimientos de inventario.
  Muestra producto, tipo de movimiento, cantidad, descripción, fecha y usuario responsable.
*/
const obtenerMovimientosInventario = async (req, res) => {
  try {
    const [movimientos] = await pool.query(`
      SELECT 
        mi.id_movimiento,
        mi.id_producto,
        p.nombre AS producto,
        c.nombre AS categoria,
        mi.tipo_movimiento,
        mi.cantidad,
        mi.descripcion,
        mi.fecha_movimiento,
        mi.id_usuario,
        u.nombre AS usuario
      FROM movimientos_inventario mi
      INNER JOIN productos p ON mi.id_producto = p.id_producto
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN usuarios u ON mi.id_usuario = u.id_usuario
      ORDER BY mi.fecha_movimiento DESC, mi.id_movimiento DESC
    `);

    res.json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos de inventario:', error);

    res.status(500).json({
      mensaje: 'Error al obtener movimientos de inventario',
      error: error.message
    });
  }
};

/*
  Controlador para obtener el inventario actual.
  Muestra productos con stock, stock mínimo, estado y valor estimado.
*/
const obtenerInventarioActual = async (req, res) => {
  try {
    const [inventario] = await pool.query(`
      SELECT
        p.id_producto,
        p.nombre,
        p.marca,
        c.nombre AS categoria,
        p.precio_compra,
        p.precio_venta,
        p.stock_actual,
        p.stock_minimo,
        p.estado,
        (p.stock_actual * p.precio_compra) AS valor_compra,
        (p.stock_actual * p.precio_venta) AS valor_venta
      FROM productos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      ORDER BY p.nombre ASC
    `);

    res.json(inventario);
  } catch (error) {
    console.error('Error al obtener inventario actual:', error);

    res.status(500).json({
      mensaje: 'Error al obtener inventario actual',
      error: error.message
    });
  }
};

/*
  Controlador para registrar una entrada manual de inventario.
  Suma unidades al stock del producto y registra el movimiento.
*/
const registrarEntradaInventario = async (req, res) => {
  const conexion = await pool.getConnection();

  try {
    const { id_producto, cantidad, descripcion, id_usuario } = req.body;

    if (!id_producto || !cantidad || cantidad <= 0 || !id_usuario) {
      return res.status(400).json({
        mensaje: 'Producto, cantidad y usuario son obligatorios'
      });
    }

    await conexion.beginTransaction();

    const [producto] = await conexion.query(
      'SELECT id_producto, nombre FROM productos WHERE id_producto = ?',
      [id_producto]
    );

    if (producto.length === 0) {
      await conexion.rollback();

      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    await conexion.query(
      `
      UPDATE productos
      SET stock_actual = stock_actual + ?
      WHERE id_producto = ?
      `,
      [cantidad, id_producto]
    );

    await conexion.query(
      `
      INSERT INTO movimientos_inventario (
        id_producto,
        tipo_movimiento,
        cantidad,
        descripcion,
        id_usuario
      )
      VALUES (?, 'Entrada', ?, ?, ?)
      `,
      [
        id_producto,
        cantidad,
        descripcion || 'Entrada manual de inventario',
        id_usuario
      ]
    );

    await conexion.commit();

    res.status(201).json({
      mensaje: 'Entrada de inventario registrada correctamente'
    });
  } catch (error) {
    await conexion.rollback();

    console.error('Error al registrar entrada de inventario:', error);

    res.status(500).json({
      mensaje: 'Error al registrar entrada de inventario',
      error: error.message
    });
  } finally {
    conexion.release();
  }
};

/*
  Controlador para registrar un ajuste manual de inventario.
  Permite sumar o restar stock dejando trazabilidad del cambio.
*/
const registrarAjusteInventario = async (req, res) => {
  const conexion = await pool.getConnection();

  try {
    const { id_producto, cantidad, descripcion, id_usuario } = req.body;

    if (!id_producto || !cantidad || !id_usuario) {
      return res.status(400).json({
        mensaje: 'Producto, cantidad y usuario son obligatorios'
      });
    }

    await conexion.beginTransaction();

    const [producto] = await conexion.query(
      'SELECT id_producto, nombre, stock_actual FROM productos WHERE id_producto = ?',
      [id_producto]
    );

    if (producto.length === 0) {
      await conexion.rollback();

      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    const nuevoStock = Number(producto[0].stock_actual) + Number(cantidad);

    if (nuevoStock < 0) {
      await conexion.rollback();

      return res.status(400).json({
        mensaje: 'El ajuste no puede dejar el stock en negativo'
      });
    }

    await conexion.query(
      `
      UPDATE productos
      SET stock_actual = ?
      WHERE id_producto = ?
      `,
      [nuevoStock, id_producto]
    );

    await conexion.query(
      `
      INSERT INTO movimientos_inventario (
        id_producto,
        tipo_movimiento,
        cantidad,
        descripcion,
        id_usuario
      )
      VALUES (?, 'Ajuste', ?, ?, ?)
      `,
      [
        id_producto,
        cantidad,
        descripcion || 'Ajuste manual de inventario',
        id_usuario
      ]
    );

    await conexion.commit();

    res.status(201).json({
      mensaje: 'Ajuste de inventario registrado correctamente',
      stock_actual: nuevoStock
    });
  } catch (error) {
    await conexion.rollback();

    console.error('Error al registrar ajuste de inventario:', error);

    res.status(500).json({
      mensaje: 'Error al registrar ajuste de inventario',
      error: error.message
    });
  } finally {
    conexion.release();
  }
};

module.exports = {
  obtenerMovimientosInventario,
  obtenerInventarioActual,
  registrarEntradaInventario,
  registrarAjusteInventario
};