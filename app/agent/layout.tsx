"use client";

import { useState } from "react";
import AgentNavbar from "@/components/agent/AgentNavbar";
import AgentSidebar from "@/components/agent/AgentSidebar";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* ✅ Fixed Navbar */}
      <AgentNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 pt-[72px]">
        {/* 👆 Add top padding equal to navbar height */}

        {/* ✅ Sidebar */}
        <div className="w-64 flex-shrink-0">
          <AgentSidebar open={sidebarOpen} />
        </div>

        {/* ✅ Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
