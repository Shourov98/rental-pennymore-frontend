"use client";
import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pos-exterior-researchers-vegetarian.trycloudflare.com/api/v1";

export default function AdvertiseBar() {
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchNotice = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/notice`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data?.success === false) return;
        setIsActive(data?.data?.isActive ?? true);
        if (data?.data?.content) {
          setContent(data.data.content);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
      }
    };

    fetchNotice();

    return () => controller.abort();
  }, []);

  if (!isActive || !content) return null;

  return (
    <div className="w-full bg-gray-100 overflow-hidden">
      <div className="marquee-track">
        <span>{content}</span>
        <span aria-hidden="true">•</span>
        <span>{content}</span>
      </div>

      {/* Infinite scroll animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(150%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .marquee-track {
          display: inline-flex;
          align-items: center;
          gap: 24px;
          padding: 8px 0;
          white-space: nowrap;
          color: rgb(55 65 81);
          font-size: 0.875rem;
          min-width: max-content;
          animation: marquee 40s linear infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
