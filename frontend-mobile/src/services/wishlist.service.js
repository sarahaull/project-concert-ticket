
import api from "./api";

const wishlistService = {
  getAll: (params = {}) => api.get("/wishlist", { params }),
  getById: (id) => api.get(`/wishlist/${id}`),
  add: (data) => api.post("/wishlist", data),
  remove: (id) => api.delete(`/wishlist/${id}`),
  removeEvent: (eventId) =>
    api.delete(`/wishlist/event/${eventId}`),
};

export default wishlistService;
