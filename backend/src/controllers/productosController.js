const pool = require('../db/conexion');


const obtenerProductos = async (req, res) => {
  try {
    const [productos] = await pool.query(`
      SELECT 
        p.id_producto,
        p.id_categoria,
        c.nombre AS categoria,
        p.nombre,
        p.marca,
        p.descripcion,
        p.precio_compra,
        p.precio_venta,
        p.stock_actual,
        p.stock_minimo,
        p.fecha_ingreso,
        p.estado,
        p.fecha_creacion
      FROM productos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      ORDER BY p.id_producto DESC
    `);

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);

    res.status(500).json({
      mensaje: 'Error al obtener los productos',
      error: error.message
    });
  }
};


const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [producto] = await pool.query(
      `
      SELECT 
        p.id_producto,
        p.id_categoria,
        c.nombre AS categoria,
        p.nombre,
        p.marca,
        p.descripcion,
        p.precio_compra,
        p.precio_venta,
        p.stock_actual,
        p.stock_minimo,
        p.fecha_ingreso,
        p.estado,
        p.fecha_creacion
      FROM productos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE p.id_producto = ?
      `,
      [id]
    );

    if (producto.length === 0) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    res.json(producto[0]);
  } catch (error) {
    console.error('Error al obtener producto:', error);

    res.status(500).json({
      mensaje: 'Error al obtener el producto',
      error: error.message
    });
  }
};


const crearProducto = async (req, res) => {
  try {
    const {
      id_categoria,
      nombre,
      marca,
      descripcion,
      precio_compra,
      precio_venta,
      stock_actual,
      stock_minimo,
      fecha_ingreso,
      estado
    } = req.body;

    if (!id_categoria || !nombre || !precio_compra || !precio_venta) {
      return res.status(400).json({
        mensaje: 'La categoría, nombre, precio de compra y precio de venta son obligatorios'
      });
    }

    const [resultado] = await pool.query(
      `
      INSERT INTO productos (
        id_categoria,
        nombre,
        marca,
        descripcion,
        precio_compra,
        precio_venta,
        stock_actual,
        stock_minimo,
        fecha_ingreso,
        estado
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id_categoria,
        nombre,
        marca || null,
        descripcion || null,
        precio_compra,
        precio_venta,
        stock_actual || 0,
        stock_minimo || 5,
        fecha_ingreso || null,
        estado || 'Activo'
      ]
    );

    res.status(201).json({
      mensaje: 'Producto creado correctamente',
      id_producto: resultado.insertId
    });
  } catch (error) {
    console.error('Error al crear producto:', error);

    res.status(500).json({
      mensaje: 'Error al crear el producto',
      error: error.message
    });
  }
};


const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      id_categoria,
      nombre,
      marca,
      descripcion,
      precio_compra,
      precio_venta,
      stock_actual,
      stock_minimo,
      fecha_ingreso,
      estado
    } = req.body;

    if (!id_categoria || !nombre || !precio_compra || !precio_venta) {
      return res.status(400).json({
        mensaje: 'La categoría, nombre, precio de compra y precio de venta son obligatorios'
      });
    }

    const [resultado] = await pool.query(
      `
      UPDATE productos
      SET 
        id_categoria = ?,
        nombre = ?,
        marca = ?,
        descripcion = ?,
        precio_compra = ?,
        precio_venta = ?,
        stock_actual = ?,
        stock_minimo = ?,
        fecha_ingreso = ?,
        estado = ?
      WHERE id_producto = ?
      `,
      [
        id_categoria,
        nombre,
        marca || null,
        descripcion || null,
        precio_compra,
        precio_venta,
        stock_actual || 0,
        stock_minimo || 5,
        fecha_ingreso || null,
        estado || 'Activo',
        id
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    res.json({
      mensaje: 'Producto actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);

    res.status(500).json({
      mensaje: 'Error al actualizar el producto',
      error: error.message
    });
  }
};


const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      'DELETE FROM productos WHERE id_producto = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    res.json({
      mensaje: 'Producto eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);

    res.status(500).json({
      mensaje: 'Error al eliminar el producto. Puede estar relacionado con ventas o movimientos de inventario.',
      error: error.message
    });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};