import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { customersApi } from "../api/services";

const initialForm = {
  full_name: "",
  email: "",
  phone_number: "",
};

export default function CustomerModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm);
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Please enter a valid email address";
    }
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
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone_number: form.phone_number.trim() || null,
      };
      await customersApi.create(payload);
      onSuccess("Customer created successfully!", "success");
      onClose();
    } catch (err) {
      onSuccess(err.message || "Failed to create customer", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Add New Customer</h2>
          <button className="modal-close" onClick={onClose} id="customer-modal-close">
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="customer-name">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="customer-name"
                name="full_name"
                type="text"
                className={`form-input ${errors.full_name ? "error" : ""}`}
                placeholder="e.g. John Doe"
                value={form.full_name}
                onChange={handleChange}
                autoFocus
              />
              {errors.full_name && <p className="form-error">{errors.full_name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customer-email">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="customer-email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? "error" : ""}`}
                placeholder="e.g. john@example.com"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
              <p className="form-hint">Must be unique across all customers.</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customer-phone">
                Phone Number
              </label>
              <input
                id="customer-phone"
                name="phone_number"
                type="tel"
                className="form-input"
                placeholder="e.g. +1 555 000 1234"
                value={form.phone_number}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isLoading}
              id="customer-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              id="customer-submit-btn"
            >
              {isLoading ? (
                <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving...</>
              ) : (
                "Create Customer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
