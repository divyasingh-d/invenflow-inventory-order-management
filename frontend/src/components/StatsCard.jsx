export default function StatsCard({ label, value, icon: Icon, gradient, sub }) {
  return (
    <div className="stats-card" style={{ "--card-gradient": gradient }}>
      <div className="stats-card-header">
        <div>
          <p className="stats-card-label">{label}</p>
          <p className="stats-card-value">{value ?? "—"}</p>
          {sub && <p className="stats-card-sub">{sub}</p>}
        </div>
        <div className="stats-card-icon" style={{ background: gradient }}>
          {Icon && <Icon size={22} color="white" />}
        </div>
      </div>
    </div>
  );
}
