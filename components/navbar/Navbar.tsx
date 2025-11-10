"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, ChevronDown, User } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const user = {
    firstName: "John",
    role: "Renter", // or "Agent"
  };

  const navItems = ["Home", "About", "Monthly Report", "Contact Us"];

  const userMenu = [
    { label: "Dashboard", icon: "/icons/dashboard-square-01.svg" },
    { label: "Profile", icon: "/icons/user.svg" },
    { label: "Pre-Market Requests", icon: "/icons/file-01.svg" },
    { label: "Notification", icon: "/icons/notification-01.svg" },
    { label: "Settings", icon: "/icons/settings-01.svg" },
    { label: "Logout", icon: "/icons/logout-01.svg" },
  ];

  // ✅ Close dropdown when mouse leaves
  const handleMouseLeave = () => {
    setTimeout(() => setDropdownOpen(false), 150);
  };

  // ✅ Detect outside clicks to close drawer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="md:max-w-11/12 lg:max-w-10/12 mx-auto px-4 md:px-8 flex justify-between items-center py-4">
        {/* Logo */}
        <div className="text-2xl font-bold text-black">Logo</div>

        {/* Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-800">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveItem(item)}
              className={`relative pb-1 lg:px-2 transition ${
                activeItem === item ? "text-blue-600" : "hover:text-blue-600"
              }`}
            >
              {item}
              <span
                className={`absolute left-0 bottom-0 h-[3px] rounded-full bg-blue-600 transition-all duration-300 ${
                  activeItem === item
                    ? "w-full opacity-100"
                    : "w-0 opacity-0 group-hover:w-full"
                }`}
              ></span>
            </button>
          ))}
        </div>

        {/* User Section */}
        <div
          className="hidden md:flex items-center relative"
          ref={dropdownRef}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">
                  Hey, {user.firstName}
                </p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
            <ChevronDown size={18} className="text-gray-600" />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white shadow-lg rounded-lg border-gray-600 animate-fadeIn">
              {userMenu.map((menu) => (
                <a
                  key={menu.label}
                  href="#"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-blue-100 text-gray-800 text-sm"
                >
                  <Image
                    src={menu.icon}
                    alt={menu.label}
                    width={18}
                    height={18}
                    className="opacity-80"
                  />
                  {menu.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X size={22} />
          ) : (
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">
                  Hey, {user.firstName}
                </p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <ChevronDown size={18} className="text-gray-600" />
            </div>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/30 z-40">
          <div
            ref={drawerRef}
            className="absolute right-0 top-0 w-64 h-full bg-white shadow-xl flex flex-col p-6 gap-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-bold">Logo</span>
              <X
                size={22}
                className="cursor-pointer"
                onClick={() => setMenuOpen(false)}
              />
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 mb-2 border-b pb-2">
              <User className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-800">
                  Hey, {user.firstName}
                </p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>

            {/* Nav Items */}
            <div className="flex flex-col">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveItem(item);
                    setMenuOpen(false);
                  }}
                  className={`relative text-left gap-4 pb-1 ${
                    activeItem === item
                      ? "text-blue-600 font-medium"
                      : "text-gray-800 hover:text-blue-600"
                  }`}
                >
                  {item}
                  {activeItem === item && (
                    <span className="inline-block h-[2px] bg-blue-600 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>

            <hr className="my-1" />

            {/* Dropdown items in mobile */}
            <div className="flex flex-col gap-3">
              {userMenu.map((menu) => (
                <a
                  key={menu.label}
                  href="#"
                  className="flex items-center px-3 py-1 gap-3 text-gray-700 hover:text-blue-600 text-sm"
                >
                  <Image
                    src={menu.icon}
                    alt={menu.label}
                    width={18}
                    height={18}
                  />
                  {menu.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Animation */}
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
