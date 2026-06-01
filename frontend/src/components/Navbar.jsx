export default function Navbar({ title, subtitle }) {
  return (
    <header className="navbar">
      <div>
        <h1 className="navbar-title">{title}</h1>
        {subtitle && <p className="navbar-subtitle">{subtitle}</p>}
      </div>
      <div className="navbar-right">
        <span className="navbar-badge">
          <span className="navbar-badge-dot" />
          System Online
        </span>
      </div>
    </header>
  );
}
