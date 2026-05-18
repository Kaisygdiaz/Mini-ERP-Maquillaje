const pool = require('../db/conexion');


const obtenerClientes = async (req, res) => {
  try {
    const [clientes] = await pool.query(
      'SELECT * FROM clientes ORDER BY id_cliente DESC'
    );

    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);

    res.status(500).json({
      mensaje: 'Error al obtener los clientes',
      error: error.message
    });
  }
};


const obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [cliente] = await pool.query(
      'SELECT * FROM clientes WHERE id_cliente = ?',
      [id]
    );

    if (cliente.length === 0) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado'
      });
    }

    res.json(cliente[0]);
  } catch (error) {
    console.error('Error al obtener cliente:', error);

    res.status(500).json({
      mensaje: 'Error al obtener el cliente',
      error: error.message
    });
  }
};


const crearCliente = async (req, res) => {
  try {
    const { nombre, telefono, correo, direccion } = req.body;

    if (!nombre) {
      return res.status(400).json({
        mensaje: 'El nombre del cliente es obligatorio'
      });
    }

    const [resultado] = await pool.query(
      `
      INSERT INTO clientes (nombre, telefono, correo, direccion)
      VALUES (?, ?, ?, ?)
      `,
      [
        nombre,
        telefono || null,
        correo || null,
        direccion || null
      ]
    );

    res.status(201).json({
      mensaje: 'Cliente creado correctamente',
      id_cliente: resultado.insertId
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);

    res.status(500).json({
      mensaje: 'Error al crear el cliente',
      error: error.message
    });
  }
};


const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, correo, direccion } = req.body;

    if (!nombre) {
      return res.status(400).json({
        mensaje: 'El nombre del cliente es obligatorio'
      });
    }

    const [resultado] = await pool.query(
      `
      UPDATE clientes
      SET nombre = ?, telefono = ?, correo = ?, direccion = ?
      WHERE id_cliente = ?
      `,
      [
        nombre,
        telefono || null,
        correo || null,
        direccion || null,
        id
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado'
      });
    }

    res.json({
      mensaje: 'Cliente actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);

    res.status(500).json({
      mensaje: 'Error al actualizar el cliente',
      error: error.message
    });
  }
};


const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      'DELETE FROM clientes WHERE id_cliente = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado'
      });
    }

    res.json({
      mensaje: 'Cliente eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);

    res.status(500).json({
      mensaje: 'Error al eliminar el cliente',
      error: error.message
    });
  }
};

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente
};