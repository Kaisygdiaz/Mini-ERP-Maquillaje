const express = require('express');
const router = express.Router();

/*
  Rutas de reportes gerenciales.
  Permiten consultar ventas con filtros y análisis por método de pago o cliente.
*/
const {
  obtenerReporteVentas,
  obtenerVentasPorMetodoPago,
  obtenerVentasPorCliente
} = require('../controllers/reportesController');

router.get('/ventas', obtenerReporteVentas);
router.get('/ventas/metodo-pago', obtenerVentasPorMetodoPago);
router.get('/ventas/clientes', obtenerVentasPorCliente);

module.exports = router;