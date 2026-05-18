const pool = require('../db/conexion');

const obtenerCategorias = async (req, res) => {
  try {
    const [categorias] = await pool.query(
      'SELECT * FROM categorias ORDER BY id_categoria DESC'
    );

    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      mensaje: 'Error al obtener las categorías',
      error: error.message
    });
  }
};

const obtenerCategoriaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [categoria] = await pool.query(
      'SELECT * FROM categorias WHERE id_categoria = ?',
      [id]
    );

    if (categoria.length === 0) {
      return res.status(404).json({
        mensaje: 'Categoría no encontrada'
      });
    }

    res.json(categoria[0]);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({
      mensaje: 'Error al obtener la categoría',
      error: error.message
    });
  }
};

const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion, estado } = req.body;

    if (!nombre) {
      return res.status(400).json({
        mensaje: 'El nombre de la categoría es obligatorio'
      });
    }

    const [resultado] = await pool.query(
      `INSERT INTO categorias (nombre, descripcion, estado)
       VALUES (?, ?, ?)`,
      [nombre, descripcion || null, estado || 'Activo']
    );

    res.status(201).json({
      mensaje: 'Categoría creada correctamente',
      id_categoria: resultado.insertId
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      mensaje: 'Error al crear la categoría',
      error: error.message
    });
  }
};

const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estado } = req.body;

    if (!nombre) {
      return res.status(400).json({
        mensaje: 'El nombre de la categoría es obligatorio'
      });
    }

    const [resultado] = await pool.query(
      `UPDATE categorias
       SET nombre = ?, descripcion = ?, estado = ?
       WHERE id_categoria = ?`,
      [nombre, descripcion || null, estado || 'Activo', id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Categoría no encontrada'
      });
    }

    res.json({
      mensaje: 'Categoría actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      mensaje: 'Error al actualizar la categoría',
      error: error.message
    });
  }
};

const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      'DELETE FROM categorias WHERE id_categoria = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Categoría no encontrada'
      });
    }

    res.json({
      mensaje: 'Categoría eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      mensaje: 'Error al eliminar la categoría. Puede estar relacionada con productos existentes.',
      error: error.message
    });
  }
};

module.exports = {
  obtenerCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
};