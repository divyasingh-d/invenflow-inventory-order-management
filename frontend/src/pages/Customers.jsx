import { useEffect, useState, useCallback } from "react";
import { Users, Plus, Trash2, Mail, Phone } from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import DataTable from "../components/DataTable";
import CustomerModal from "../components/CustomerModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { customersApi } from "../api/services";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await customersApi.getAll();
      setCustomers(res.data.items || []);
    } catch (err) {
      toast.error(err.message || "Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSuccess = (message, type) => {
    if (type === "success") toast.success(message);
    else toast.error(message);
    fetchCustomers();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await customersApi.delete(deleteTarget.id);
      toast.success(`Customer "${deleteTarget.full_name}" deleted.`);
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err.message || "Failed to delete customer");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { key: "id", label: "#" },
    { key: "full_name", label: "Full Name", primary: true },
    {
      key: "email",
      label: "Email",
      render: (row) => (
        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--accent-primary)" }}>
          <Mail size={13} />
          {row.email}
        </span>
      ),
    },
    {
      key: "phone_number",
      label: "Phone",
      render: (row) =>
        row.phone_number ? (
          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Phone size={13} />
            {row.phone_number}
          </span>
        ) : (
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>
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
            title="Delete customer"
            id={`delete-customer-${row.id}`}
          >
            <Trash2 />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Navbar title="Customers" subtitle="Manage your customer base" />
      <main className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1>Customer Management</h1>
            <p>{customers.length} customer{customers.length !== 1 ? "s" : ""} registered</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} id="add-customer-btn">
            <Plus size={16} />
            Add Customer
          </button>
        </div>

        <DataTable
          columns={columns}
          data={customers}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Search customers..."
          searchKeys={["full_name", "email", "phone_number"]}
          emptyIcon={<Users size={28} />}
          emptyTitle="No customers yet"
          emptyMessage="Add your first customer to start managing orders."
          emptyAction={
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> Add Customer
            </button>
          }
        />

        <CustomerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />

        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          title="Delete Customer"
          message={`Are you sure you want to delete "${deleteTarget?.full_name}"? Their associated orders will also be deleted.`}
        />
      </main>
    </>
  );
}
