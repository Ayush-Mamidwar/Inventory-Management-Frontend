const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

export const inventoryApi = {
  getProducts: () => request("/products"),
  getBills: () => request("/bills"),
  getBillsPage: ({ page = 1, limit = 15 } = {}) =>
    request(`/bills?page=${page}&limit=${limit}`),
  getUsage: (date) =>
    date ? request(`/usage?date=${encodeURIComponent(date)}`) : request("/usage"),
  createProduct: (payload) =>
    request("/products", { method: "POST", body: JSON.stringify(payload) }),
  updateProduct: (id, payload) =>
    request(`/products/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  createBill: (payload) =>
    request("/bills", { method: "POST", body: JSON.stringify(payload) }),
  setBillSettled: (id, settled) =>
    request(`/bills/${id}/settled`, {
      method: "PATCH",
      body: JSON.stringify({ settled }),
    }),
  recordUsage: (payload) =>
    request("/usage", { method: "POST", body: JSON.stringify(payload) }),
};
