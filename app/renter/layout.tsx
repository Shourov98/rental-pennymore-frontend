"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import AgentNavbar from "@/components/agent/AgentNavbar";
import RenterSidebar from "@/components/renter/RenterSidebar";
import {
  selectAuth,
  selectIsAuthed,
  selectSessionReady,
} from "@/store/slices/authSlice";

export default function RenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = useSelector(selectAuth);
  const isAuthed = useSelector(selectIsAuthed);
  const sessionReady = useSelector(selectSessionReady);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const role = auth.role ?? auth.user?.role ?? null;
  const isRenter = role === "Renter";
  const hasRole = Boolean(role);
  const [mounted, setMounted] = useState(false);

  // Close drawer on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => {
    // Hydration gate: render null on server/first client pass, then show layout.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const shouldRedirectHomeOnLogout = () => {
    if (typeof window === "undefined") return false;
    const flag = window.sessionStorage.getItem("logout_redirect_home");
    if (!flag) return false;
    window.sessionStorage.removeItem("logout_redirect_home");
    return true;
  };

  useEffect(() => {
    if (!sessionReady) return;
    if (!isAuthed) {
      router.replace(shouldRedirectHomeOnLogout() ? "/" : "/signin");
      return;
    }
    if (hasRole && !isRenter) {
      router.replace("/agent/dashboard");
    }
  }, [hasRole, isAuthed, isRenter, router, sessionReady]);

  if (!mounted || !sessionReady || !isAuthed || (hasRole && !isRenter)) {
    return null;
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* FIXED NAVBAR */}
      <AgentNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 pt-[72px] overflow-hidden">
        {/* Sidebar (Desktop) */}
        <div className="hidden lg:block w-64 shrink-0">
          <RenterSidebar open={true} />
        </div>

        {/* Sidebar Drawer (Mobile) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />

            <div
              ref={drawerRef}
              className="relative z-50 w-64 h-full bg-white shadow-lg border-r border-gray-200 animate-slideIn"
            >
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <RenterSidebar open={true} />
            </div>
          </div>
        )}

        {/* MAIN CONTENT — ONLY THIS SCROLLS */}
        <main className="flex-1 overflow-y-auto px-2 md:px-2 lg:px-6 py-8">
          {children}
        </main>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
