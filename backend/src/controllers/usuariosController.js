const bcrypt = require('bcryptjs');
const pool = require('../db/conexion');

/*
  Controlador para obtener todos los usuarios del sistema.
*/
const obtenerUsuarios = async (req, res) => {
  try {
    const [usuarios] = await pool.query(`
      SELECT 
        id_usuario,
        nombre,
        correo,
        rol,
        estado,
        fecha_creacion
      FROM usuarios
      ORDER BY id_usuario DESC
    `);

    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);

    res.status(500).json({
      mensaje: 'Error al obtener los usuarios',
      error: error.message
    });
  }
};

/*
  Controlador para obtener un usuario específico por ID.
*/
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [usuario] = await pool.query(
      `
      SELECT 
        id_usuario,
        nombre,
        correo,
        rol,
        estado,
        fecha_creacion
      FROM usuarios
      WHERE id_usuario = ?
      `,
      [id]
    );

    if (usuario.length === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    res.json(usuario[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);

    res.status(500).json({
      mensaje: 'Error al obtener el usuario',
      error: error.message
    });
  }
};

/*
  Controlador para crear un nuevo usuario.
  La contraseña se guarda encriptada con bcrypt.
*/
const crearUsuario = async (req, res) => {
  try {
    const { nombre, correo, contrasena, rol, estado } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({
        mensaje: 'Nombre, correo y contraseña son obligatorios'
      });
    }

    const [usuarioExistente] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (usuarioExistente.length > 0) {
      return res.status(400).json({
        mensaje: 'Ya existe un usuario registrado con ese correo'
      });
    }

    const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);

    const [resultado] = await pool.query(
      `
      INSERT INTO usuarios (nombre, correo, contrasena, rol, estado)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        nombre,
        correo,
        contrasenaEncriptada,
        rol || 'Vendedor',
        estado || 'Activo'
      ]
    );

    res.status(201).json({
      mensaje: 'Usuario creado correctamente',
      id_usuario: resultado.insertId
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);

    res.status(500).json({
      mensaje: 'Error al crear el usuario',
      error: error.message
    });
  }
};

/*
  Controlador para actualizar un usuario.
  Si se envía una nueva contraseña, se encripta y se actualiza.
  Si no se envía contraseña, se conservan las credenciales actuales.
*/
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, contrasena, rol, estado } = req.body;

    if (!nombre || !correo || !rol || !estado) {
      return res.status(400).json({
        mensaje: 'Nombre, correo, rol y estado son obligatorios'
      });
    }

    const [usuarioActual] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    if (usuarioActual.length === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    const [correoExistente] = await pool.query(
      `
      SELECT id_usuario 
      FROM usuarios 
      WHERE correo = ?
      AND id_usuario <> ?
      `,
      [correo, id]
    );

    if (correoExistente.length > 0) {
      return res.status(400).json({
        mensaje: 'El correo ya está asignado a otro usuario'
      });
    }

    if (contrasena && contrasena.trim() !== '') {
      const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);

      await pool.query(
        `
        UPDATE usuarios
        SET nombre = ?, correo = ?, contrasena = ?, rol = ?, estado = ?
        WHERE id_usuario = ?
        `,
        [nombre, correo, contrasenaEncriptada, rol, estado, id]
      );
    } else {
      await pool.query(
        `
        UPDATE usuarios
        SET nombre = ?, correo = ?, rol = ?, estado = ?
        WHERE id_usuario = ?
        `,
        [nombre, correo, rol, estado, id]
      );
    }

    res.json({
      mensaje: 'Usuario actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);

    res.status(500).json({
      mensaje: 'Error al actualizar el usuario',
      error: error.message
    });
  }
};

/*
  Controlador para inactivar un usuario.
  Se conserva el registro para mantener trazabilidad.
*/
const inactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      `
      UPDATE usuarios
      SET estado = 'Inactivo'
      WHERE id_usuario = ?
      `,
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    res.json({
      mensaje: 'Usuario inactivado correctamente'
    });
  } catch (error) {
    console.error('Error al inactivar usuario:', error);

    res.status(500).json({
      mensaje: 'Error al inactivar el usuario',
      error: error.message
    });
  }
};

/*
  Controlador para activar un usuario.
*/
const activarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      `
      UPDATE usuarios
      SET estado = 'Activo'
      WHERE id_usuario = ?
      `,
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    res.json({
      mensaje: 'Usuario activado correctamente'
    });
  } catch (error) {
    console.error('Error al activar usuario:', error);

    res.status(500).json({
      mensaje: 'Error al activar el usuario',
      error: error.message
    });
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  inactivarUsuario,
  activarUsuario
};