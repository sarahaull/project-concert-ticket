
import api from "./api";

const reviewService = {
  getAll: (params = {}) => api.get("/reviews", { params }),
  getById: (id) => api.get(`/reviews/${id}`),
  getByEvent: (eventId) =>
    api.get(`/reviews/event/${eventId}`),
  create: (data) => api.post("/reviews", data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  remove: (id) => api.delete(`/reviews/${id}`),
};

export default reviewService;
