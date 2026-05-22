const StatCard = ({ titulo, valor, descripcion, variant = 'default' }) => {
  return (
    <div className={`stat-card stat-card-${variant}`}>
      <div className="stat-card-top">
        <span className="stat-card-label">{titulo}</span>
        <span className="stat-card-accent"></span>
      </div>

      <div className="stat-card-value">{valor}</div>

      <p className="stat-card-description">{descripcion}</p>
    </div>
  );
};

export default StatCard;