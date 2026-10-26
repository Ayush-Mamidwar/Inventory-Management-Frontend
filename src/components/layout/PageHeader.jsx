export default function PageHeader({ title, description, action }) {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h2 className="h5 fw-semibold mb-1">{title}</h2>
        {description && <p className="text-body-secondary mb-0 small">{description}</p>}
      </div>
      {action}
    </div>
  );
}
