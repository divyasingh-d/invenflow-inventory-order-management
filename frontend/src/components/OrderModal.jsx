import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ordersApi, customersApi, productsApi } from "../api/services";

const initialForm = {
  customer_id: "",
  product_id: "",
  quantity: "",
};

export default function OrderModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm);
      setErrors({});
      setSelectedProduct(null);
      loadDropdownData();
    }
  }, [isOpen]);

  const loadDropdownData = async () => {
    setLoadingData(true);
    try {
      const [custRes, prodRes] = await Promise.all([
        customersApi.getAll({ limit: 500 }),
        productsApi.getAll({ limit: 500 }),
      ]);
      setCustomers(custRes.data.items || []);
      setProducts(prodRes.data.items || []);
    } catch {
      // silently ignore - user will see empty dropdowns
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));

    if (name === "product_id") {
      const prod = products.find((p) => String(p.id) === value);
      setSelectedProduct(prod || null);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.customer_id) e.customer_id = "Please select a customer";
    if (!form.product_id) e.product_id = "Please select a product";
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) {
      e.quantity = "Quantity must be a positive integer";
    } else if (!Number.isInteger(Number(form.quantity))) {
      e.quantity = "Quantity must be a whole number";
    } else if (selectedProduct && Number(form.quantity) > selectedProduct.quantity_in_stock) {
      e.quantity = `Exceeds available stock (${selectedProduct.quantity_in_stock} available)`;
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    try {
      await ordersApi.create({
        customer_id: Number(form.customer_id),
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
      });
      onSuccess("Order created successfully!", "success");
      onClose();
    } catch (err) {
      onSuccess(err.message || "Failed to create order", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedTotal =
    selectedProduct && form.quantity && !isNaN(Number(form.quantity))
      ? (selectedProduct.price * Number(form.quantity)).toFixed(2)
      : null;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Create New Order</h2>
          <button className="modal-close" onClick={onClose} id="order-modal-close">
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {loadingData ? (
              <div className="loading-overlay" style={{ padding: "2rem" }}>
                <div className="spinner" />
                <span className="loading-text">Loading customers & products...</span>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="order-customer">
                    Customer <span className="required">*</span>
                  </label>
                  <select
                    id="order-customer"
                    name="customer_id"
                    className={`form-select ${errors.customer_id ? "error" : ""}`}
                    value={form.customer_id}
                    onChange={handleChange}
                  >
                    <option value="">— Select a customer —</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name} ({c.email})
                      </option>
                    ))}
                  </select>
                  {errors.customer_id && <p className="form-error">{errors.customer_id}</p>}
                  {customers.length === 0 && (
                    <p className="form-hint" style={{ color: "var(--accent-warning)" }}>
                      No customers found. Please add a customer first.
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="order-product">
                    Product <span className="required">*</span>
                  </label>
                  <select
                    id="order-product"
                    name="product_id"
                    className={`form-select ${errors.product_id ? "error" : ""}`}
                    value={form.product_id}
                    onChange={handleChange}
                  >
                    <option value="">— Select a product —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id} disabled={p.quantity_in_stock === 0}>
                        {p.name} (SKU: {p.sku}) — ${p.price} | Stock: {p.quantity_in_stock}
                      </option>
                    ))}
                  </select>
                  {errors.product_id && <p className="form-error">{errors.product_id}</p>}
                </div>

                {selectedProduct && (
                  <div
                    style={{
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.75rem",
                      marginBottom: "1rem",
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <strong style={{ color: "var(--text-primary)" }}>{selectedProduct.name}</strong>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
                      <span>Price: ${selectedProduct.price}</span>
                      <span>In stock: {selectedProduct.quantity_in_stock}</span>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="order-qty">
                    Quantity <span className="required">*</span>
                  </label>
                  <input
                    id="order-qty"
                    name="quantity"
                    type="number"
                    min="1"
                    step="1"
                    className={`form-input ${errors.quantity ? "error" : ""}`}
                    placeholder="e.g. 5"
                    value={form.quantity}
                    onChange={handleChange}
                  />
                  {errors.quantity && <p className="form-error">{errors.quantity}</p>}
                </div>

                {estimatedTotal && (
                  <div
                    style={{
                      background: "rgba(99, 102, 241, 0.08)",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.75rem 1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      Estimated Total
                    </span>
                    <span
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: "var(--accent-primary)",
                      }}
                    >
                      ${estimatedTotal}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isLoading}
              id="order-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || loadingData}
              id="order-submit-btn"
            >
              {isLoading ? (
                <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Placing Order...</>
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
