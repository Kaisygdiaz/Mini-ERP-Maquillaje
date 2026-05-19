import axios from 'axios';

/*
  Configuración base de Axios.
  Aquí se define la URL principal del backend para reutilizarla en todo el frontend.
*/
const api = axios.create({
  baseURL: 'http://localhost:4000/api'
});

export default api;