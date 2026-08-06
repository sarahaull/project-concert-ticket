"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, fetchApi, setUser, removeToken } from "@/utils/api";

export default function AuthGuard({ children, fallback }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUserState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = getToken();

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        // If no fallback is provided, redirect to login; otherwise stay on landing page
        if (!fallback) {
          router.push("/login");
        }
        return;
      }

      try {
        const response = await fetchApi("/auth/me");
        if (response.success && response.user) {
          setUserState(response.user);
          setUser(response.user);
          setIsAuthenticated(true);
        } else {
          removeToken();
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth Guard verify failed:", error.message);
        removeToken();
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center text-white relative overflow-hidden">
        {/* Background gradient theme matching login/register */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0f1a2e] to-[#1a0a2e] z-0" />
        
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin shadow-lg shadow-blue-500/20" />
          <p className="text-sm font-light text-white/60 tracking-wider">Memeriksa sesi pengguna...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
  return fallback ? fallback({ setUserState }) : null;
}

return children({ user, setUserState });
}
