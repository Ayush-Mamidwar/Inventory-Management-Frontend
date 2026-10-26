import StatCard from "../components/common/StatCard";
import StatusBadge from "../components/common/StatusBadge";
import DataTable from "../components/common/DataTable";
import PageHeader from "../components/layout/PageHeader";
import { formatDate, formatMoney, formatNumber, getBillTotal, isInMonth, currentMonth } from "../utils/formatters";

export default function Dashboard({ products, bills, usage, onNavigate }) {
  const month = currentMonth();
  const lowStock = products.filter((p) => p.lowStock);
  const monthBills = bills.filter((b) => isInMonth(b.billDate, month));
  const purchases = monthBills.reduce((sum, b) => sum + getBillTotal(b), 0);
  const unsettled = bills.filter((b) => !b.settled);
  const outstanding = unsettled.reduce((sum, b) => sum + getBillTotal(b), 0);

  const lowStockColumns = [
    { key: "name", label: "Product", render: (p) => <span className="fw-semibold">{p.name}</span> },
    { key: "currentStock", label: "Available", render: (p) => `${formatNumber(p.currentStock)} ${p.unit}` },
    { key: "limit", label: "Minimum", render: (p) => `${formatNumber(p.limit)} ${p.unit}` },
    { key: "status", label: "Status", render: () => <StatusBadge status="low stock">Low stock</StatusBadge> },
  ];

  const billColumns = [
    { key: "billNumber", label: "Bill", render: (b) => <span className="fw-semibold">{b.billNumber || b.id.slice(0, 8)}</span> },
    { key: "billDate", label: "Date", render: (b) => formatDate(b.billDate) },
    { key: "items", label: "Line items", render: (b) => b.items?.length || 0 },
    { key: "total", label: "Total", render: (b) => <span className="fw-semibold">{formatMoney(getBillTotal(b))}</span> },
    { key: "settled", label: "Payment", render: (b) => <StatusBadge status={b.settled ? "settled" : "unsettled"}>{b.settled ? "Settled" : "Unsettled"}</StatusBadge> },
  ];

  return (
    <>
      <PageHeader title="Good to see you" description="Here’s what is happening with your inventory today." />
      <div className="row g-3 mb-4">
        <StatCard title="Products" value={products.length} caption="Products in catalog" icon="bi-box-seam" tone="primary" />
        <StatCard title="Low stock items" value={lowStock.length} caption="At or below minimum level" icon="bi-exclamation-triangle" tone="danger" />
        <StatCard title="Purchases this month" value={purchases} isCurrency caption="Recorded invoice value" icon="bi-cart-check" tone="success" />
        <StatCard title="Outstanding bills" value={outstanding} isCurrency caption={`${unsettled.length} bills unsettled`} icon="bi-receipt" tone="warning" />
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <section className="card border-0 shadow-sm h-100">
            <div className="card-body p-0">
              <div className="p-4 d-flex justify-content-between align-items-center gap-3">
                <div>
                  <h2 className="h6 fw-semibold mb-1">Low stock alerts</h2>
                  <p className="small text-body-secondary mb-0">Items that may need replenishment.</p>
                </div>
                <button className="btn btn-sm btn-outline-primary" onClick={() => onNavigate("inventory")}>View inventory</button>
              </div>
              <DataTable columns={lowStockColumns} rows={lowStock.slice(0, 6)} emptyMessage="All products are above their minimum stock level." />
            </div>
          </section>
        </div>
        <div className="col-12 col-xl-5">
          <section className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h2 className="h6 fw-semibold mb-1">Quick actions</h2>
              <p className="small text-body-secondary mb-4">Common tasks for your team.</p>
              <div className="d-grid gap-2">
                <button className="btn btn-primary py-2 text-start" onClick={() => onNavigate("bills")}><i className="bi bi-plus-circle me-2" />Create purchase bill <i className="bi bi-arrow-up-right float-end" /></button>
                <button className="btn btn-outline-secondary py-2 text-start" onClick={() => onNavigate("inventory")}><i className="bi bi-box-seam me-2" />Add or manage products <i className="bi bi-arrow-up-right float-end" /></button>
                <button className="btn btn-outline-secondary py-2 text-start" onClick={() => onNavigate("usage")}><i className="bi bi-clipboard-check me-2" />Record daily usage <i className="bi bi-arrow-up-right float-end" /></button>
              </div>
              <hr className="my-4" />
              <div className="d-flex justify-content-between small mb-2"><span className="text-body-secondary">Bills recorded this month</span><span className="fw-semibold">{monthBills.length}</span></div>
              <div className="d-flex justify-content-between small"><span className="text-body-secondary">Usage entries this month</span><span className="fw-semibold">{usage.filter((u) => isInMonth(u.usedAt, month)).length}</span></div>
            </div>
          </section>
        </div>
      </div>

      <section className="card border-0 shadow-sm mt-4">
        <div className="card-body p-0">
          <div className="p-4">
            <h2 className="h6 fw-semibold mb-1">Recent purchase bills</h2>
            <p className="small text-body-secondary mb-0">The latest invoices recorded in the system.</p>
          </div>
          <DataTable columns={billColumns} rows={bills.slice(0, 5)} emptyMessage="No purchase bills have been recorded yet." />
        </div>
      </section>

      <p className="small text-body-secondary mt-3 mb-0">
        Purchase value reflects bill line items. It is not the same as the cost of ingredients consumed.
      </p>
    </>
  );
}
