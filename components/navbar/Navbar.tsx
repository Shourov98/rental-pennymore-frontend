"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronDown, User, ClipboardList, Menu } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { selectAuth, logout, selectIsAuthed } from "@/store/slices/authSlice";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Navbar() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const isAuthed = useSelector(selectIsAuthed);
  const [isClient, setIsClient] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const getFirstName = (fullName?: string | null, email?: string | null) => {
    const safeFullName = fullName?.trim();
    if (safeFullName && !safeFullName.includes("@")) {
      return safeFullName.split(" ")[0];
    }
    const emailPrefix = email?.split("@")[0] || "";
    const cleanedEmail = emailPrefix.replace(/[._-]+/g, " ").trim();
    return cleanedEmail.split(" ")[0];
  };

  const canShowAuthed = isClient && isAuthed;
  const displayName = canShowAuthed
    ? getFirstName(auth.user?.fullName, auth.user?.email)
    : "";
  const hasDisplayName = Boolean(displayName);
  const avatarUrl = canShowAuthed
    ? auth.user?.profileImage ?? auth.user?.profileImageUrl ?? null
    : null;

  const role = canShowAuthed ? auth.role || auth.user?.role : "";
  const menuBasePath =
    role === "Agent" ? "/agent" : role === "Renter" ? "/renter" : "";

  const navItems = [
    { name: "Home", id: "#" },
    { name: "About", id: "#about" },
    { name: "Monthly Report", id: "#monthly-report" },
    { name: "Contact Us", id: "#contact" },
  ];

  const userMenu: { label: string; icon: ReactNode; path: string }[] =
    menuBasePath
      ? [
          {
            label: "Dashboard",
            icon: (
              <Image
                src="/icons/dashboard-square-01.svg"
                alt="Dashboard"
                width={18}
                height={18}
              />
            ),
            path: `${menuBasePath}/dashboard`,
          },
          {
            label: "Notifications",
            icon: (
              <Image
                src="/icons/notification-01.svg"
                alt="Notifications"
                width={18}
                height={18}
              />
            ),
            path: `${menuBasePath}/notifications`,
          },
          ...(role === "Renter"
            ? [
                {
                  label: "Requests",
                  icon: <ClipboardList size={18} />,
                  path: "/renter/saved-requests",
                },
              ]
            : []),
          {
            label: "Settings",
            icon: (
              <Image
                src="/icons/settings-01.svg"
                alt="Settings"
                width={18}
                height={18}
              />
            ),
            path: `${menuBasePath}/settings`,
          },
          {
            label: "Profile",
            icon: (
              <Image
                src="/icons/user.svg"
                alt="Profile"
                width={18}
                height={18}
              />
            ),
            path: `${menuBasePath}/profile`,
          },
          {
            label: "Logout",
            icon: (
              <Image
                src="/icons/logout-01.svg"
                alt="Logout"
                width={18}
                height={18}
              />
            ),
            path: "/",
          },
        ]
      : [];

  const handleMenuItemClick = (path: string) => {
    router.push(path);
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const scrollToSection = (hash: string) => {
    if (hash === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const target = document.querySelector(hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavClick = (hash: string, name: string) => {
    setActiveItem(name);
    setMenuOpen(false);
    setDropdownOpen(false);

    if (pathname !== "/") {
      router.push(`/${hash}`);
      return;
    }

    scrollToSection(hash);
    if (hash !== "#") {
      window.history.pushState(null, "", hash);
    }
  };

  const handleLogout = async () => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (auth.accessToken)
        headers.Authorization = `Bearer ${auth.accessToken}`;

      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers,
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      dispatch(logout());
      router.replace("/");
    }
  };

  // Close drawer when clicking outside
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  useEffect(() => {
    if (pathname !== "/") return;
    const handleHashChange = () => {
      const hash = window.location.hash || "#";
      scrollToSection(hash);
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [dropdownOpen]);

  return (
    <nav className="w-full flex flex-row bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-full md:max-w-11/12 lg:max-w-10/12 mx-auto px-2 md:px-8 py-4 flex w-full items-stretch justify-between gap-4">
        {/* Logo */}
        <div className="flex flex-col items-start justify-between gap-3">
          {/* Left side */}
          <div className="flex flex-col items-start text-gray-600">
            <a
              className="text-cyan-500 hover:underline"
              href="https://www.corcoran.com"
              target="blank"
            >
              <Image
                src="/Corcoran_Logo.png"
                alt="Corcoran"
                width={170}
                height={30}
                priority
              />
            </a>
            <span className="hidden text-[11px] leading-snug lg:inline">
              Website operated by – <br />
              <span>TUVAL MOR AT THE CORCORAN GROUP</span>
            </span>
          </div>
          <Link
            href="/"
            className="text-2xl items-start justify-start font-bold text-black"
          >
            <Image
              src="/Logo_1.svg"
              alt="Logo"
              width={200}
              height={150}
              className="w-[120px] md:w-[160px] lg:w-[200px] h-auto"
            />
          </Link>
        </div>


        {/* Desktop Navbar Links (only show on lg+) */}
        <div className="hidden lg:flex flex-col items-center justify-between gap-8 text-sm font-medium text-gray-800">
          {/* Middle side */}
          <div className="flex items-center gap-2 text-gray-700">
            <a
              className="flex items-center hover:underline"
              href="https://www.dos.ny.gov/press/2020/docs/FairHousingNotice_new.pdf"
              target="blank"
            >
              <Image
                src="/equal-housing-logo-black.svg"
                alt="Fair Housing"
                width={48}
                height={48}
                className="w-10 h-10 lg:w-12 lg:h-12"
              />
              <span className="hidden font-xs lg:font-md pt-1 pl-2 italic font-semibold lg:inline">
                We are committed to upholding the <br />
                principles of all applicable fair housing laws.
              </span>
            </a>
          </div>
          <div className="flex items-center justify-center gap-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.id}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id, item.name);
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
        </div>

        {/* Desktop User Dropdown (lg+) */}
        <div className="hidden lg:flex flex-col items-end justify-end">
          <div className="relative" ref={dropdownRef}>
            {canShowAuthed && hasDisplayName ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition"
                >
                  {avatarUrl ? (
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-gray-300">
                      <Image
                        src={avatarUrl}
                        alt="User avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="min-w-[28px] h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <User size={16} />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">
                      Hey, {displayName}
                    </p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                  <ChevronDown size={18} className="text-gray-600" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-lg rounded-lg animate-fadeIn">
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
                          {menu.icon}
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
        </div>

        {/* Mobile + Tablet Menu Trigger (shown until lg) */}
        <div className="lg:hidden flex items-end gap-3">
          {!canShowAuthed && (
            <div className="flex flex-col items-start gap-2">
              <a
                className="flex items-start"
                href="https://www.dos.ny.gov/press/2020/docs/FairHousingNotice_new.pdf"
                target="blank"
              >
                <Image
                  src="/equal-housing-logo-black.svg"
                  alt="Fair Housing"
                  width={40}
                  height={40}
                  className="w-9 h-9"
                />
              </a>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/signin")}
                  className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs hover:bg-blue-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="px-3 py-1.5 rounded-md border border-blue-600 text-blue-600 text-xs hover:bg-blue-50"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
          <button
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X size={22} />
            ) : canShowAuthed && hasDisplayName ? (
              <div className="flex flex-col items-end gap-2">
                <Image
                  src="/equal-housing-logo-black.svg"
                  alt="Fair Housing"
                  width={40}
                  height={40}
                  className="w-9 h-9"
                />
                <div className="flex items-center gap-2">
                  {avatarUrl ? (
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-gray-300">
                      <Image
                        src={avatarUrl}
                        alt="User avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="min-w-[28px] h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <User size={16} />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">
                      Hey, {displayName}
                    </p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                  <ChevronDown size={18} className="text-gray-600" />
                </div>
              </div>
            ) : (
              <Menu size={22} />
            )}
          </button>
        </div>
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
                    handleNavClick(item.id, item.name);
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

              {canShowAuthed ? (
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
                    {menu.icon}
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
