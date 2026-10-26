import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/common/StatCard";
import PageHeader from "../components/layout/PageHeader";
import DataTable from "../components/common/DataTable";
import {
  currentMonth,
  formatDate,
  formatMoney,
  formatNumber,
  getBillTotal,
  isInMonth,
} from "../utils/formatters";

export default function Reports({ products, bills, usage }) {
  const [month, setMonth] = useState(currentMonth());
  const [selectedDay, setSelectedDay] = useState("");

  const monthBills = bills.filter((b) => isInMonth(b.billDate, month));
  const monthUsage = usage.filter((u) => isInMonth(u.usedAt, month));
  const purchases = monthBills.reduce((sum, b) => sum + getBillTotal(b), 0);
  const outstanding = monthBills
    .filter((b) => !b.settled)
    .reduce((sum, b) => sum + getBillTotal(b), 0);

  const productAverageCost = useMemo(() => {
    const totals = new Map();

    (bills || []).forEach((bill) => {
      (bill.items || []).forEach((item) => {
        const productId = item.productId || item.product?.id;
        if (!productId) return;

        const current = totals.get(productId) || { cost: 0, quantity: 0 };
        current.cost += Number(item.quantity) * Number(item.unitPrice);
        current.quantity += Number(item.quantity);
        totals.set(productId, current);
      });
    });

    return new Map(
      [...totals.entries()].map(([productId, values]) => [
        productId,
        values.quantity ? values.cost / values.quantity : 0,
      ])
    );
  }, [bills]);

  const quantities = useMemo(() => {
    const grouped = new Map();

    monthUsage.forEach((entry) => {
      const key = entry.product.id;
      const unitPrice = Number(
        entry.unitPrice ??
          entry.billItem?.unitPrice ??
          entry.purchaseEntry?.unitPrice ??
          productAverageCost.get(key) ??
          0
      );
      const value = Number(entry.quantity) * unitPrice;
      const previous = grouped.get(key) || {
        id: key,
        name: entry.product.name,
        unit: entry.product.unit,
        quantity: 0,
        value: 0,
      };

      previous.quantity += Number(entry.quantity);
      previous.value += value;
      grouped.set(key, previous);
    });

    return [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [monthUsage, productAverageCost]);

  const totalConsumptionValue = quantities.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  const dailyConsumption = useMemo(() => {
    const grouped = new Map();

    monthUsage.forEach((entry) => {
      const dateKey = new Date(entry.usedAt).toISOString().slice(0, 10);
      const productId = entry.product.id;
      const unitPrice = Number(
        entry.unitPrice ??
          entry.billItem?.unitPrice ??
          entry.purchaseEntry?.unitPrice ??
          productAverageCost.get(productId) ??
          0
      );
      const value = Number(entry.quantity) * unitPrice;

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, {
          dateKey,
          totalValue: 0,
          entries: [],
        });
      }

      const bucket = grouped.get(dateKey);
      let productEntry = bucket.entries.find((item) => item.productId === productId);

      if (!productEntry) {
        productEntry = {
          productId,
          productName: entry.product.name,
          unit: entry.product.unit,
          quantity: 0,
          value: 0,
        };
        bucket.entries.push(productEntry);
      }

      productEntry.quantity += Number(entry.quantity);
      productEntry.value += value;
      bucket.totalValue += value;
    });

    return [...grouped.values()].sort(
      (a, b) => new Date(b.dateKey) - new Date(a.dateKey)
    );
  }, [monthUsage, productAverageCost]);

  useEffect(() => {
    if (!dailyConsumption.length) {
      setSelectedDay("");
      return;
    }

    if (!selectedDay || !dailyConsumption.some((day) => day.dateKey === selectedDay)) {
      setSelectedDay(dailyConsumption[0].dateKey);
    }
  }, [dailyConsumption, selectedDay]);

  const selectedDayData =
    dailyConsumption.find((day) => day.dateKey === selectedDay) || dailyConsumption[0] || null;

  const columns = [
    {
      key: "name",
      label: "Product",
      render: (p) => <span className="fw-semibold">{p.name}</span>,
    },
    {
      key: "quantity",
      label: "Total quantity used",
      render: (p) => `${formatNumber(p.quantity)} ${p.unit}`,
    },
    {
      key: "value",
      label: "Total consumed value",
      render: (p) => <span className="fw-semibold text-primary">{formatMoney(p.value)}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Reports"
        description="Review recorded purchases, outstanding invoices and consumption volumes."
      />

      <section className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-md-4 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
          <div>
            <h2 className="h6 fw-semibold mb-1">Monthly summary</h2>
            <p className="small text-body-secondary mb-0">
              Choose a month to review its activity.
            </p>
          </div>
          <div>
            <label className="form-label">Report month</label>
            <input
              type="month"
              className="form-control"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="row g-3 mb-4">
        <StatCard
          title="Purchase value"
          value={purchases}
          isCurrency
          caption={`${monthBills.length} bills in selected month`}
          icon="bi-cart-check"
          tone="success"
        />
        <StatCard
          title="Unsettled bills"
          value={outstanding}
          isCurrency
          caption="Invoices marked unpaid"
          icon="bi-receipt"
          tone="warning"
        />
        <StatCard
          title="Stock consumed"
          value={totalConsumptionValue}
          isCurrency
          caption={`${formatNumber(quantities.reduce((sum, item) => sum + Number(item.quantity || 0), 0))} units used`}
          icon="bi-clipboard-check"
          tone="primary"
        />
        <StatCard
          title="Low stock products"
          value={products.filter((p) => p.lowStock).length}
          caption="Current stock alerts"
          icon="bi-exclamation-triangle"
          tone="danger"
        />
      </div>

      <div className="alert alert-info d-flex gap-2" role="note">
        <i className="bi bi-info-circle mt-1" />
        <div>
          <strong>Consumption value note.</strong> Daily usage values use the selected purchase batch price when available,
          and fall back to the product average only when no batch cost is linked to the record.
        </div>
      </div>

      <section className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-3">
            <div>
              <h2 className="h6 fw-semibold mb-1">Day-wise consumption</h2>
              <p className="small text-body-secondary mb-0">
                See the total inventory value consumed on each day.
              </p>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">Select day</label>
              <select
                className="form-select"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                disabled={!dailyConsumption.length}
              >
                {dailyConsumption.length ? (
                  dailyConsumption.map((day) => (
                    <option key={day.dateKey} value={day.dateKey}>
                      {formatDate(day.dateKey)}
                    </option>
                  ))
                ) : (
                  <option value="">No usage days</option>
                )}
              </select>
            </div>
          </div>

          {selectedDayData ? (
            <>
              <div className="d-flex justify-content-between align-items-center border rounded-3 p-3 bg-body-tertiary mb-3">
                <div>
                  <div className="small text-body-secondary">Selected day</div>
                  <div className="fw-semibold">{formatDate(selectedDayData.dateKey)}</div>
                </div>
                <div className="h5 fw-semibold mb-0 text-primary">
                  {formatMoney(selectedDayData.totalValue)}
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Quantity used</th>
                      <th>Selected purchase rate</th>
                      <th className="text-end">Estimated value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDayData.entries.map((entry) => {
                      const usageRate = entry.quantity ? entry.value / entry.quantity : 0;

                      return (
                        <tr key={entry.productId}>
                          <td className="fw-semibold">{entry.productName}</td>
                          <td>
                            {formatNumber(entry.quantity)} {entry.unit}
                          </td>
                          <td>{formatMoney(usageRate)} / {entry.unit}</td>
                          <td className="text-end fw-semibold">{formatMoney(entry.value)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-body-secondary py-3">No usage records found for the selected month.</div>
          )}
        </div>
      </section>

      <section className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="p-4 border-bottom">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
              <div>
                <h2 className="h6 fw-semibold mb-1">Consumption by product</h2>
                <p className="small text-body-secondary mb-0">
                  Total quantities and value recorded for the selected month.
                </p>
              </div>
              <div className="fw-semibold text-primary">
                Total consumed value: {formatMoney(totalConsumptionValue)}
              </div>
            </div>
          </div>
          <DataTable
            columns={columns}
            rows={quantities}
            emptyMessage="No usage records for this month."
          />
        </div>
      </section>
    </>
  );
}
