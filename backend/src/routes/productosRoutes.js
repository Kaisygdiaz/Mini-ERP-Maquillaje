const express = require('express');
const router = express.Router();

/*
  Importación de funciones del controlador de productos.
*/
const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/productosController');

/*
  Rutas del módulo de productos.
*/
router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;