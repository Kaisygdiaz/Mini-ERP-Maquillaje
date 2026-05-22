const express = require('express');
const router = express.Router();

/*
  Importación de funciones del controlador de categorías.
  Incluye CRUD básico y control de estado para activar/inactivar categorías.
*/
const {
  obtenerCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  inactivarCategoria,
  activarCategoria,
  eliminarCategoria
} = require('../controllers/categoriasController');


router.get('/', obtenerCategorias);
router.get('/:id', obtenerCategoriaPorId);
router.post('/', crearCategoria);
router.put('/:id', actualizarCategoria);
router.put('/:id/inactivar', inactivarCategoria);
router.put('/:id/activar', activarCategoria);
router.delete('/:id', eliminarCategoria);

module.exports = router;