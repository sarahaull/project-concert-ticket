
import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  "http://192.168.1.10:5000/api"
).replace(/\/+$/, "");

console.log("TICKETVERSE API:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      let token = null;

      if (Platform.OS === "web") {
        token = localStorage.getItem("ticketverse_token");
      } else {
        token = await SecureStore.getItemAsync("ticketverse_token");
      }

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error("Token interceptor error:", error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API REQUEST ERROR:", {
      url: error.config?.baseURL + error.config?.url,
      message: error.message,
      status: error.response?.status,
      response: error.response?.data,
    });

    return Promise.reject(error);
  }
);

export default api;
