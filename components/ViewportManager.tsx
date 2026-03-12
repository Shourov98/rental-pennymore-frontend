"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const DEFAULT_VIEWPORT = "width=device-width, initial-scale=1";
const RESET_VIEWPORT =
  "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";

export default function ViewportManager() {
  const pathname = usePathname();

  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    const activeElement = document.activeElement;

    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    if (!viewport) return;

    viewport.setAttribute("content", RESET_VIEWPORT);

    const restoreViewport = window.setTimeout(() => {
      viewport.setAttribute("content", DEFAULT_VIEWPORT);
    }, 80);

    return () => {
      window.clearTimeout(restoreViewport);
      viewport.setAttribute("content", DEFAULT_VIEWPORT);
    };
  }, [pathname]);

  return null;
}
