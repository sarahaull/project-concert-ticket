
import api from "./api";

const profileService = {
  get: () => api.get("/profile"),
  update: (data) => api.put("/profile", data),
  updatePassword: (data) =>
    api.put("/profile/password", data),
};

export default profileService;
