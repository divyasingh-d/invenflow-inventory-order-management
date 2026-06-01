import { useEffect, useState, useCallback } from "react";
import { ShoppingCart, Plus, Trash2, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import DataTable from "../components/DataTable";
import OrderModal from "../components/OrderModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { ordersApi } from "../api/services";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ordersApi.getAll();
      setOrders(res.data.items || []);
    } catch (err) {
      toast.error(err.message || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSuccess = (message, type) => {
    if (type === "success") toast.success(message);
    else toast.error(message);
    fetchOrders();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await ordersApi.delete(deleteTarget.id);
      toast.success(`Order #${deleteTarget.id} deleted.`);
      setDeleteTarget(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.message || "Failed to delete order");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = [
    {
      key: "id",
      label: "Order #",
      render: (row) => (
        <span className="badge badge-info">#{row.id}</span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      primary: true,
      render: (row) => row.customer?.full_name || `Customer #${row.customer_id}`,
    },
    {
      key: "product",
      label: "Product",
      render: (row) => (
        <div>
          <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>
            {row.product?.name || `Product #${row.product_id}`}
          </div>
          {row.product?.sku && (
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              SKU: {row.product.sku}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "quantity",
      label: "Qty",
      render: (row) => (
        <span className="badge badge-info">{row.quantity}</span>
      ),
    },
    {
      key: "total_amount",
      label: "Total",
      render: (row) => (
        <span style={{ color: "var(--accent-success)", fontWeight: 700 }}>
          ${row.total_amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (row) => (
        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <Calendar size={12} />
          {formatDate(row.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="td-actions">
          <button
            className="btn-icon danger"
            onClick={() => setDeleteTarget(row)}
            title="Delete order"
            id={`delete-order-${row.id}`}
          >
            <Trash2 />
          </button>
        </div>
      ),
    },
  ];

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <>
      <Navbar title="Orders" subtitle="Track and manage customer orders" />
      <main className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1>Order Management</h1>
            <p>
              {orders.length} order{orders.length !== 1 ? "s" : ""} • Total Revenue:{" "}
              <strong style={{ color: "var(--accent-success)" }}>
                ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </strong>
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} id="add-order-btn">
            <Plus size={16} />
            New Order
          </button>
        </div>

        <DataTable
          columns={columns}
          data={orders}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Search orders..."
          searchKeys={["customer_id", "product_id"]}
          emptyIcon={<ShoppingCart size={28} />}
          emptyTitle="No orders yet"
          emptyMessage="Create your first order to get started."
          emptyAction={
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> New Order
            </button>
          }
        />

        <OrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />

        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          title="Delete Order"
          message={`Are you sure you want to delete Order #${deleteTarget?.id}? This action cannot be undone. Note: stock will NOT be restored.`}
        />
      </main>
    </>
  );
}
