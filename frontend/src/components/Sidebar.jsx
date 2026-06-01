import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Boxes,
  TrendingUp,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Boxes size={20} color="white" />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">InvenFlow</span>
          <span className="sidebar-logo-subtitle">Management System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Main Menu</span>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        <span className="sidebar-section-label" style={{ marginTop: "0.5rem" }}>
          Insights
        </span>
        <button className="nav-link" disabled style={{ opacity: 0.5 }}>
          <TrendingUp size={18} />
          Analytics (Soon)
        </button>
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-footer-text">InvenFlow v1.0.0 • Production</p>
      </div>
    </aside>
  );
}
