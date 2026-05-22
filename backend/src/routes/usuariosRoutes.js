const express = require('express');
const router = express.Router();

const {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  inactivarUsuario,
  activarUsuario
} = require('../controllers/usuariosController');

router.get('/', obtenerUsuarios);
router.get('/:id', obtenerUsuarioPorId);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.put('/:id/inactivar', inactivarUsuario);
router.put('/:id/activar', activarUsuario);

module.exports = router;