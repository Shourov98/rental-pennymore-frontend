"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronDown, User } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ✅ NEW AUTH STATE

  const dropdownRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const user = {
    firstName: "John",
    role: "Renter",
  };

  const navItems = [
    { name: "Home", id: "#" },
    { name: "About", id: "#about" },
    { name: "Monthly Report", id: "#monthly-report" },
    { name: "Contact Us", id: "#contact" },
  ];

  const userMenu = [
    {
      label: "Dashboard",
      icon: "/icons/dashboard-square-01.svg",
      path: "/agent/dashboard",
    },
    { label: "Profile", icon: "/icons/user.svg", path: "/profile" },
    {
      label: "Pre-Market Requests",
      icon: "/icons/file-01.svg",
      path: "/saved-searches",
    },
    {
      label: "Notification",
      icon: "/icons/notification-01.svg",
      path: "/matches",
    },
    { label: "Settings", icon: "/icons/settings-01.svg", path: "/settings" },
    { label: "Logout", icon: "/icons/logout-01.svg", path: "/" },
  ];

  const handleMenuItemClick = (path: string) => {
    if (path === "/logout") {
      setIsAuthenticated(false);
      setDropdownOpen(false);
      setMenuOpen(false);
      router.push("/");
    } else {
      router.push(path);
      setDropdownOpen(false);
      setMenuOpen(false);
    }
  };

  // ✅ Detect outside click to close drawer
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

  // ✅ Close dropdown when mouse leaves
  const handleMouseLeave = () => setTimeout(() => setDropdownOpen(false), 150);

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="md:max-w-11/12 lg:max-w-10/12 mx-auto px-4 md:px-8 flex justify-between items-center py-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-black">
          <Image src="/Logo_1.svg" alt="Logo" width={200} height={150} />
        </Link>

        {/* Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-800">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.id}
              onClick={(e) => {
                e.preventDefault();
                setActiveItem(item.name);
                if (item.id === "#") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  document
                    .querySelector(item.id)
                    ?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className={`relative pb-1 lg:px-2 transition ${
                activeItem === item.name
                  ? "text-blue-600"
                  : "hover:text-blue-600"
              }`}
            >
              {item.name}
              <span
                className={`absolute left-0 bottom-0 h-[3px] rounded-full bg-blue-600 transition-all duration-300 ${
                  activeItem === item.name
                    ? "w-full opacity-100"
                    : "w-0 opacity-0"
                }`}
              ></span>
            </a>
          ))}
        </div>

        {/* 🔹 User Section or Signin/Signup */}
        <div
          className="hidden md:flex items-center relative"
          ref={dropdownRef}
          onMouseLeave={handleMouseLeave}
        >
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition"
              >
                <User className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    Hey, {user.firstName}
                  </p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <ChevronDown size={18} className="text-gray-600" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white shadow-lg rounded-lg border-gray-600 animate-fadeIn">
                  {userMenu.map((menu) => (
                    <button
                      key={menu.label}
                      onClick={() => handleMenuItemClick(menu.path)}
                      className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-blue-100 text-gray-800 text-sm"
                    >
                      <Image
                        src={menu.icon}
                        alt={menu.label}
                        width={18}
                        height={18}
                        className="opacity-80"
                      />
                      {menu.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAuthenticated(true)}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Sign In
              </button>
              <button className="px-4 py-2 rounded-md border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-50">
                Sign Up
              </button>
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

      {/* Mobile Drawer (Original Design Preserved) */}
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

            {/* Conditional User / Auth UI */}
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 mb-2 border-b pb-2">
                  <User className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      Hey, {user.firstName}
                    </p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                </div>

                <div className="flex flex-col">
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.id}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveItem(item.name);
                        setMenuOpen(false);
                        if (item.id === "#") {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        } else {
                          document
                            .querySelector(item.id)
                            ?.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className={`relative text-left gap-4 pb-1 ${
                        activeItem === item.name
                          ? "text-blue-600 font-medium"
                          : "text-gray-800 hover:text-blue-600"
                      }`}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>

                <hr className="my-1" />

                <div className="flex flex-col gap-3">
                  {userMenu.map((menu) => (
                    <button
                      key={menu.label}
                      onClick={() => handleMenuItemClick(menu.path)}
                      className="w-full text-left flex items-center px-3 py-1 gap-3 text-gray-700 hover:text-blue-600 text-sm"
                    >
                      <Image
                        src={menu.icon}
                        alt={menu.label}
                        width={18}
                        height={18}
                      />
                      {menu.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4 mt-4">
                <button
                  onClick={() => {
                    setIsAuthenticated(true);
                    setMenuOpen(false);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Sign In
                </button>
                <button className="w-full border border-blue-600 text-blue-600 py-2 rounded-md text-sm font-medium hover:bg-blue-50">
                  Sign Up
                </button>
              </div>
            )}
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
