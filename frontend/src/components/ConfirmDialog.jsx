import { AlertTriangle, Trash2 } from "lucide-react";

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal confirm-dialog">
        <div className="modal-body">
          <div className="confirm-icon">
            <AlertTriangle />
          </div>
          <h3 className="confirm-title">{title || "Confirm Deletion"}</h3>
          <p className="confirm-message">
            {message || "Are you sure you want to delete this record? This action cannot be undone."}
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={isLoading} id="confirm-cancel-btn">
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isLoading}
            id="confirm-delete-btn"
          >
            {isLoading ? (
              <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Deleting...</>
            ) : (
              <><Trash2 size={14} /> Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
