import { useEffect, useState, useCallback } from "react";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import DataTable from "../components/DataTable";
import ProductModal from "../components/ProductModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { productsApi } from "../api/services";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await productsApi.getAll();
      setProducts(res.data.items || []);
    } catch (err) {
      toast.error(err.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSuccess = (message, type) => {
    if (type === "success") toast.success(message);
    else toast.error(message);
    fetchProducts();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await productsApi.delete(deleteTarget.id);
      toast.success(`Product "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { key: "id", label: "#" },
    { key: "name", label: "Product Name", primary: true },
    {
      key: "sku",
      label: "SKU",
      render: (row) => <span className="badge badge-info">{row.sku}</span>,
    },
    {
      key: "price",
      label: "Price",
      render: (row) => (
        <span style={{ color: "var(--accent-success)", fontWeight: 600 }}>
          ${row.price.toFixed(2)}
        </span>
      ),
    },
    {
      key: "quantity_in_stock",
      label: "Stock",
      render: (row) => {
        const qty = row.quantity_in_stock;
        const cls = qty === 0 ? "badge-danger" : qty <= 5 ? "badge-warning" : qty <= 10 ? "badge-warning" : "badge-success";
        return <span className={`badge ${cls}`}>{qty === 0 ? "Out of Stock" : `${qty} units`}</span>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="td-actions">
          <button
            className="btn-icon"
            onClick={() => { setEditProduct(row); setIsModalOpen(true); }}
            title="Edit product"
            id={`edit-product-${row.id}`}
          >
            <Pencil />
          </button>
          <button
            className="btn-icon danger"
            onClick={() => setDeleteTarget(row)}
            title="Delete product"
            id={`delete-product-${row.id}`}
          >
            <Trash2 />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Navbar title="Products" subtitle="Manage your inventory items" />
      <main className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1>Product Management</h1>
            <p>{products.length} product{products.length !== 1 ? "s" : ""} in inventory</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setEditProduct(null); setIsModalOpen(true); }}
            id="add-product-btn"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>

        <DataTable
          columns={columns}
          data={products}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Search products..."
          searchKeys={["name", "sku"]}
          emptyIcon={<Package size={28} />}
          emptyTitle="No products yet"
          emptyMessage="Add your first product to start managing inventory."
          emptyAction={
            <button
              className="btn btn-primary"
              onClick={() => { setEditProduct(null); setIsModalOpen(true); }}
            >
              <Plus size={16} /> Add Product
            </button>
          }
        />

        <ProductModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditProduct(null); }}
          onSuccess={handleSuccess}
          editProduct={editProduct}
        />

        <ConfirmDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also affect any associated orders.`}
        />
      </main>
    </>
  );
}
