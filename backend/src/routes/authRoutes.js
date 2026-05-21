const express = require('express');
const router = express.Router();

const {
  login,
  registrarUsuario
} = require('../controllers/authController');

/*
  Rutas de autenticación del sistema.
*/
router.post('/login', login);
router.post('/registrar', registrarUsuario);

module.exports = router;