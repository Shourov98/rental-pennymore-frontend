"use client";
import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pos-exterior-researchers-vegetarian.trycloudflare.com/api/v1";

export default function AdvertiseBar() {
  const [content, setContent] = useState("Advertising text");
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

  const trackItems = useMemo(() => Array.from({ length: 6 }), []);

  if (!isActive || !content) return null;

  const renderTrack = (isAriaHidden?: boolean) => (
    <div
      className="flex w-max items-center gap-6 py-2 text-sm text-gray-700 animate-marquee"
      aria-hidden={isAriaHidden}
    >
      {trackItems.map((_, index) => (
        <React.Fragment key={index}>
          <span>{content}</span>
          <span aria-hidden="true">•</span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="w-full bg-gray-100 overflow-hidden">
      <div className="flex whitespace-nowrap">
        {renderTrack()}
        {renderTrack(true)}
      </div>

      {/* Infinite scroll animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 18s linear infinite;
        }
      `}</style>
    </div>
  );
}
