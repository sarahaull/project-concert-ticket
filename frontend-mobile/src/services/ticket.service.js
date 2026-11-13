
import api from "./api";

const ticketService = {
  getAll: (params = {}) => api.get("/tickets", { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  getByEvent: (eventId) =>
    api.get(`/tickets/event/${eventId}`),
  create: (data) => api.post("/tickets", data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  remove: (id) => api.delete(`/tickets/${id}`),
};

export default ticketService;
