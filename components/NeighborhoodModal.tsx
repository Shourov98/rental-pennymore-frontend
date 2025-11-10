"use client";

import { useState } from "react";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import MapComponent from "./partials/GoogleMap";

interface NeighborhoodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Lazy-load map only on client to prevent SSR issues
const GoogleMap = dynamic(() => import("./partials/GoogleMap"), { ssr: false });

export default function NeighborhoodModal({
  isOpen,
  onClose,
}: NeighborhoodModalProps) {
  const [activeTab, setActiveTab] = useState<"Manhattan" | "Brooklyn">(
    "Manhattan"
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  if (!isOpen) return null;

  const neighborhoods = {
    Manhattan: [
      "Battery Park City",
      "Chelsea",
      "West Chelsea",
      "Chinatown",
      "Civic Center",
      "East Village",
    ],
    Brooklyn: [
      "Williamsburg",
      "Bushwick",
      "Brooklyn Heights",
      "Greenpoint",
      "Park Slope",
    ],
  };

  const handleToggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleSelectAll = () => {
    const all = neighborhoods[activeTab];
    if (selectAll) {
      setSelected([]);
    } else {
      setSelected(all);
    }
    setSelectAll(!selectAll);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-xl w-[95%] h-[85vh] max-w-5xl flex flex-col md:flex-row overflow-hidden relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 border-b border-gray-200 flex justify-between items-center px-6 py-4 bg-white z-10">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Select Your Neighborhoods
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row mt-[60px] h-full">
          {/* Left - Google Map */}
          <div className="flex-1 bg-gray-100 border-r border-gray-200 relative min-h-[300px]">
            <MapComponent />
          </div>

          {/* Right - Tabs + List */}
          <div className="flex-1 bg-white flex flex-col p-5 overflow-y-auto">
            {/* Tabs */}
            <div className="flex items-center gap-4 mb-4 border-b border-gray-200 pb-2">
              {["Manhattan", "Brooklyn"].map((tab) => (
                <button
                  key={tab}
                  className={`font-medium pb-2 ${
                    activeTab === tab
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => {
                    setActiveTab(tab as "Manhattan" | "Brooklyn");
                    setSelectAll(false);
                    setSelected([]);
                  }}
                >
                  {tab}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 font-medium">
                  Select All
                </span>
              </div>
            </div>

            {/* Checkbox List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4">
              {neighborhoods[activeTab].map((name) => (
                <label
                  key={name}
                  className="flex items-center gap-2 text-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(name)}
                    onChange={() => handleToggle(name)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm">{name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 right-0 left-0 border-t border-gray-200 bg-white px-6 py-3 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-100 text-gray-800 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              console.log("Selected:", selected);
              onClose();
            }}
            className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
