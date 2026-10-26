import { useState } from "react";
import Modal from "./Modal";

export default function DataTable({
  columns,
  rows,
  rowKey,
  emptyMessage = "No records to display.",
  renderModal,
}) {
  const [selectedRow, setSelectedRow] = useState(null);

  const getRowKey = (row, index) =>
    rowKey ? rowKey(row) : row.id ?? index;

  const closeModal = () => setSelectedRow(null);

  const resolveModalTitle = (row) => {
    if (!row) return "Record Details";
    if (typeof row.name === "string" && row.name) return row.name;
    if (typeof row.product?.name === "string" && row.product.name) return row.product.name;
    if (row.billNumber) return row.billNumber;
    if (row.productName) return row.productName;
    return "Record Details";
  };

  const resolveModalContent = (row) => {
    if (!row) return null;

    if (typeof renderModal === "function") return renderModal(row);
    if (Array.isArray(row.items)) return <BillDetails bill={row} />;
    if (row.product || row.billItem || row.sourceBillItem || row.purchaseEntry) {
      return <UsageDetails usageEntry={row} />;
    }
    if (Array.isArray(row.billItems)) return <ProductPurchaseDetails product={row} />;

    return <ProductPurchaseDetails product={row} />;
  };

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={column.headerClassName || ""}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-5 text-center text-body-secondary"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  onClick={(event) => {
                    // Don't open the modal when clicking an interactive element.
                    if (
                      event.target.closest(
                        "button, a, input, select, textarea, label, [data-no-row-modal]"
                      )
                    ) {
                      return;
                    }

                    setSelectedRow(row);
                  }}
                  role="button"
                  tabIndex={0}
                  title="Click to view details"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedRow(row);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={column.cellClassName || ""}
                    >
                      {column.render
                        ? column.render(row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        show={Boolean(selectedRow)}
        onClose={closeModal}
        title={selectedRow ? resolveModalTitle(selectedRow) : "Record Details"}
      >
        {selectedRow && resolveModalContent(selectedRow)}
      </Modal>
    </>
  );
}

function ProductPurchaseDetails({ product }) {
  const billItems = product.billItems || [];

  const formatDate = (date) => {
    if (!date) return "Not provided";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  return (
    <div>
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="border rounded p-3 h-100">
            <div className="small text-body-secondary">Current stock</div>
            <div className="fs-5 fw-semibold">
              {product.currentStock ?? 0} {product.unit}
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="border rounded p-3 h-100">
            <div className="small text-body-secondary">Minimum stock</div>
            <div className="fs-5 fw-semibold">
              {product.limit ?? 0} {product.unit}
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="border rounded p-3 h-100">
            <div className="small text-body-secondary">Total purchased</div>
            <div className="fs-5 fw-semibold">
              {product.purchased ?? 0} {product.unit}
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="border rounded p-3 h-100">
            <div className="small text-body-secondary">Total consumed</div>
            <div className="fs-5 fw-semibold">
              {product.consumed ?? 0} {product.unit}
            </div>
          </div>
        </div>
      </div>

      <h6 className="fw-semibold mb-3">Purchase history</h6>

      {billItems.length === 0 ? (
        <div className="text-center text-body-secondary py-4">
          No purchase history available for this product.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Bill no.</th>
                <th>Purchase date</th>
                <th>Qty</th>
                <th>Consumed</th>
                <th>Remaining</th>
                <th>Unit price</th>
                <th>Line total</th>
                <th>Expiry date</th>
                <th>Payment</th>
              </tr>
            </thead>

            <tbody>
              {billItems.map((item, index) => {
                const bill = item.bill || {};
                const consumed = Number(item.consumedQuantity || 0);
                const remaining = Number(item.remainingQuantity ?? (Number(item.quantity || 0) - consumed));

                return (
                  <tr key={`${bill.id || bill.billNumber || "bill"}-${index}`}>
                    <td>{bill.billNumber || "—"}</td>
                    <td>{formatDate(bill.billDate)}</td>
                    <td>
                      {item.quantity} {product.unit}
                    </td>
                    <td>{consumed} {product.unit}</td>
                    <td>{remaining} {product.unit}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>
                      {formatCurrency(
                        Number(item.quantity || 0) *
                          Number(item.unitPrice || 0)
                      )}
                    </td>
                    <td>{formatDate(item.expiryDate)}</td>
                    <td>
                      <span
                        className={`badge ${
                          bill.settled
                            ? "text-bg-success"
                            : "text-bg-warning"
                        }`}
                      >
                        {bill.settled ? "Settled" : "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BillDetails({ bill }) {
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

  const items = bill.items || [];
  const total = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0
  );

  return (
    <div>
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="border rounded p-3 h-100">
            <div className="small text-body-secondary">Bill no.</div>
            <div className="fs-5 fw-semibold">{bill.billNumber || bill.id?.slice(0, 8) || "—"}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="border rounded p-3 h-100">
            <div className="small text-body-secondary">Purchase date</div>
            <div className="fs-5 fw-semibold">{formatDate(bill.billDate)}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="border rounded p-3 h-100">
            <div className="small text-body-secondary">Invoice total</div>
            <div className="fs-5 fw-semibold">{formatCurrency(total)}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="border rounded p-3 h-100">
            <div className="small text-body-secondary">Payment</div>
            <div className="fs-5 fw-semibold">
              <span className={`badge ${bill.settled ? "text-bg-success" : "text-bg-warning"}`}>
                {bill.settled ? "Settled" : "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <h6 className="fw-semibold mb-3">Products in this bill</h6>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit price</th>
              <th>Line total</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.productId || item.product?.id || "item"}-${index}`}>
                <td>{item.product?.name || item.productName || item.productId || "—"}</td>
                <td>{item.quantity} {item.product?.unit || bill.unit || ""}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td>{formatCurrency(Number(item.quantity || 0) * Number(item.unitPrice || 0))}</td>
                <td>{item.expiryDate ? formatDate(item.expiryDate) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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
