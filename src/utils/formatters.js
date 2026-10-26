export const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 }).format(Number(value) || 0);

export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const localDateInput = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const getBillTotal = (bill) =>
  (bill.items || []).reduce(
    (total, item) => total + Number(item.quantity) * Number(item.unitPrice),
    0
  );

export const isInMonth = (value, month) => {
  if (!value || !month) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` === month;
};

export const currentMonth = () => new Date().toISOString().slice(0, 7);
