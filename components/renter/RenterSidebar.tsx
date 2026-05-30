"use client";

import { useState } from "react";
import {
  Settings,
  HomeIcon,
  List,
  Bell,
  SearchCheck,
  User,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { clearServerAuthSession } from "@/lib/authSession";
import { logout } from "@/store/slices/authSlice";
import type { AppDispatch, RootState } from "@/store/store";

export default function AgentSidebar({ open }: { open?: boolean }) {
  const pathname = usePathname();
  const [active, setActive] = useState(pathname);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const menuSections = [
    {
      title: "Main",
      items: [
        {
          name: "Homepage",
          icon: <HomeIcon />,
          href: "/",
        },
        {
          name: "Settings",
          icon: <Settings />,
          href: "/renter/settings",
        },
        {
          name: "Notifications",
          icon: <Bell />,
          href: "/renter/notifications",
        },
      ],
    },
    {
      title: "Requests & Opportunities",
      items: [
        {
          name: "Requests",
          icon: <List />,
          href: "/renter/saved-requests",
        },
        {
          name: "Matches",
          icon: <SearchCheck />,
          href: "/renter/matches",
        },
      ],
    },
    {
      title: "Personal Information",
      items: [
        { name: "Profile", icon: <User />, href: "/renter/profile" },
        { name: "Logout", icon: <LogOut />, href: "/" },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await clearServerAuthSession(accessToken);
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("logout_redirect_home", "1");
      }
      dispatch(logout());
      router.replace("/");
    }
  };

  return (
    <aside
      className={`fixed lg:static top-[64px] lg:top-0 left-0 h-[calc(100vh-64px)] lg:h-screen w-64 bg-gray-50 border-r border-gray-200 shrink-0 transform transition-transform duration-200 ease-in-out ${
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } z-30`}
    >
      <div className="flex flex-col p-4 mt-4 overflow-y-auto">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
              {section.title}
            </p>
            <div className="flex flex-col gap-2">
              {section.items.map((item) =>
                item.name === "Logout" ? (
                  <button
                    key={item.name}
                    type="button"
                    onClick={handleLogout}
                    className="flex cursor-pointer items-center gap-3 px-4 py-4 rounded-2xl border bg-white text-gray-800 hover:bg-gray-100 border-gray-200"
                  >
                    <span className="w-5 h-5">{item.icon}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setActive(item.href)}
                    className={`flex items-center gap-3 px-4 py-4 rounded-2xl border ${
                      active === item.href
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-800 hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    <span className="w-5 h-5">{item.icon}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
