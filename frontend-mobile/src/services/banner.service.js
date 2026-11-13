
import api from "./api";

const bannerService = {
  getAll: (params = {}) => api.get("/banners", { params }),
  getById: (id) => api.get(`/banners/${id}`),
  create: (data) => api.post("/banners", data),
  update: (id, data) => api.put(`/banners/${id}`, data),
  remove: (id) => api.delete(`/banners/${id}`),
};

export default bannerService;
