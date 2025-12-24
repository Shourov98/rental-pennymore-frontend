"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronDown, User } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { selectAuth, logout, selectIsAuthed } from "@/store/slices/authSlice";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pos-exterior-researchers-vegetarian.trycloudflare.com/api/v1";

export default function Navbar() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const isAuthed = useSelector(selectIsAuthed);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const firstName =
    auth.user?.fullName?.split(" ")[0] ||
    auth.user?.fullName ||
    "Guest";

  const role = auth.role || auth.user?.role || "Guest";
  const menuBasePath =
    role === "Agent" ? "/agent" : role === "Renter" ? "/renter" : "";

  const navItems = [
    { name: "Home", id: "#" },
    { name: "About", id: "#about" },
    { name: "Monthly Report", id: "#monthly-report" },
    { name: "Contact Us", id: "#contact" },
  ];

  const userMenu = menuBasePath
    ? [
        {
          label: "Dashboard",
          icon: "/icons/dashboard-square-01.svg",
          path: `${menuBasePath}/dashboard`,
        },
        {
          label: "Notifications",
          icon: "/icons/notification-01.svg",
          path: `${menuBasePath}/notifications`,
        },
        {
          label: "Settings",
          icon: "/icons/settings-01.svg",
          path: `${menuBasePath}/settings`,
        },
        {
          label: "Profile",
          icon: "/icons/user.svg",
          path: `${menuBasePath}/profile`,
        },
        { label: "Logout", icon: "/icons/logout-01.svg", path: "/" },
      ]
    : [];

  const handleMenuItemClick = (path: string) => {
    router.push(path);
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (auth.accessToken) headers.Authorization = `Bearer ${auth.accessToken}`;

      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers,
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      dispatch(logout());
      router.replace("/signin");
    }
  };

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Auto-close desktop dropdown
  const handleMouseLeave = () => setTimeout(() => setDropdownOpen(false), 150);

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-full md:max-w-11/12 lg:max-w-10/12 mx-auto px-2 md:px-8 flex justify-between items-center py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl items-start justify-start font-bold text-black pr-3"
        >
          <Image
            src="/Logo_1.svg"
            alt="Logo"
            width={200}
            height={150}
            className="w-[120px] md:w-[160px] lg:w-[200px] h-auto"
          />
        </Link>

        {/* Desktop Navbar Links (only show on lg+) */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-800">
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

        {/* Desktop User Dropdown (lg+) */}
        <div
          className="hidden lg:flex items-center relative"
          ref={dropdownRef}
          onMouseLeave={handleMouseLeave}
        >
          {isAuthed ? (
            <>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition"
              >
                <User className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    Hey, {firstName}
                  </p>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>
                <ChevronDown size={18} className="text-gray-600" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white shadow-lg rounded-lg animate-fadeIn">
                  {userMenu.map((menu) => {
                    const isLogout = menu.label === "Logout";
                    return (
                      <button
                        key={menu.label}
                        onClick={() =>
                          isLogout
                            ? handleLogout()
                            : handleMenuItemClick(menu.path)
                        }
                        className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-blue-100 text-gray-800 text-sm"
                      >
                        <Image
                          src={menu.icon}
                          alt={menu.label}
                          width={18}
                          height={18}
                        />
                        {menu.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/signin")}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push("/signup")}
                className="px-4 py-2 rounded-md border border-blue-600 text-blue-600 text-sm hover:bg-blue-50"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile + Tablet Menu Trigger (shown until lg) */}
        <button
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X size={22} />
          ) : (
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">
                  Hey, {firstName}
                </p>
                <p className="text-xs text-gray-500">{role}</p>
              </div>
              <ChevronDown size={18} className="text-gray-600" />
            </div>
          )}
        </button>
      </div>

      {/* Mobile/Tablet Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/30 z-40">
          <div
            ref={drawerRef}
            className="absolute right-0 top-0 w-72 h-full bg-white shadow-xl flex flex-col p-6 gap-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">Menu</span>
              <X
                size={22}
                className="cursor-pointer"
                onClick={() => setMenuOpen(false)}
              />
            </div>

            {/* Drawer Content */}
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveItem(item.name);
                    setMenuOpen(false);
                    document
                      .querySelector(item.id)
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`text-left text-gray-700 py-2 ${
                    activeItem === item.name
                      ? "text-blue-600 font-semibold"
                      : ""
                  }`}
                >
                  {item.name}
                </button>
              ))}

              <hr />

              {isAuthed ? (
                userMenu.map((menu) => (
                  <button
                    key={menu.label}
                    onClick={() =>
                      menu.label === "Logout"
                        ? handleLogout()
                        : handleMenuItemClick(menu.path)
                    }
                    className="w-full text-left flex items-center gap-3 px-2 py-2 hover:bg-blue-50 text-gray-800 text-sm"
                  >
                    <Image
                      src={menu.icon}
                      alt={menu.label}
                      width={18}
                      height={18}
                    />
                    {menu.label}
                  </button>
                ))
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push("/signin")}
                    className="w-full px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push("/signup")}
                    className="w-full px-4 py-2 rounded-md border border-blue-600 text-blue-600 text-sm hover:bg-blue-50"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
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
