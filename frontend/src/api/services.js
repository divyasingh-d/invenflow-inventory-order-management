import api from "./axios";

// Products API
export const productsApi = {
  getAll: (params = {}) => api.get("/products/", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products/", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Customers API
export const customersApi = {
  getAll: (params = {}) => api.get("/customers/", { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post("/customers/", data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Orders API
export const ordersApi = {
  getAll: (params = {}) => api.get("/orders/", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post("/orders/", data),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
};
