import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  }

  async function logout() {
    setUser(null);
    await AsyncStorage.removeItem("auth_user");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
