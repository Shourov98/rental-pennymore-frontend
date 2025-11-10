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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Fixed Navbar */}
      <AgentNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AgentSidebar open={sidebarOpen} />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
