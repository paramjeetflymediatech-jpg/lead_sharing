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
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    async function load() {
      try {
        const json = await AsyncStorage.getItem("auth_user");
        if (json) {
          const userData = JSON.parse(json);
          const authToken = await AsyncStorage.getItem("token");
          if (isMountedRef.current) {
            setUser(userData);
          }

          // Sync token on every app launch if user exists and we have a token
          // if (authToken && isMountedRef.current) {
          //   setTimeout(async () => {
          //     if (!isMountedRef.current) return;
          //     try {
          //       console.log("[AuthContext] Running background push token sync...");
          //       const pushToken = await NotificationService.registerForPushNotificationsAsync();
          //       console.log("[AuthContext] Push token obtained:", pushToken ? "YES" : "NO");
          //       if (pushToken && isMountedRef.current) {
          //         await NotificationService.syncTokenWithBackend();
          //       }
          //     } catch (e) {
          //       console.warn("[AuthContext] Background push token sync failed:", e);
          //     }
          //   }, 5000);
          // }
        }
      } catch (error) {
        console.error("[AuthContext] Error loading user:", error);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    }
    load();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function login(userData) {
    if (!isMountedRef.current) return;
    try {
      setUser(userData);
      await AsyncStorage.setItem("auth_user", JSON.stringify(userData));
      if (userData.token) {
        await AsyncStorage.setItem("token", userData.token);
      }

      // Register push token after login
      // try {
      //   const pushToken = await NotificationService.registerForPushNotificationsAsync();
      //   if (pushToken && isMountedRef.current) {
      //     await NotificationService.syncTokenWithBackend();
      //   }
      // } catch (e) {
      //   console.warn("Error registering push token on login:", e);
      // }
    } catch (e) {
      console.error("[AuthContext] Error in login:", e);
    }
  }

  async function logout() {
    if (!isMountedRef.current) return;
    try {
      await authAPI.logout();
    } catch (e) {
      console.warn("Logout API call failed:", e);
    }
    if (isMountedRef.current) {
      setUser(null);
    }
    try {
      await AsyncStorage.removeItem("auth_user");
      await AsyncStorage.removeItem("token");
    } catch (e) {
      console.error("[AuthContext] Error clearing storage on logout:", e);
    }
  }

  async function updateUser(userData) {
    if (!isMountedRef.current) return;
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
