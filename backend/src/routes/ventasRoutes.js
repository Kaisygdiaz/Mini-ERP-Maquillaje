const express = require('express');
const router = express.Router();


const {
  obtenerVentas,
  obtenerVentaPorId,
  crearVenta,
  anularVenta
} = require('../controllers/ventasController');


router.get('/', obtenerVentas);
router.get('/:id', obtenerVentaPorId);
router.post('/', crearVenta);
router.put('/:id/anular', anularVenta);

module.exports = router;