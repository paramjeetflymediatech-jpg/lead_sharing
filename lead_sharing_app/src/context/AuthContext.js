import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { token, id, email, role, name }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const json = await AsyncStorage.getItem("auth_user");
        if (json) {
          setUser(JSON.parse(json));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function login(userData) {
    setUser(userData);
    await AsyncStorage.setItem("auth_user", JSON.stringify(userData));

    // Register push token after login (if available)
    try {
      // In a real app, you'd get the actual token from expo-notifications or firebase
      // For now, we'll placeholder this or use a dummy token if we want to test the flow
      const pushToken = await AsyncStorage.getItem("push_device_token");
      if (pushToken && authAPI.registerPushToken) {
        await authAPI.registerPushToken(pushToken, Platform.OS);
      }
    } catch (e) {
      console.warn("Error registering push token on login:", e);
    }
  }

  async function logout() {
    try {
      await authAPI.logout();
    } catch (e) {
      console.warn("Logout API call failed:", e);
    }
    setUser(null);
    await AsyncStorage.removeItem("auth_user");
    await AsyncStorage.removeItem("token");
  }

  async function updateUser(userData) {
    setUser(userData);
    await AsyncStorage.setItem("auth_user", JSON.stringify(userData));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
