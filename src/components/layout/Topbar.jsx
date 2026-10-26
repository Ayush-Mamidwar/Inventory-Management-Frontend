export default function Topbar({ title, subtitle, onRefresh, refreshing, onMenu }) {
  return (
    <header className="bg-body border-bottom px-3 px-lg-4 py-3">
      <div className="d-flex justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary d-lg-none" onClick={onMenu} aria-label="Open navigation">
            <i className="bi bi-list fs-5" />
          </button>
          <div>
            <h1 className="h4 fw-semibold mb-1">{title}</h1>
            <div className="small text-body-secondary">{subtitle}</div>
          </div>
        </div>
        <button className="btn btn-outline-secondary" onClick={onRefresh} disabled={refreshing}>
          <i className={`bi bi-arrow-clockwise ${refreshing ? "opacity-50" : ""}`} />
          <span className="d-none d-sm-inline ms-2">{refreshing ? "Refreshing…" : "Refresh data"}</span>
        </button>
      </div>
    </header>
  );
}
