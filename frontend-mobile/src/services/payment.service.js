
import api from "./api";

const paymentService = {
  getAll: (params = {}) => api.get("/payments", { params }),

  getById: (id) => api.get(`/payments/${id}`),

  create: (data) => api.post("/payments", data),

  checkStatus: (orderCode) => {
    if (!orderCode) {
      throw new Error("Kode pesanan tidak ditemukan.");
    }

    return api.get(
      `/payments/midtrans-status/${encodeURIComponent(orderCode)}`
    );
  },

  verify: (data) => api.post("/payments/verify", data),
};

export const getMidtransPaymentStatus = async (orderCode) => {
  return paymentService.checkStatus(orderCode);
};

export default paymentService;
