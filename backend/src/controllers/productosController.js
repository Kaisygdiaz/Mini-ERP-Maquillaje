const pool = require('../db/conexion');

/*
  Controlador para obtener todos los productos.
  Incluye el nombre de la categoría mediante un JOIN.
*/
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

/*
  Controlador para obtener un producto específico por ID.
*/
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

/*
  Controlador para crear un nuevo producto.
  Valida los campos principales antes de guardar.
*/
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

/*
  Controlador para actualizar un producto existente.
*/
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

/*
  Controlador para inactivar un producto.
  En un ERP real no se elimina el producto si puede tener historial.
  Se cambia su estado a Inactivo para conservar registros de ventas e inventario.
*/
const inactivarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      `
      UPDATE productos
      SET estado = 'Inactivo'
      WHERE id_producto = ?
      `,
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    res.json({
      mensaje: 'Producto inactivado correctamente'
    });
  } catch (error) {
    console.error('Error al inactivar producto:', error);

    res.status(500).json({
      mensaje: 'Error al inactivar el producto',
      error: error.message
    });
  }
};

/*
  Controlador para activar un producto.
  Permite volver a utilizar un producto que había sido inactivado.
*/
const activarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      `
      UPDATE productos
      SET estado = 'Activo'
      WHERE id_producto = ?
      `,
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    res.json({
      mensaje: 'Producto activado correctamente'
    });
  } catch (error) {
    console.error('Error al activar producto:', error);

    res.status(500).json({
      mensaje: 'Error al activar el producto',
      error: error.message
    });
  }
};

/*
  Controlador para marcar un producto como agotado.
  Se puede usar cuando el stock llega a cero o cuando administración desea marcarlo manualmente.
*/
const marcarProductoAgotado = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      `
      UPDATE productos
      SET estado = 'Agotado'
      WHERE id_producto = ?
      `,
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    res.json({
      mensaje: 'Producto marcado como agotado correctamente'
    });
  } catch (error) {
    console.error('Error al marcar producto como agotado:', error);

    res.status(500).json({
      mensaje: 'Error al marcar el producto como agotado',
      error: error.message
    });
  }
};

/*
  Controlador para eliminar físicamente un producto.
  Se mantiene solo como respaldo técnico, pero no se recomienda usarlo en el frontend
  porque puede afectar historial de ventas e inventario.
*/
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
  inactivarProducto,
  activarProducto,
  marcarProductoAgotado,
  eliminarProducto
};