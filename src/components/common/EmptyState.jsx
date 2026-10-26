export default function EmptyState({ title = "Nothing here yet", message = "Records will appear here once you add them.", icon = "bi-inbox" }) {
  return (
    <div className="text-center py-5 px-3">
      <div className="rounded-circle bg-body-tertiary d-inline-flex p-3 mb-3">
        <i className={`bi ${icon} fs-3 text-body-secondary`} aria-hidden="true" />
      </div>
      <h6 className="fw-semibold mb-1">{title}</h6>
      <p className="text-body-secondary small mb-0">{message}</p>
    </div>
  );
}
