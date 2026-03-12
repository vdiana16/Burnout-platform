import { createContext, useContext, useMemo, useState } from "react";
import { authApi } from "../features/auth/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("access"));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    // Verificăm dacă există și dacă NU este textul "undefined"
    if (storedUser && storedUser !== "undefined") {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error("Eroare la parsarea user-ului din localStorage", e);
        return null;
      }
    }
    return null;
  });

  const isAuthenticated = !!accessToken;

  const login = async (credentials) => {
    try {
      // CORECT: Trimitem doar obiectul credentials
      const response = await authApi.login(credentials);
      const { access, refresh, user } = response.data;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("user", JSON.stringify(user));

      setAccessToken(access);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.clear();
    setAccessToken(null);
    setUser(null);
  };

  const register = async (userData) => {
    try {
      // 1. Trimitem datele la server pentru creare cont
      await authApi.register(userData);
      
      // 2. Logăm utilizatorul automat folosind aceleași credențiale
      // Notă: Folosim login-ul definit mai sus în Context
      await login({ 
        username: userData.username, 
        password: userData.password 
      });
      
      return true; // Semnalăm succesul
    } catch (error) {
      console.error("Eroare la înregistrare:", error);
      throw error;
    }
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    login,
    logout,
    register,
  }), [user, isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);