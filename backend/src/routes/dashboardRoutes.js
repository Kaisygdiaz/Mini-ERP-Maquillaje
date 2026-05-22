const express = require('express');
const router = express.Router();

const {
  obtenerResumenDashboard,
  obtenerProductosStockBajo,
  obtenerProductosMasVendidos,
  obtenerVentasPorCategoria,
  obtenerVentasPorMes,
  obtenerProductosSugeridosPromocion,
  obtenerVentasPorVendedor,
  obtenerVentasPorEstado,
  obtenerDiasConMasVentas,
  obtenerRelacionVentasInventario
} = require('../controllers/dashboardController');

router.get('/resumen', obtenerResumenDashboard);
router.get('/stock-bajo', obtenerProductosStockBajo);
router.get('/productos-mas-vendidos', obtenerProductosMasVendidos);
router.get('/ventas-por-categoria', obtenerVentasPorCategoria);
router.get('/ventas-por-mes', obtenerVentasPorMes);
router.get('/productos-promocion', obtenerProductosSugeridosPromocion);

router.get('/ventas-por-vendedor', obtenerVentasPorVendedor);
router.get('/ventas-por-estado', obtenerVentasPorEstado);
router.get('/dias-con-mas-ventas', obtenerDiasConMasVentas);
router.get('/relacion-ventas-inventario', obtenerRelacionVentasInventario);

module.exports = router;