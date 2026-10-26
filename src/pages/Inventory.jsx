import { useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import { formatNumber } from "../utils/formatters";

const units = [
  ["kg", "Kilograms (kg)"], ["g", "Grams (g)"], ["litre", "Litres"],
  ["ml", "Millilitres (ml)"], ["pcs", "Pieces (pcs)"], ["pack", "Packs"], ["box", "Boxes"],
];

export default function Inventory({ products, runAction, createProduct, updateProduct }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("kg");
  const [limit, setLimit] = useState("0");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())), [products, search]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const ok = await runAction(() => createProduct({
      name: name.trim(), unit, limit: Number(limit),
    }), "Product created successfully");
    setSaving(false);
    if (ok) { setName(""); setUnit("kg"); setLimit("0"); setShowForm(false); }
  };

  // Product creation is supplied by the parent through runActionWithPayload below.
  const columns = [
    { key: "name", label: "Product", render: (p) => <div><div className="fw-semibold">{p.name}</div><div className="small text-body-secondary font-monospace">{p.id.slice(0, 8)}</div></div> },
    { key: "currentStock", label: "Available stock", render: (p) => <span className="fw-semibold">{formatNumber(p.currentStock)} <span className="text-body-secondary fw-normal">{p.unit}</span></span> },
    { key: "limit", label: "Minimum level", render: (p) => `${formatNumber(p.limit)} ${p.unit}` },
    { key: "billItems", label: "Purchase entries", render: (p) => p.billItems?.length || 0 },
    { key: "lowStock", label: "Status", render: (p) => <StatusBadge status={p.lowStock ? "low stock" : "in stock"}>{p.lowStock ? "Low stock" : "In stock"}</StatusBadge> },
    { key: "actions", label: "", headerClassName: "text-end", cellClassName: "text-end", render: (p) => <button className="btn btn-sm btn-outline-secondary" onClick={() => editLimit(p)}><i className="bi bi-pencil me-1" />Edit limit</button> },
  ];

  async function editLimit(product) {
    const value = window.prompt(`Minimum stock limit in ${product.unit}`, String(product.limit));
    if (value === null) return;
    if (!value.trim() || !Number.isFinite(Number(value)) || Number(value) < 0) {
      window.alert("Enter a valid non-negative stock limit.");
      return;
    }
    await runAction(() => updateProduct(product.id, { limit: Number(value) }), "Minimum stock limit updated");
  }

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Maintain your product catalog and keep minimum stock levels up to date."
        action={<button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}><i className="bi bi-plus-lg me-2" />Add product</button>}
      />

      {showForm && (
        <section className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h2 className="h6 fw-semibold mb-3">Add a product</h2>
            <form onSubmit={submit}>
              <div className="row g-3">
                <div className="col-12 col-md-5">
                  <label className="form-label">Product name</label>
                  <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tomatoes" required />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label">Unit</label>
                  <select className="form-select" value={unit} onChange={(e) => setUnit(e.target.value)}>
                    {units.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div className="col-6 col-md-4">
                  <label className="form-label">Minimum stock level</label>
                  <input className="form-control" type="number" min="0" step="0.01" value={limit} onChange={(e) => setLimit(e.target.value)} required />
                </div>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save product"}</button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </section>
      )}

      <section className="card border-0 shadow-sm">
        <div className="card-body p-3 p-md-4 border-bottom">
          <div className="row g-3 align-items-center">
            <div className="col"><h2 className="h6 fw-semibold mb-1">All products</h2><p className="small text-body-secondary mb-0">{filtered.length} products in catalog</p></div>
            <div className="col-12 col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-body"><i className="bi bi-search" /></span>
                <input className="form-control" placeholder="Search inventory" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        <DataTable columns={columns} rows={filtered} emptyMessage="No products found. Add your first product to get started." />
      </section>
    </>
  );
}
