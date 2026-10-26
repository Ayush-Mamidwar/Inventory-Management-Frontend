import { useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import { formatDate, formatMoney, formatNumber, getBillTotal, localDateInput } from "../utils/formatters";

const emptyItem = () => ({ productId: "", quantity: "1", unitPrice: "0", expiryDate: "" });

export default function Bills({ products, bills, runAction, createBill, setBillSettled }) {
  const [showForm, setShowForm] = useState(false);
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState(localDateInput());
  const [notes, setNotes] = useState("");
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState([emptyItem()]);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");

  const updateItem = (index, key, value) => setItems((old) => old.map((item, i) => i === index ? { ...item, [key]: value } : item));
  const total = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);

  const submit = async (event) => {
    event.preventDefault();
    if (items.some((item) => !item.productId)) { window.alert("Choose a product for each bill line."); return; }
    if (items.some((item) => !Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0 || !Number.isFinite(Number(item.unitPrice)) || Number(item.unitPrice) < 0)) {
      window.alert("Check the quantity and unit price for each line."); return;
    }
    setSaving(true);
    const ok = await runAction(() => createBill({
      billNumber: billNumber.trim() || undefined,
      billDate: new Date(`${billDate}T12:00:00`).toISOString(),
      notes: notes.trim() || undefined,
      supplier: supplier.trim() || undefined,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        expiryDate: item.expiryDate ? new Date(`${item.expiryDate}T12:00:00`).toISOString() : null,
      })),
    }), "Purchase bill created successfully");
    setSaving(false);
    if (ok) {
      setShowForm(false);
      setBillNumber("");
      setNotes("");
      setSupplier("");
      setBillDate(localDateInput());
      setItems([emptyItem()]);
    }
  };

  const supplierOptions = ["all", ...new Set((bills || []).map((bill) => bill.supplier).filter(Boolean))];

  const visibleBills = bills.filter((bill) => {
    const statusMatch = filter === "all" || (filter === "settled" ? bill.settled : !bill.settled);
    const supplierMatch = supplierFilter === "all" || bill.supplier === supplierFilter;
    return statusMatch && supplierMatch;
  });

  const columns = [
    { key: "billNumber", label: "Bill", render: (b) => <div><div className="fw-semibold">{b.billNumber || b.id.slice(0, 8)}</div><div className="small text-body-secondary">{b.supplier || b.notes || "No supplier or notes"}</div></div> },
    { key: "billDate", label: "Purchase date", render: (b) => formatDate(b.billDate) },
    { key: "supplier", label: "Supplier", render: (b) => b.supplier || <span className="text-body-secondary">—</span> },
    { key: "items", label: "Line items", render: (b) => b.items?.length || 0 },
    { key: "total", label: "Invoice total", render: (b) => <span className="fw-semibold">{formatMoney(getBillTotal(b))}</span> },
    { key: "settled", label: "Payment status", render: (b) => <StatusBadge status={b.settled ? "settled" : "unsettled"}>{b.settled ? "Settled" : "Unsettled"}</StatusBadge> },
    { key: "action", label: "", headerClassName: "text-end", cellClassName: "text-end", render: (b) => <button className={`btn btn-sm ${b.settled ? "btn-outline-secondary" : "btn-outline-success"}`} onClick={() => runAction(() => setBillSettled(b.id, !b.settled), b.settled ? "Bill marked unsettled" : "Bill marked settled")}>{b.settled ? "Undo" : "Mark paid"}</button> },
  ];

  return (
    <>
      <PageHeader title="Purchase bills" description="Record incoming stock, review invoices and track supplier payments." action={<button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}><i className="bi bi-plus-lg me-2" />New bill</button>} />

      {showForm && <section className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-md-4">
          <h2 className="h6 fw-semibold mb-4">New purchase bill</h2>
          <form onSubmit={submit}>
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-3"><label className="form-label">Supplier</label><input className="form-control" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="e.g. FreshMart" required /></div>
              <div className="col-12 col-md-3"><label className="form-label">Invoice number <span className="text-body-secondary">(optional)</span></label><input className="form-control" value={billNumber} onChange={(e) => setBillNumber(e.target.value)} placeholder="e.g. INV-1042" /></div>
              <div className="col-12 col-md-3"><label className="form-label">Purchase date</label><input className="form-control" type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} required /></div>
              <div className="col-12 col-md-3"><label className="form-label">Notes</label><input className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery or payment notes" /></div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h6 fw-semibold mb-0">Bill line items</h3>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setItems((old) => [...old, emptyItem()])}><i className="bi bi-plus-lg me-1" />Add line</button>
            </div>

            {items.map((item, index) => <div className="border rounded-3 p-3 mb-3" key={index}>
              <div className="row g-3 align-items-end">
                <div className="col-12 col-lg-4"><label className="form-label">Product</label><select className="form-select" value={item.productId} onChange={(e) => updateItem(index, "productId", e.target.value)} required><option value="">Select a product</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}</select></div>
                <div className="col-6 col-lg-2"><label className="form-label">Quantity</label><input type="number" min="0.001" step="0.001" className="form-control" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} required /></div>
                <div className="col-6 col-lg-2"><label className="form-label">Unit price (₹)</label><input type="number" min="0" step="0.01" className="form-control" value={item.unitPrice} onChange={(e) => updateItem(index, "unitPrice", e.target.value)} required /></div>
                <div className="col-8 col-lg-3"><label className="form-label">Expiry date <span className="text-body-secondary">(optional)</span></label><input type="date" className="form-control" value={item.expiryDate} onChange={(e) => updateItem(index, "expiryDate", e.target.value)} /></div>
                <div className="col-4 col-lg-1"><button type="button" className="btn btn-outline-danger w-100" disabled={items.length === 1} onClick={() => setItems((old) => old.filter((_, i) => i !== index))} aria-label="Remove line"><i className="bi bi-trash" /></button></div>
                <div className="col-12 text-end small text-body-secondary">Line total <span className="fw-semibold text-body ms-2">{formatMoney(Number(item.quantity) * Number(item.unitPrice))}</span></div>
              </div>
            </div>)}

            <div className="bg-body-tertiary rounded-3 p-3 d-flex justify-content-between align-items-center mb-4"><span className="fw-semibold">Bill total</span><span className="h5 fw-semibold mb-0">{formatMoney(total)}</span></div>
            {products.length === 0 && <div className="alert alert-warning">Create products in Inventory before adding a bill.</div>}
            <div className="d-flex gap-2"><button className="btn btn-primary" disabled={saving || products.length === 0}>{saving ? "Saving…" : "Save bill"}</button><button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button></div>
          </form>
        </div>
      </section>}

      <section className="card border-0 shadow-sm">
        <div className="card-body border-bottom p-3 p-md-4">
          <div className="row g-3 align-items-center">
            <div className="col"><h2 className="h6 fw-semibold mb-1">All bills</h2><p className="small text-body-secondary mb-0">{visibleBills.length} invoices</p></div>
            <div className="col-12 col-md-3"><select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All payment statuses</option><option value="unsettled">Unsettled only</option><option value="settled">Settled only</option></select></div>
            <div className="col-12 col-md-3"><select className="form-select" value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}><option value="all">All suppliers</option>{supplierOptions.filter((value) => value !== "all").map((supplierName) => <option key={supplierName} value={supplierName}>{supplierName}</option>)}</select></div>
          </div>
        </div>
        <DataTable columns={columns} rows={visibleBills} emptyMessage="No bills match this filter." />
      </section>
    </>
  );
}
