import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import { dashboardApi } from "../api/services";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getStats();
      setStats(res.data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statsCards = [
    {
      label: "Total Products",
      value: stats?.total_products ?? 0,
      icon: Package,
      gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      sub: "Active inventory items",
    },
    {
      label: "Total Customers",
      value: stats?.total_customers ?? 0,
      icon: Users,
      gradient: "linear-gradient(135deg, #10b981, #059669)",
      sub: "Registered customers",
    },
    {
      label: "Total Orders",
      value: stats?.total_orders ?? 0,
      icon: ShoppingCart,
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
      sub: "All time orders",
    },
    {
      label: "Total Revenue",
      value: stats ? `$${stats.total_revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "$0.00",
      icon: DollarSign,
      gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
      sub: "Cumulative sales",
    },
  ];

  return (
    <>
      <Navbar title="Dashboard" subtitle="System overview and key metrics" />
      <main className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1>Welcome back 👋</h1>
            <p>Here's what's happening with your inventory today.</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={fetchStats} id="dashboard-refresh-btn">
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="loading-overlay">
            <div className="spinner" />
            <span className="loading-text">Loading dashboard...</span>
          </div>
        ) : error ? (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              color: "var(--accent-danger)",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              {statsCards.map((card) => (
                <StatsCard key={card.label} {...card} />
              ))}
            </div>

            {/* Dashboard Grid */}
            <div className="dashboard-grid">
              {/* Low Stock Alert */}
              <div className="low-stock-section">
                <div className="low-stock-header">
                  <h3>
                    <AlertTriangle size={16} />
                    Low Stock Alert
                    {stats?.low_stock_products?.length > 0 && (
                      <span
                        className="badge badge-warning"
                        style={{ marginLeft: "0.5rem" }}
                      >
                        {stats.low_stock_products.length}
                      </span>
                    )}
                  </h3>
                  <Link to="/products" className="btn btn-ghost btn-sm" id="low-stock-view-all">
                    View All <ArrowRight size={13} />
                  </Link>
                </div>
                {stats?.low_stock_products?.length === 0 ? (
                  <div className="empty-state" style={{ padding: "2rem" }}>
                    <p style={{ fontSize: "0.85rem", color: "var(--accent-success)" }}>
                      ✓ All products are well-stocked
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>SKU</th>
                          <th>Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.low_stock_products?.map((p) => (
                          <tr key={p.id}>
                            <td className="td-primary">{p.name}</td>
                            <td>
                              <span className="badge badge-info">{p.sku}</span>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  p.quantity_in_stock === 0
                                    ? "badge-danger"
                                    : p.quantity_in_stock <= 5
                                    ? "badge-warning"
                                    : "badge-success"
                                }`}
                              >
                                {p.quantity_in_stock === 0 ? "Out of Stock" : `${p.quantity_in_stock} units`}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.5rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "0.925rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: "1.25rem",
                  }}
                >
                  Quick Navigation
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[
                    { to: "/products", label: "Manage Products", icon: Package, color: "#6366f1", desc: "Add, edit, or remove inventory items" },
                    { to: "/customers", label: "Manage Customers", icon: Users, color: "#10b981", desc: "View and manage customer records" },
                    { to: "/orders", label: "Manage Orders", icon: ShoppingCart, color: "#f59e0b", desc: "Process and track customer orders" },
                  ].map(({ to, label, icon: Icon, color, desc }) => (
                    <Link
                      key={to}
                      to={to}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "0.875rem",
                        background: "var(--bg-input)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-color)",
                        textDecoration: "none",
                        transition: "var(--transition)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--bg-card-hover)";
                        e.currentTarget.style.borderColor = color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--bg-input)";
                        e.currentTarget.style.borderColor = "var(--border-color)";
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "var(--radius-sm)",
                          background: `${color}20`,
                          border: `1px solid ${color}40`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color,
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                          {label}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{desc}</p>
                      </div>
                      <ArrowRight size={16} color="var(--text-muted)" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
