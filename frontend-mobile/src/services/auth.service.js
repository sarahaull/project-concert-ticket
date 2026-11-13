
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import api from "./api";

const TOKEN_KEY = "ticketverse_token";
const USER_KEY = "ticketverse_user";

// =====================================================
// STORAGE HELPER
// =====================================================

const saveStorage = async (key, value) => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
};

const getStorage = async (key) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }

  return await SecureStore.getItemAsync(key);
};

const removeStorage = async (key) => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
};

// =====================================================
// SAVE AUTH DATA
// =====================================================

export const saveAuthData = async (token, user) => {
  if (token) {
    await saveStorage(TOKEN_KEY, token);
  }

  if (user) {
    await saveStorage(USER_KEY, JSON.stringify(user));
  }
};

// =====================================================
// REGISTER
// =====================================================

export const registerCustomer = async (payload) => {
  const response = await api.post("/auth/register", payload);

  return response.data;
};

// =====================================================
// LOGIN
// =====================================================

export const loginCustomer = async (payload) => {
  const response = await api.post("/auth/login", payload);

  const result = response.data;

  // Simpan token jika login tidak membutuhkan OTP
  if (result.success && result.token) {
    await saveAuthData(result.token, result.user);
  }

  return result;
};

// =====================================================
// VERIFY LOGIN OTP
// =====================================================

export const verifyLoginOTP = async (payload) => {
  const response = await api.post("/auth/verify-otp", payload);

  const result = response.data;

  if (result.success && result.token) {
    await saveAuthData(result.token, result.user);
  }

  return result;
};

// =====================================================
// FORGOT PASSWORD
// =====================================================

export const forgotPassword = async (payload) => {
  const response = await api.post(
    "/auth/forgot-password",
    payload
  );

  return response.data;
};

// =====================================================
// VERIFY RESET OTP
// =====================================================

export const verifyResetOTP = async (payload) => {
  const response = await api.post(
    "/auth/verify-reset-otp",
    payload
  );

  return response.data;
};

// =====================================================
// RESET PASSWORD
// =====================================================

export const resetPassword = async (payload) => {
  const response = await api.post(
    "/auth/reset-password",
    payload
  );

  return response.data;
};

// =====================================================
// GET SAVED USER
// =====================================================

export const getSavedUser = async () => {
  try {
    const user = await getStorage(USER_KEY);

    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Gagal mengambil data user:", error);
    return null;
  }
};

// =====================================================
// GET SAVED TOKEN
// =====================================================

export const getSavedToken = async () => {
  try {
    return await getStorage(TOKEN_KEY);
  } catch (error) {
    console.error("Gagal mengambil token:", error);
    return null;
  }
};

// =====================================================
// CHECK LOGIN
// =====================================================

export const isLoggedIn = async () => {
  const token = await getSavedToken();

  return Boolean(token);
};

// =====================================================
// LOGOUT
// =====================================================

export const logoutCustomer = async () => {
  await removeStorage(TOKEN_KEY);
  await removeStorage(USER_KEY);

  return {
    success: true,
    message: "Logout berhasil.",
  };
};
