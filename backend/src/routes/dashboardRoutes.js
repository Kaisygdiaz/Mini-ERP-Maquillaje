const express = require('express');
const router = express.Router();


const {
  obtenerResumenDashboard,
  obtenerProductosStockBajo,
  obtenerProductosMasVendidos,
  obtenerVentasPorCategoria,
  obtenerVentasPorMes,
  obtenerProductosSugeridosPromocion
} = require('../controllers/dashboardController');


router.get('/resumen', obtenerResumenDashboard);
router.get('/stock-bajo', obtenerProductosStockBajo);
router.get('/productos-mas-vendidos', obtenerProductosMasVendidos);
router.get('/ventas-por-categoria', obtenerVentasPorCategoria);
router.get('/ventas-por-mes', obtenerVentasPorMes);
router.get('/productos-promocion', obtenerProductosSugeridosPromocion);

module.exports = router;