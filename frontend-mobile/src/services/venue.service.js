
import api from "./api";

const venueService = {
  getAll: (params = {}) => api.get("/venues", { params }),
  getById: (id) => api.get(`/venues/${id}`),
  create: (data) => api.post("/venues", data),
  update: (id, data) => api.put(`/venues/${id}`, data),
  remove: (id) => api.delete(`/venues/${id}`),
};

export default venueService;
