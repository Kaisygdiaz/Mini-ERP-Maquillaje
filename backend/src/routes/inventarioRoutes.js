const express = require('express');
const router = express.Router();

/*
  Importación de funciones del controlador de inventario.
  Permite consultar inventario, movimientos y registrar ajustes.
*/
const {
  obtenerMovimientosInventario,
  obtenerInventarioActual,
  registrarEntradaInventario,
  registrarAjusteInventario
} = require('../controllers/inventarioController');

router.get('/', obtenerInventarioActual);
router.get('/movimientos', obtenerMovimientosInventario);
router.post('/entrada', registrarEntradaInventario);
router.post('/ajuste', registrarAjusteInventario);

module.exports = router;