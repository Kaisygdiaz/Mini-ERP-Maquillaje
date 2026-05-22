const pool = require('../db/conexion');

/*
  Controlador para obtener todos los clientes registrados.
  Se ordenan de forma descendente para mostrar primero los más recientes.
*/
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

/*
  Controlador para obtener un cliente específico por ID.
*/
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

/*
  Controlador para crear un nuevo cliente.
  Se crea por defecto en estado Activo.
*/
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
      INSERT INTO clientes (nombre, telefono, correo, direccion, estado)
      VALUES (?, ?, ?, ?, 'Activo')
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

/*
  Controlador para actualizar los datos de un cliente existente.
  También permite mantener o cambiar el estado si se envía desde el frontend.
*/
const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, correo, direccion, estado } = req.body;

    if (!nombre) {
      return res.status(400).json({
        mensaje: 'El nombre del cliente es obligatorio'
      });
    }

    const [resultado] = await pool.query(
      `
      UPDATE clientes
      SET nombre = ?, telefono = ?, correo = ?, direccion = ?, estado = ?
      WHERE id_cliente = ?
      `,
      [
        nombre,
        telefono || null,
        correo || null,
        direccion || null,
        estado || 'Activo',
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

/*
  Controlador para inactivar un cliente.
  En un ERP real no se elimina el cliente si puede tener historial de ventas.
*/
const inactivarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      `
      UPDATE clientes
      SET estado = 'Inactivo'
      WHERE id_cliente = ?
      `,
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado'
      });
    }

    res.json({
      mensaje: 'Cliente inactivado correctamente'
    });
  } catch (error) {
    console.error('Error al inactivar cliente:', error);

    res.status(500).json({
      mensaje: 'Error al inactivar el cliente',
      error: error.message
    });
  }
};

/*
  Controlador para activar un cliente.
  Permite volver a utilizar un cliente inactivado.
*/
const activarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      `
      UPDATE clientes
      SET estado = 'Activo'
      WHERE id_cliente = ?
      `,
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado'
      });
    }

    res.json({
      mensaje: 'Cliente activado correctamente'
    });
  } catch (error) {
    console.error('Error al activar cliente:', error);

    res.status(500).json({
      mensaje: 'Error al activar el cliente',
      error: error.message
    });
  }
};

/*
  Controlador para eliminar físicamente un cliente.
  Se conserva como respaldo técnico, pero no se recomienda usarlo en la interfaz
  porque puede afectar historial o trazabilidad.
*/
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
  inactivarCliente,
  activarCliente,
  eliminarCliente
};