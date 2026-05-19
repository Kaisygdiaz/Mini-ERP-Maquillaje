import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import './styles/dashboard.css';

const Productos = () => <h2 className="page-title">Productos</h2>;
const Categorias = () => <h2 className="page-title">Categorías</h2>;
const Clientes = () => <h2 className="page-title">Clientes</h2>;
const Ventas = () => <h2 className="page-title">Ventas</h2>;

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/ventas" element={<Ventas />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;