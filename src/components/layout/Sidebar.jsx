const links = [
  { id: "dashboard", label: "Dashboard", icon: "bi-grid-1x2" },
  { id: "inventory", label: "Inventory", icon: "bi-box-seam" },
  { id: "bills", label: "View bills", icon: "bi-receipt" },
  { id: "usage", label: "Daily usage", icon: "bi-clipboard-check" },
  { id: "reports", label: "Reports", icon: "bi-graph-up-arrow" },
];

export default function Sidebar({ activePage, onNavigate, mobile = false }) {
  return (
    <div className="d-flex flex-column h-100 bg-body">
      <div className="px-4 py-4 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center p-2">
            <i className="bi bi-shop fs-4" />
          </div>
          <div>
            <div className="fw-bold fs-5 lh-sm">Inventory</div>
            <div className="small text-body-secondary mt-1">Inventory workspace</div>
          </div>
        </div>
      </div>

      <div className="px-3 pt-4">
        <div className="text-uppercase text-body-secondary fw-semibold small px-3 mb-2">Workspace</div>
        <nav className="nav nav-pills flex-column gap-1">
          {links.map((link) => (
            <button
              type="button"
              key={link.id}
              className={`nav-link d-flex align-items-center gap-3 text-start px-3 py-3 ${activePage === link.id ? "active" : "text-body-secondary"}`}
              onClick={() => onNavigate(link.id)}
            >
              <i className={`bi ${link.icon} fs-5`} />
              <span>{link.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-3">
        <div className="border rounded-3 p-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="bi bi-shield-check text-success" />
            <span className="small fw-semibold">Inventory overview</span>
          </div>
          <p className="small text-body-secondary mb-0">Monitor purchases, stock levels and daily usage from one place.</p>
        </div>
      </div>
    </div>
  );
}
