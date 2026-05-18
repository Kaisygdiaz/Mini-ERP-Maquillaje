const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db/conexion');
const categoriasRoutes = require('./routes/categoriasRoutes');
const productosRoutes = require('./routes/productosRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const ventasRoutes = require('./routes/ventasRoutes');

const app = express();

/*
  CORS permite que el frontend pueda comunicarse con el backend.
  express.json permite recibir datos en formato JSON desde las peticiones.
*/
app.use(cors());
app.use(express.json());


app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/ventas', ventasRoutes);

/*
  Ruta principal de prueba.
*/
app.get('/', (req, res) => {
  res.send('API del Mini ERP de Maquillaje funcionando correctamente');
});

/*
  Esta ruta confirma que el backend está conectado a la base de datos correcta.
*/
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DATABASE() AS base_datos');

    res.json({
      mensaje: 'Conexión a MySQL realizada correctamente',
      base_datos: rows[0].base_datos
    });
  } catch (error) {
    console.error('Error al conectar con MySQL:', error);

    res.status(500).json({
      mensaje: 'Error al conectar con MySQL',
      error: error.message
    });
  }
});

/*
  Puerto del servidor.
*/
const PORT = process.env.PORT || 4000;

/*
  Inicio del servidor backend.
*/
app.listen(PORT, () => {
  console.log(`Servidor backend ejecutándose en http://localhost:${PORT}`);
});