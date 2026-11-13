
import api from "./api";

const categoryService = {
  // Semua kategori
  getAll: (params = {}) =>
    api.get("/categories", { params }),

  // Detail kategori
  getById: (id) =>
    api.get(`/categories/${id}`),
};

export default categoryService;
