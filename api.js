// src/services/api.js
const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000/api";

// simple local storage helpers
const storage = {
  get token() { return localStorage.getItem("token") || ""; },
  set token(v) { v ? localStorage.setItem("token", v) : localStorage.removeItem("token"); },

  get user() {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  },
  set user(v) { v ? localStorage.setItem("user", JSON.stringify(v)) : localStorage.removeItem("user"); },
};

async function request(path, opts = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(storage.token ? { Authorization: `Bearer ${storage.token}` } : {}),
    ...(opts.headers || {}),
  };

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...opts, headers });
  } catch {
    throw new Error("Network error. Is the backend running?");
  }

  // auto-logout on 401
  if (res.status === 401) {
    storage.token = "";
    storage.user = null;
  }

  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const payload = isJson ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const msg =
      (isJson && (payload?.error || payload?.message)) ||
      (typeof payload === "string" && payload) ||
      `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return payload;
}

// ---- Admin-only users list (mounted at /api/auth/users)
const listUsers = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return request(`/auth/users${q ? `?${q}` : ""}`);
};

// ⬇️ NEW: delete user (SuperAdmin)
const deleteUser = (id) =>
  request(`/auth/users/${id}`, { method: "DELETE" });

export const api = {
  // ---- Auth
  async login(email, password) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data?.token) storage.token = data.token;
    if (data?.user)  storage.user  = data.user;
    return data;
  },

  async register(body) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // ✅ Forgot / Reset password (link + OTP)
  forgotPassword: (email) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email, otp) =>
    request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),

  resetPassword: (token, password) =>
    request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  logout() {
    storage.token = "";
    storage.user = null;
  },

  // ---- Catalog (public)
  categories: () => request("/categories"),

  products: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/products${q ? `?${q}` : ""}`);
  },

  product: (id) => request(`/products/${id}`),

  // Category → Products (with pagination/search support)
  categoryProducts: (id, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/categories/${id}/products${q ? `?${q}` : ""}`);
  },

  // ---- Admin-only (token auto-attached)
  // Categories
  createCategory: (name) =>
    request("/categories", { method: "POST", body: JSON.stringify({ name }) }),

  updateCategory: (id, name) =>
    request(`/categories/${id}`, { method: "PUT", body: JSON.stringify({ name }) }),

  deleteCategory: (id) =>
    request(`/categories/${id}`, { method: "DELETE" }),

  // Products
  createProduct: (body) =>
    request("/products", { method: "POST", body: JSON.stringify(body) }), // {name, price, description, categoryId, imageUrl}

  updateProduct: (id, body) =>
    request(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  deleteProduct: (id) =>
    request(`/products/${id}`, { method: "DELETE" }),

  // Users (Admin/SuperAdmin)
  listUsers,        // preferred name
  users: listUsers, // alias for backwards compatibility
  deleteUser,       // ⬅️ added
};

export default api;
