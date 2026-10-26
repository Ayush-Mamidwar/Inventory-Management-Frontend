import { formatMoney } from "../../utils/formatters";

export default function StatCard({
  title,
  value,
  caption,
  icon = "bi-bar-chart",
  tone = "primary",
  isCurrency = false,
}) {
  return (
    <div className="col-12 col-sm-6 col-xxl-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div className="min-w-0">
              <div className="small text-body-secondary mb-2">{title}</div>
              <div className="h3 fw-semibold mb-2 text-truncate">
                {isCurrency ? formatMoney(value) : value}
              </div>
              <div className="small text-body-secondary">{caption}</div>
            </div>
            <div className={`rounded-3 bg-${tone}-subtle text-${tone} p-3 flex-shrink-0`}>
              <i className={`bi ${icon} fs-5`} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
