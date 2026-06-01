import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { productsApi } from "../api/services";

const initialForm = {
  name: "",
  sku: "",
  price: "",
  quantity_in_stock: "",
};

export default function ProductModal({ isOpen, onClose, onSuccess, editProduct }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = !!editProduct;

  useEffect(() => {
    if (isOpen) {
      if (editProduct) {
        setForm({
          name: editProduct.name || "",
          sku: editProduct.sku || "",
          price: String(editProduct.price ?? ""),
          quantity_in_stock: String(editProduct.quantity_in_stock ?? ""),
        });
      } else {
        setForm(initialForm);
      }
      setErrors({});
    }
  }, [isOpen, editProduct]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.sku.trim()) e.sku = "SKU is required";
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0)
      e.price = "Price must be a non-negative number";
    if (
      form.quantity_in_stock === "" ||
      isNaN(Number(form.quantity_in_stock)) ||
      Number(form.quantity_in_stock) < 0 ||
      !Number.isInteger(Number(form.quantity_in_stock))
    )
      e.quantity_in_stock = "Quantity must be a non-negative integer";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
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
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim().toUpperCase(),
        price: Number(form.price),
        quantity_in_stock: Number(form.quantity_in_stock),
      };
      if (isEdit) {
        await productsApi.update(editProduct.id, payload);
        onSuccess("Product updated successfully!", "success");
      } else {
        await productsApi.create(payload);
        onSuccess("Product created successfully!", "success");
      }
      onClose();
    } catch (err) {
      onSuccess(err.message || "Failed to save product", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? "Edit Product" : "Add New Product"}</h2>
          <button className="modal-close" onClick={onClose} id="product-modal-close">
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="product-name">
                Product Name <span className="required">*</span>
              </label>
              <input
                id="product-name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? "error" : ""}`}
                placeholder="e.g. Wireless Mouse"
                value={form.name}
                onChange={handleChange}
                autoFocus
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="product-sku">
                SKU <span className="required">*</span>
              </label>
              <input
                id="product-sku"
                name="sku"
                type="text"
                className={`form-input ${errors.sku ? "error" : ""}`}
                placeholder="e.g. WM-001"
                value={form.sku}
                onChange={handleChange}
              />
              {errors.sku && <p className="form-error">{errors.sku}</p>}
              <p className="form-hint">Must be unique. Will be stored in uppercase.</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="product-price">
                  Price ($) <span className="required">*</span>
                </label>
                <input
                  id="product-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  className={`form-input ${errors.price ? "error" : ""}`}
                  placeholder="0.00"
                  value={form.price}
                  onChange={handleChange}
                />
                {errors.price && <p className="form-error">{errors.price}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="product-qty">
                  Quantity in Stock <span className="required">*</span>
                </label>
                <input
                  id="product-qty"
                  name="quantity_in_stock"
                  type="number"
                  min="0"
                  step="1"
                  className={`form-input ${errors.quantity_in_stock ? "error" : ""}`}
                  placeholder="0"
                  value={form.quantity_in_stock}
                  onChange={handleChange}
                />
                {errors.quantity_in_stock && (
                  <p className="form-error">{errors.quantity_in_stock}</p>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isLoading}
              id="product-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              id="product-submit-btn"
            >
              {isLoading ? (
                <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving...</>
              ) : (
                isEdit ? "Update Product" : "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
