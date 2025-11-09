"use client";
import { useState } from "react";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const user = {
    name: "John",
    role: "Renter",
  };

  const navItems = ["Home", "About", "Monthly Report", "Contact Us"];

  const userMenu = [
    { label: "Dashboard", icon: "/icons/dashboard.svg" },
    { label: "Profile", icon: "/icons/profile.svg" },
    { label: "Pre-Market Requests", icon: "/icons/request.svg" },
    { label: "Notification", icon: "/icons/bell.svg" },
    { label: "Settings", icon: "/icons/settings.svg" },
    { label: "Logout", icon: "/icons/logout.svg" },
  ];

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center py-4">
        {/* Logo */}
        <div className="text-2xl font-bold text-black">Logo</div>

        {/* Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-800">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="hover:text-blue-600 transition"
            >
              {item}
            </a>
          ))}
        </div>

        {/* User Section */}
        <div className="hidden md:flex items-center gap-4 relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition"
          >
            <span className="font-medium text-sm">
              Hey, {user.name} ({user.role})
            </span>
            <ChevronDown size={18} />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-12 w-56 bg-white shadow-lg rounded-lg border">
              {userMenu.map((menu) => (
                <a
                  key={menu.label}
                  href="#"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-800 text-sm"
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

        {/* Buttons for Non-Auth */}
        {!user && (
          <div className="hidden md:flex gap-3">
            <button className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200">
              Sign Up
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Login
            </button>
          </div>
        )}

        {/* Mobile Menu Icon */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-40 z-40">
          <div className="absolute left-0 top-0 w-64 h-full bg-white shadow-xl flex flex-col p-6 gap-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">Logo</span>
              <X
                size={22}
                className="cursor-pointer"
                onClick={() => setMenuOpen(false)}
              />
            </div>

            <div className="border-b pb-4">
              <p className="font-medium mb-2">
                Hey, {user.name} ({user.role})
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="hover:text-blue-600 transition"
                >
                  {item}
                </a>
              ))}
            </div>

            <hr className="my-4" />

            <div className="flex flex-col gap-3">
              {userMenu.map((menu) => (
                <a
                  key={menu.label}
                  href="#"
                  className="flex items-center gap-3 hover:text-blue-600 text-sm"
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
    </nav>
  );
}
