export default function AlertMessage({ type = "info", message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type} alert-dismissible d-flex align-items-start gap-2`} role="alert">
      <i className={`bi ${type === "danger" ? "bi-exclamation-triangle" : type === "success" ? "bi-check-circle" : "bi-info-circle"} mt-1`} />
      <div className="flex-grow-1">{message}</div>
      {onClose && <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />}
    </div>
  );
}
