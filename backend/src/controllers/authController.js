const bcrypt = require('bcryptjs');
const pool = require('../db/conexion');

/*
  Controlador para iniciar sesión.
  Busca el usuario por correo, valida que esté activo y verifica la contraseña.
*/
const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({
        mensaje: 'El correo y la contraseña son obligatorios'
      });
    }

    const [usuarios] = await pool.query(
      `
      SELECT id_usuario, nombre, correo, contrasena, rol, estado
      FROM usuarios
      WHERE correo = ?
      `,
      [correo]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        mensaje: 'Credenciales incorrectas'
      });
    }

    const usuario = usuarios[0];

    if (usuario.estado !== 'Activo') {
      return res.status(403).json({
        mensaje: 'El usuario se encuentra inactivo'
      });
    }

    let contrasenaValida = false;

    /*
      Permite validar contraseñas antiguas en texto plano y también
      contraseñas nuevas encriptadas con bcrypt.
    */
    if (
      usuario.contrasena.startsWith('$2a$') ||
      usuario.contrasena.startsWith('$2b$')
    ) {
      contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    } else {
      contrasenaValida = contrasena === usuario.contrasena;
    }

    if (!contrasenaValida) {
      return res.status(401).json({
        mensaje: 'Credenciales incorrectas'
      });
    }

    res.json({
      mensaje: 'Inicio de sesión correcto',
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);

    res.status(500).json({
      mensaje: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

/*
  Controlador para registrar usuarios.
  Guarda la contraseña encriptada para mejorar la seguridad del sistema.
*/
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, correo, contrasena, rol, estado } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({
        mensaje: 'Nombre, correo y contraseña son obligatorios'
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
      mensaje: 'Usuario registrado correctamente',
      id_usuario: resultado.insertId
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);

    res.status(500).json({
      mensaje: 'Error al registrar usuario',
      error: error.message
    });
  }
};

module.exports = {
  login,
  registrarUsuario
};