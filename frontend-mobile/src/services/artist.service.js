
import api from "./api";

const artistService = {
  getAll: (params = {}) => api.get("/artists", { params }),
  getById: (id) => api.get(`/artists/${id}`),
  create: (data) => api.post("/artists", data),
  update: (id, data) => api.put(`/artists/${id}`, data),
  remove: (id) => api.delete(`/artists/${id}`),
};

export default artistService;
