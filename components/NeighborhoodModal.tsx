"use client";

import { useState } from "react";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Lazy load to fix SSR issues in Next.js
const NeighborhoodModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<"Manhattan" | "Brooklyn">(
    "Manhattan"
  );
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  if (!isOpen) return null;

  const areas = {
    Manhattan: [
      {
        name: "Battery Park City",
        coords: [
          [40.7106, -74.0176],
          [40.713, -74.015],
          [40.711, -74.012],
        ],
      },
      {
        name: "Chelsea",
        coords: [
          [40.746, -74.004],
          [40.748, -74.002],
          [40.744, -73.998],
        ],
      },
      {
        name: "West Chelsea",
        coords: [
          [40.747, -74.007],
          [40.749, -74.004],
          [40.745, -74.002],
        ],
      },
      {
        name: "Chinatown",
        coords: [
          [40.714, -73.998],
          [40.716, -73.995],
          [40.713, -73.992],
        ],
      },
      {
        name: "Civic Center",
        coords: [
          [40.713, -74.004],
          [40.715, -74.001],
          [40.712, -73.998],
        ],
      },
      {
        name: "East Village",
        coords: [
          [40.727, -73.985],
          [40.729, -73.982],
          [40.725, -73.98],
        ],
      },
    ],
    Brooklyn: [
      {
        name: "Williamsburg",
        coords: [
          [40.712, -73.957],
          [40.714, -73.954],
          [40.71, -73.951],
        ],
      },
      {
        name: "Bushwick",
        coords: [
          [40.694, -73.933],
          [40.697, -73.93],
          [40.692, -73.928],
        ],
      },
      {
        name: "Brooklyn Heights",
        coords: [
          [40.698, -73.995],
          [40.7, -73.992],
          [40.696, -73.989],
        ],
      },
      {
        name: "Greenpoint",
        coords: [
          [40.729, -73.957],
          [40.731, -73.953],
          [40.727, -73.951],
        ],
      },
      {
        name: "Park Slope",
        coords: [
          [40.67, -73.983],
          [40.672, -73.98],
          [40.668, -73.977],
        ],
      },
    ],
  };

  const handleToggleArea = (name: string) => {
    setSelectedAreas((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const center: LatLngExpression =
    activeTab === "Manhattan" ? [40.75, -73.99] : [40.68, -73.97];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <div className="bg-white w-[95%] max-w-6xl h-[85vh] rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 border-b border-gray-200 flex justify-between items-center px-6 py-4 bg-white z-10">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Select Your Neighborhoods
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 transition"
            >
              <X size={20} />
            </button>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-5 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row mt-[60px] h-full">
          {/* Left Map */}
          <div className="flex-1 bg-gray-100 border-r border-gray-200 relative">
            <MapContainer
              center={center}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Highlight selected areas */}
              {areas[activeTab].map(
                (area) =>
                  selectedAreas.includes(area.name) && (
                    <Polygon
                      key={area.name}
                      positions={area.coords as LatLngExpression[]}
                      pathOptions={{
                        color: "#60A5FA", // blue-400
                        fillColor: "#93C5FD", // blue-300
                        fillOpacity: 0.4,
                      }}
                    />
                  )
              )}
            </MapContainer>
          </div>

          {/* Right List */}
          <div className="flex-1 bg-white flex flex-col p-5 overflow-y-auto">
            {/* Tabs */}
            <div className="flex items-center gap-4 mb-4 border-b border-gray-200 pb-2">
              {(["Manhattan", "Brooklyn"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 font-medium ${
                    activeTab === tab
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Area List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4">
              {areas[activeTab].map((area) => (
                <label
                  key={area.name}
                  className="flex items-center gap-2 text-gray-700 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedAreas.includes(area.name)}
                    onChange={() => handleToggleArea(area.name)}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                  {area.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(NeighborhoodModal), {
  ssr: false,
});
