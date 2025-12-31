"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import AgentNavbar from "@/components/agent/AgentNavbar";
import AgentSidebar from "@/components/agent/AgentSidebar";
import { selectAuth, selectIsAuthed } from "@/store/slices/authSlice";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = useSelector(selectAuth);
  const isAuthed = useSelector(selectIsAuthed);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const role = auth.role ?? auth.user?.role ?? null;
  const isAgent = role === "Agent";
  const hasRole = Boolean(role);
  const [mounted, setMounted] = useState(false);

  // ✅ Close drawer on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => {
    // Hydration gate: render null on server/first client pass, then show layout.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthed) {
      router.replace("/signin");
      return;
    }
    if (hasRole && !isAgent) {
      router.replace("/renter/saved-requests");
    }
  }, [hasRole, isAgent, isAuthed, router]);

  if (!mounted || !isAuthed || (hasRole && !isAgent)) {
    return null;
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      {/* ✅ Fixed Navbar */}
      <AgentNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 pt-[72px] relative min-h-0">
        {/* ✅ Sidebar (Desktop) */}
        <div className="hidden lg:block w-64 shrink-0">
          <AgentSidebar open={true} />
        </div>

        {/* ✅ Drawer (Mobile & Tablet) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Sidebar Drawer */}
            <div
              ref={drawerRef}
              className="relative z-50 w-64 h-full bg-white shadow-lg border-r border-gray-200 transform translate-x-0 animate-slideIn"
            >
              {/* Close Button */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <AgentSidebar open={true} />
            </div>
          </div>
        )}

        {/* ✅ Main Content */}
        <main className="flex-1 px-2 md:px-2 lg:px-6 py-8 bg-gray-50 overflow-y-auto min-h-0">
          {children}
        </main>
      </div>

      {/* ✅ Slide-in Animation */}
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
