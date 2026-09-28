"use client";

import React, { useEffect, useRef, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const SPEED_PX_PER_SECOND = 80;

export default function AdvertiseBar() {
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [duration, setDuration] = useState(30);

  const marqueeRef = useRef<HTMLDivElement>(null);

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
      } catch {
        if (controller.signal.aborted) return;
      }
    };

    fetchNotice();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!marqueeRef.current) return;

    const width = marqueeRef.current.scrollWidth;
    const calculatedDuration = width / SPEED_PX_PER_SECOND;

    setDuration(Math.max(calculatedDuration, 60));
  }, [content]);

  if (!isActive || !content) return null;

  return (
    <div className="advertise-bar w-full bg-gray-100 overflow-hidden">
      <div
        ref={marqueeRef}
        className="marquee-track"
        style={{ animationDuration: `${duration}s` }}
      >
        <span>{content}</span>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
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
          animation-name: marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }
        .advertise-bar:hover .marquee-track {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
