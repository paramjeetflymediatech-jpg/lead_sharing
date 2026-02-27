import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from "../services/api";
import { NotificationService } from "../services/NotificationService";

console.log("[AuthContext] Initializing...");
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { token, id, email, role, name }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const json = await AsyncStorage.getItem("auth_user");
        if (json) {
          const userData = JSON.parse(json);
          const authToken = await AsyncStorage.getItem("token");
          setUser(userData);

          // Sync token on every app launch if user exists and we have a token
          if (authToken) {
            setTimeout(async () => {
              try {
                console.log("[AuthContext] Running background push token sync...");
                const pushToken = await NotificationService.registerForPushNotificationsAsync();
                console.log("[AuthContext] Push token obtained:", pushToken ? "YES" : "NO");
                if (pushToken) {
                  await NotificationService.syncTokenWithBackend();
                }
              } catch (e) {
                console.warn("[AuthContext] Background push token sync failed:", e);
              }
            }, 5000);
          }
        }
      } catch (error) {
        console.error("[AuthContext] Error loading user:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function login(userData) {
    setUser(userData);
    await AsyncStorage.setItem("auth_user", JSON.stringify(userData));
    if (userData.token) {
      await AsyncStorage.setItem("token", userData.token);
    }

    // Register push token after login
    try {
      const pushToken = await NotificationService.registerForPushNotificationsAsync();
      if (pushToken) {
        await NotificationService.syncTokenWithBackend();
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
    console.log("[Auth] Updating user with data:", JSON.stringify(userData));
    setUser(prev => {
      const updatedUser = { ...prev, ...userData };
      console.log("[Auth] New user state verificationStatus:", updatedUser.verificationStatus);

      // Background update storage
      AsyncStorage.setItem("auth_user", JSON.stringify(updatedUser)).catch(e => console.error("[Auth] Error saving auth_user:", e));
      if (updatedUser.token) {
        AsyncStorage.setItem("token", updatedUser.token).catch(e => console.error("[Auth] Error saving token:", e));
      }

      return updatedUser;
    });
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
