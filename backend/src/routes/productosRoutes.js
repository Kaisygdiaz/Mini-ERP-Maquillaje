const express = require('express');
const router = express.Router();

/*
  Importación de funciones del controlador de productos.
  Incluye CRUD básico y control de estado para activar/inactivar productos.
*/
const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  inactivarProducto,
  activarProducto,
  marcarProductoAgotado,
  eliminarProducto
} = require('../controllers/productosController');

/*
  Rutas del módulo de productos.
*/
router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.put('/:id/inactivar', inactivarProducto);
router.put('/:id/activar', activarProducto);
router.put('/:id/agotado', marcarProductoAgotado);
router.delete('/:id', eliminarProducto);

module.exports = router;