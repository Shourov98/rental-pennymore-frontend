"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SITE_NAME = "BeforeListed";

const STATIC_TITLES: Record<string, string> = {
  "/": "Home",
  "/matches": "Matches",
  "/saved-searches": "Saved Searches",
  "/Request-Submlsslon-Page": "Pre-Market Listing",
  "/terms-conditions": "Terms & Conditions",
  "/signin": "Sign In",
  "/signup": "Sign Up",
  "/signup/renter": "Renter Sign Up",
  "/signup/agent": "Agent Sign Up",
  "/forget-password": "Forgot Password",
  "/reset-password": "Reset Password",
  "/set-new-password": "Set New Password",
  "/otp-verify": "OTP Verify",
  "/forgot-otp": "Forgot OTP",
  "/email-verified": "Email Verified",
  "/pass-changed": "Password Changed",
  "/mor-signup": "MOR Signup",
  "/mor-confirmation": "MOR Confirmation",
  "/successful-verify": "Verification Success",
  "/mor-team-form": "MOR Team Form",
  "/renter/dashboard": "Dashboard",
  "/renter/matches": "Request Matches",
  "/renter/saved-requests": "Requests List",
  "/renter/profile": "Profile",
  "/renter/profile/edit": "Edit Profile",
  "/renter/settings": "Settings",
  "/renter/notifications": "Notifications",
  "/agent/dashboard": "Dashboard",
  "/agent/matches": "Matches",
  "/agent/profile": "Profile",
  "/agent/profile/edit": "Edit Profile",
  "/agent/settings": "Settings",
  "/agent/notifications": "Notifications",
  "/agent/refer-link": "Refer Link",
};

const DYNAMIC_TITLES: Array<{ pattern: RegExp; title: string }> = [
  { pattern: /^\/agent\/dashboard\/[^/]+$/, title: "Request Details" },
  { pattern: /^\/agent\/matches\/[^/]+$/, title: "Match Details" },
  { pattern: /^\/renter\/matches\/[^/]+$/, title: "Match Details" },
  {
    pattern: /^\/renter\/saved-requests\/[^/]+$/,
    title: "Saved Request Details",
  },
];

const toTitleCase = (value: string) =>
  value.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const getTitleFromPath = (pathname: string) => {
  const staticTitle = STATIC_TITLES[pathname];
  if (staticTitle) return staticTitle;

  const dynamicTitle = DYNAMIC_TITLES.find(({ pattern }) =>
    pattern.test(pathname)
  );
  if (dynamicTitle) return dynamicTitle.title;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Home";
  return segments.map(toTitleCase).join(" - ");
};

export default function TitleManager() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    const title = getTitleFromPath(pathname);
    document.title = `${title} | ${SITE_NAME}`;
  }, [pathname]);

  return null;
}
