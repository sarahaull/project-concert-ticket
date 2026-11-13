
import api from "./api";

const eventService = {
  // Daftar event untuk customer
  getAll: (params = {}) => api.get("/events", { params }),

  // Detail event
  getById: (id) => api.get(`/events/${id}`),

  // Denah, section, dan kursi berdasarkan event
  getSeatMap: (eventId) =>
    api.get(`/seats/events/${eventId}`),

  // Upload denah kursi (khusus organizer)
  uploadSeatMap: (formData) =>
    api.post("/uploads/seat-map", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Pencarian event
  search: (keyword) =>
    api.get("/events", {
      params: { search: keyword },
    }),

  // Event berdasarkan kategori
  getByCategory: (categoryId) =>
    api.get("/events", {
      params: { categoryId },
    }),

  // Event berdasarkan penyelenggara
  getByOrganizer: (organizerId) =>
    api.get("/events", {
      params: { organizerId },
    }),
};

export default eventService;
