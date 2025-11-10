"use client";
import React from "react";

export default function AdvertiseBar() {
  return (
    <div className="w-full bg-gray-100 overflow-hidden">
      <div className="flex whitespace-nowrap animate-scroll gap-8 py-2 text-sm text-gray-700">
        <span>Advertising text</span>
        <span>•</span>
        <span>Advertising text</span>
        <span>•</span>
        <span>Advertising text</span>
        <span>•</span>
        <span>Advertising text</span>
      </div>

      {/* Infinite scroll animation */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-scroll {
          display: inline-flex;
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
