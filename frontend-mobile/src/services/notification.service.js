
import api from "./api";

const getPayload = (response) => response?.data?.data ?? response?.data ?? {};

const getNotifications = async (userId) => {
  if (!userId) {
    throw new Error("ID user tidak ditemukan.");
  }

  const response = await api.get(`/notifications/user/${userId}`);
  const payload = getPayload(response);

  const notifications = Array.isArray(payload)
    ? payload
    : payload.notifications || payload.data || [];

  return notifications;
};

const markAsRead = async (notificationId) => {
  if (!notificationId) {
    throw new Error("ID notifikasi tidak ditemukan.");
  }

  const response = await api.patch(
    `/notifications/${notificationId}/read`
  );

  return getPayload(response);
};

const markAllAsRead = async (notifications) => {
  const unread = notifications.filter(
    (item) => !item.is_read && Number(item.is_read) !== 1
  );

  const results = await Promise.allSettled(
    unread.map((item) => markAsRead(item.id))
  );

  const failed = results.filter(
    (result) => result.status === "rejected"
  );

  if (failed.length > 0) {
    throw new Error(
      `${failed.length} notifikasi gagal diperbarui.`
    );
  }

  return true;
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};

export default notificationService;
