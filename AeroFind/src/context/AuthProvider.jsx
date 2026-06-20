import { useState, useEffect } from "react";
import { getMe, logout as apiLogout } from "../api/auth";
import { getToken } from "../api/client";
import AuthContext from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // on app load, try to restore session from stored token
  useEffect(() => {
    async function restore() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const me = await getMe();
        setUser(me);
      } catch {
        // token invalid or expired beyond refresh
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restore();
  }, []);

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
