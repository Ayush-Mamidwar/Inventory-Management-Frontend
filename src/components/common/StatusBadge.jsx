export default function StatusBadge({ status, children }) {
  const label = children ?? status;
  const normalized = String(status ?? label).toLowerCase();
  let variant = "secondary";

  if (["settled", "paid", "in stock", "healthy"].includes(normalized)) variant = "success";
  else if (["unsettled", "pending"].includes(normalized)) variant = "warning";
  else if (["low stock", "expired", "failed"].includes(normalized)) variant = "danger";

  return <span className={`badge rounded-pill text-bg-${variant} fw-medium px-3 py-2`}>{label}</span>;
}
