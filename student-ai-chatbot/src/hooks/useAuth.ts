// ============================================================
//  useAuth — reads the saved user from localStorage.
//  After a successful loginUser() call in SignInModal,
//  the user object is stored here and available app-wide.
// ============================================================
import { useState, useEffect } from "react";
import type { AuthResponse } from "@/lib/api";

type User = AuthResponse["user"] | null;

const USER_KEY = "studymind_user";

export function useAuth() {
  const [user, setUser] = useState<User>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === USER_KEY) {
        try {
          setUser(e.newValue ? (JSON.parse(e.newValue) as User) : null);
        } catch {
          setUser(null);
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function saveUser(u: User) {
    setUser(u);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  }

  return { user, saveUser };
}
