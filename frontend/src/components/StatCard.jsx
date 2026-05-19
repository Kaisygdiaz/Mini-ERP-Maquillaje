/*
  Componente reutilizable para mostrar indicadores del dashboard.
  Recibe título, valor y descripción.
*/
const StatCard = ({ titulo, valor, descripcion }) => {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <p className="text-muted mb-1">{titulo}</p>
        <h3 className="fw-bold mb-1">{valor}</h3>
        <small className="text-muted">{descripcion}</small>
      </div>
    </div>
  );
};

export default StatCard;