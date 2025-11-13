"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Search, Map } from "lucide-react";
import dynamic from "next/dynamic";

// Lazy import NeighborhoodModal (prevents SSR issues)
const NeighborhoodModal = dynamic(() => import("./NeighborhoodModal"), {
  ssr: false,
});

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const [search, setSearch] = useState("");
  const [isNeighborhoodOpen, setIsNeighborhoodOpen] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsNeighborhoodOpen(false);
    onClose();
  }, [onClose]);

  // ✅ Close Location Modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* --- Location Modal --- */}
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
        <div
          ref={modalRef}
          className="bg-white w-[90%] sm:w-[400px] md:w-[460px] rounded-2xl shadow-lg p-6 relative animate-fadeIn"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-800 transition"
          >
            <X size={20} />
          </button>

          {/* Title */}
          <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>

          {/* Input */}
          <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5 mb-6">
            <Search size={16} className="text-blue-500 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Choose neighborhoods or boroughs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-gray-800"
            />
          </div>

          {/* See all neighborhoods */}
          <button
            onClick={() => setIsNeighborhoodOpen(true)}
            className="flex items-center gap-2 text-blue-600 font-medium text-sm mb-6 hover:underline mx-auto"
          >
            <Map size={18} className="text-blue-600" />
            See all neighborhoods
          </button>

          {/* Actions */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setSearch("")}
              className="w-[45%] bg-gray-100 text-gray-800 font-medium py-2.5 rounded-lg hover:bg-gray-200 transition"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="w-[45%] bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition"
            >
              Done
            </button>
          </div>
        </div>

        {/* Fade-in animation */}
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out forwards;
          }
        `}</style>
      </div>

      {/* ✅ Render NeighborhoodModal only when explicitly triggered */}
      <NeighborhoodModal
        isOpen={isNeighborhoodOpen}
        onClose={() => setIsNeighborhoodOpen(false)}
      />
    </>
  );
}
