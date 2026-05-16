const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db/conexion');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API del Mini ERP de Maquillaje funcionando correctamente');
});

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

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor backend ejecutándose en http://localhost:${PORT}`);
});