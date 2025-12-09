"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { logout, selectAuth, selectIsAuthed } from "@/store/slices/authSlice";

export default function AgentNavbar({
  onMenuToggle,
}: {
  onMenuToggle?: () => void;
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const isAuthed = useSelector(selectIsAuthed);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const firstName =
    auth.user?.fullName?.split(" ")[0] ||
    auth.user?.fullName ||
    "Guest";
  const role = auth.role || auth.user?.role || "Agent";
  const avatar = auth.user ? "/agent-avatar.jpg" : "/icons/user.svg";

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/signin");
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
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center gap-1 md:gap-3">
        <button
          onClick={onMenuToggle}
          className="block lg:hidden p-1 md:p-2 lg:p-2 rounded-md hover:bg-gray-100"
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
      <div
        className="relative flex items-center gap-2 md:gap-3 lg:gap-4"
        ref={dropdownRef}
      >
        {/* Avatar & Name */}
        <button
          onClick={() => isAuthed && setDropdownOpen(!dropdownOpen)}
          className="flex items-right md:items-center gap-2 rounded-full hover:bg-gray-100 transition px-2 py-1"
        >
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-300">
            <Image
              src={avatar}
              alt={firstName}
              fill
              className="object-cover"
            />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">
              Hello, {firstName}
            </p>
            <p className="text-xs text-gray-500">{role}</p>
          </div>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute text-black right-0 top-12 w-40 bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden animate-fadeIn">
            <Link
              href="/agent/profile"
              className="block px-4 py-2 text-sm hover:bg-blue-100"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-100"
            >
              Logout
            </button>
          </div>
        )}
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
