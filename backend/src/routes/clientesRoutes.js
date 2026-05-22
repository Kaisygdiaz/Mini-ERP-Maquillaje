const express = require('express');
const router = express.Router();

/*
  Importación de funciones del controlador de clientes.
  Incluye CRUD básico y control de estado para activar/inactivar clientes.
*/
const {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  inactivarCliente,
  activarCliente,
  eliminarCliente
} = require('../controllers/clientesController');


router.get('/', obtenerClientes);
router.get('/:id', obtenerClientePorId);
router.post('/', crearCliente);
router.put('/:id', actualizarCliente);
router.put('/:id/inactivar', inactivarCliente);
router.put('/:id/activar', activarCliente);
router.delete('/:id', eliminarCliente);

module.exports = router;