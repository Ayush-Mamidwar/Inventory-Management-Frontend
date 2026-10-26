import { useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import DataTable from "../components/common/DataTable";
import { formatDate, formatMoney, formatNumber, localDateInput } from "../utils/formatters";

export default function DailyUsage({ products, usage, runAction, recordUsage }) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [usedAt, setUsedAt] = useState(localDateInput());
  const [notes, setNotes] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const selected = products.find((p) => p.id === productId);

  // const purchaseOptions = useMemo(() => {
  //   if (!selected) return [];

  //   return (selected.billItems || []).map((item) => {
  //     const remaining = Number(item.remainingQuantity ?? item.quantity ?? 0);
  //     const optionId = item.id || `${item.bill?.id || item.billId || "batch"}-${item.unitPrice}-${item.quantity}`;

  //     return {
  //       ...item,
  //       id: optionId,
  //       remaining,
  //       displayValue:
  //         `${item.bill?.billNumber || item.billNumber || "Bill"} · ${formatNumber(item.quantity)} ${selected.unit} @ ${formatMoney(Number(item.unitPrice || 0))}` +
  //         (remaining > 0 ? ` · remaining ${formatNumber(remaining)} ${selected.unit}` : " · fully used"),
  //     };
  //   });
  // }, [selected]);

  
  // const purchaseOptions = useMemo(() => {
  //   if (!selected) return [];

  //   return (selected.billItems || []).map((item) => {
  //     const remaining = Number(item.remainingQuantity ?? item.quantity ?? 0);
  //     const optionId =
  //       item.id ||
  //       `${item.bill?.id || item.billId || "batch"}-${item.unitPrice}-${item.quantity}`;

  //     const expiryDate = item.expiryDate
  //       ? new Date(item.expiryDate).toLocaleDateString("en-IN", {
  //           day: "2-digit",
  //           month: "short",
  //           year: "numeric",
  //           timeZone: "UTC",
  //         })
  //       : "No expiry";

  //     return {
  //       ...item,
  //       id: optionId,
  //       remaining,
  //       displayValue:
  //         `${item.bill?.billNumber || item.billNumber || "Bill"} · ` +
  //         `${formatNumber(item.quantity)} ${selected.unit} @ ${formatMoney(Number(item.unitPrice || 0))} · ` +
  //         `Expiry: ${expiryDate}` +
  //         (remaining > 0
  //           ? ` · remaining ${formatNumber(remaining)} ${selected.unit}`
  //           : " · fully used"),
  //     };
  //   });
  // }, [selected]);

  const purchaseOptions = useMemo(() => {
    if (!selected) return [];

    return (selected.billItems || [])
      .map((item) => {
        const remaining = Number(
          item.remainingQuantity ?? item.quantity ?? 0
        );

        const optionId =
          item.id ||
          `${item.bill?.id || item.billId || "batch"}-${item.unitPrice}-${item.quantity}`;

        const expiryDate = item.expiryDate
          ? new Date(item.expiryDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              timeZone: "UTC",
            })
          : "No expiry";

        return {
          ...item,
          id: optionId,
          remaining,
          displayValue:
            `${item.bill?.billNumber || item.billNumber || "Bill"} · ` +
            `${formatNumber(item.quantity)} ${selected.unit} @ ${formatMoney(Number(item.unitPrice || 0))} · ` +
            `Expiry: ${expiryDate}` +
            ` · remaining ${formatNumber(remaining)} ${selected.unit}`,
        };
      })
      .filter((item) => item.remaining > 0);
  }, [selected]);

  const selectedSource = purchaseOptions.find((item) => item.id === selectedSourceId) || null;

  const submit = async (event) => {
    event.preventDefault();
    if (!productId || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      window.alert("Select a product and enter a positive quantity.");
      return;
    }

    if (purchaseOptions.length > 0 && !selectedSourceId) {
      window.alert("Choose the purchase batch this stock was taken from.");
      return;
    }

    if (selectedSource && Number(quantity) > Number(selectedSource.remainingQuantity || 0)) {
      window.alert("The selected purchase batch does not have enough quantity left for this usage entry.");
      return;
    }

    setSaving(true);
    const ok = await runAction(() => recordUsage({
      productId,
      billItemId: selectedSourceId || undefined,
      purchaseEntryId: selectedSourceId || undefined,
      unitPrice: selectedSource ? Number(selectedSource.unitPrice || 0) : undefined,
      quantity: Number(quantity),
      usedAt: new Date(`${usedAt}T12:00:00`).toISOString(),
      notes: notes.trim() || undefined,
    }), "Daily usage recorded successfully");
    setSaving(false);
    if (ok) { setQuantity("1"); setNotes(""); setSelectedSourceId(""); }
  };

  const filtered = useMemo(() => usage.filter((entry) => entry.product.name.toLowerCase().includes(search.toLowerCase())), [usage, search]);

  const columns = [
    { key: "product", label: "Product", render: (u) => <span className="fw-semibold">{u.product.name}</span> },
    { key: "quantity", label: "Quantity used", render: (u) => `${formatNumber(u.quantity)} ${u.product.unit}` },
    { key: "usedAt", label: "Usage date", render: (u) => formatDate(u.usedAt) },
    { key: "notes", label: "Notes", render: (u) => u.notes || <span className="text-body-secondary">—</span> },
  ];

  return (
    <>
      <PageHeader title="Daily usage" description="Record the stock taken by the kitchen for preparation and service." />
      <section className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-md-4">
          <h2 className="h6 fw-semibold mb-1">Record stock usage</h2>
          <p className="small text-body-secondary mb-4">Stock levels update after a successful entry.</p>
          <form onSubmit={submit}>
            <div className="row g-3">
              <div className="col-12 col-md-4"><label className="form-label">Product</label><select className="form-select" value={productId} onChange={(e) => { setProductId(e.target.value); setSelectedSourceId(""); }} required><option value="">Select product</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} — {formatNumber(p.currentStock)} {p.unit} available</option>)}</select></div>
              <div className="col-6 col-md-2"><label className="form-label">Quantity used</label><input className="form-control" type="number" min="0.001" step="0.001" value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></div>
              <div className="col-6 col-md-3"><label className="form-label">Date</label><input className="form-control" type="date" value={usedAt} onChange={(e) => setUsedAt(e.target.value)} required /></div>
              <div className="col-12 col-md-3"><label className="form-label">Notes</label><input className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Lunch preparation" /></div>
            </div>
            {selected && <div className="alert alert-info mt-3 mb-0"><i className="bi bi-info-circle me-2" />Available: <strong>{formatNumber(selected.currentStock)} {selected.unit}</strong> · Minimum level: {formatNumber(selected.limit)} {selected.unit}</div>}
            {selected && purchaseOptions.length > 0 && (
              <div className="mt-3">
                <label className="form-label">Choose purchase batch used</label>
                <select className="form-select" value={selectedSourceId} onChange={(e) => setSelectedSourceId(e.target.value)} required>
                  <option value="">Select a purchase batch</option>
                  {purchaseOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.displayValue}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {selected && purchaseOptions.length === 0 && <div className="alert alert-warning mt-3 mb-0">No purchase entries are linked to this product yet. Add a bill first to select a batch.</div>}
            <button className="btn btn-primary mt-3" disabled={saving || products.length === 0}>{saving ? "Saving…" : "Record usage"}</button>
          </form>
        </div>
      </section>

      <section className="card border-0 shadow-sm">
        <div className="card-body border-bottom p-3 p-md-4">
          <div className="row g-3 align-items-center"><div className="col"><h2 className="h6 fw-semibold mb-1">Usage history</h2><p className="small text-body-secondary mb-0">Previously recorded consumption.</p></div><div className="col-12 col-md-4"><input className="form-control" placeholder="Search by product" value={search} onChange={(e) => setSearch(e.target.value)} /></div></div>
        </div>
        <DataTable columns={columns} rows={filtered} emptyMessage="No usage records found." renderModal={(entry) => <UsageDetails usageEntry={entry} />} />
      </section>
    </>
  );
}

function UsageDetails({ usageEntry }) {
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const source = usageEntry.billItem || usageEntry.purchaseEntry || usageEntry.item || usageEntry.sourceBillItem || null;
  const bill = source?.bill || usageEntry.bill || {};
  const unitPrice = Number(usageEntry.unitPrice ?? source?.unitPrice ?? 0);

  return (
    <div>
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4">
          <div className="border rounded p-3 h-100">
            <div className="small text-body-secondary">Product</div>
            <div className="fs-5 fw-semibold">{usageEntry.product?.name || usageEntry.productName || "—"}</div>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="border rounded p-3 h-100">
            <div className="small text-body-secondary">Used quantity</div>
            <div className="fs-5 fw-semibold">{usageEntry.quantity} {usageEntry.product?.unit || "units"}</div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="border rounded p-3 h-100">
            <div className="small text-body-secondary">Usage date</div>
            <div className="fs-5 fw-semibold">{formatDate(usageEntry.usedAt)}</div>
          </div>
        </div>
      </div>

      <h6 className="fw-semibold mb-3">Selected purchase batch</h6>

      {source ? (
        <div className="table-responsive">
          <table className="table table-bordered align-middle mb-0">
            <tbody>
              <tr>
                <th className="bg-body-tertiary">Bill</th>
                <td>{bill.billNumber || bill.id?.slice(0, 8) || "—"}</td>
              </tr>
              <tr>
                <th className="bg-body-tertiary">Purchase date</th>
                <td>{formatDate(bill.billDate || source.billDate || source.purchaseDate)}</td>
              </tr>
              <tr>
                <th className="bg-body-tertiary">Unit price</th>
                <td>{formatCurrency(unitPrice)}</td>
              </tr>
              <tr>
                <th className="bg-body-tertiary">Quantity used from this batch</th>
                <td>{usageEntry.quantity} {usageEntry.product?.unit || "units"}</td>
              </tr>
              <tr>
                <th className="bg-body-tertiary">Expiry</th>
                <td>{formatDate(source.expiryDate)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-body-secondary py-4">
          No purchase batch linked to this usage entry.
        </div>
      )}
    </div>
  );
}

