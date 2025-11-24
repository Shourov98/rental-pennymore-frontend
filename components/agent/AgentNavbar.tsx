"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, Bell } from "lucide-react";
import Link from "next/link";

export default function AgentNavbar({
  onMenuToggle,
}: {
  onMenuToggle?: () => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = {
    name: "Steve",
    role: "Agent",
    avatar: "/agent-avatar.jpg", // must exist in /public
    notifications: 12,
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="block lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-black pr-3">
            <Image
              src="/Logo_1.svg"
              alt="Logo"
              width={200}
              height={150}
              className="w-[120px] md:w-[160px] lg:w-[200px] h-auto"
            />
          </Link>
        </div>

        {/* User Section */}
        <div className="relative flex items-center gap-4" ref={dropdownRef}>
          {/* Notification Bell */}
          <div className="relative">
            <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-blue-600" />
            {user.notifications > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full px-[5px]">
                {user.notifications}
              </span>
            )}
          </div>

          {/* Avatar & Name */}
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-full hover:bg-gray-100 transition px-2 py-1"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-300">
              <Image
                src={user.avatar}
                alt={user.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">
                Hello, {user.name}
              </p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute text-black right-0 top-12 w-40 bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden animate-fadeIn">
              <a
                href="/agent/profile"
                className="block px-4 py-2 text-sm hover:bg-blue-100"
              >
                Profile
              </a>
              <a
                href="/logout"
                className="block px-4 py-2 text-sm hover:bg-blue-100"
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </nav>
  );
}
