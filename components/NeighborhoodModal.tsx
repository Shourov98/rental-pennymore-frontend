"use client";

import { useState } from "react";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { neighborhoods } from "@/data/neighborhoods";
import type { LatLngExpression } from "leaflet";

// Dynamic imports to fix SSR issues with Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Polygon = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polygon),
  { ssr: false }
);

interface NeighborhoodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NeighborhoodModal = ({ isOpen, onClose }: NeighborhoodModalProps) => {
  const [activeTab, setActiveTab] = useState<"Manhattan" | "Brooklyn">(
    "Manhattan"
  );
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleToggleArea = (name: string) => {
    setSelectedAreas((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  const center: LatLngExpression =
    activeTab === "Manhattan" ? [40.7831, -73.9712] : [40.6782, -73.9442];

  const handleApply = () => {
    console.log("Selected neighborhoods:", selectedAreas);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      {/* MODAL CONTENT */}
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Select Your Neighborhoods
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedAreas.length} area
              {selectedAreas.length !== 1 ? "s" : ""} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-200 bg-gray-50 shrink-0">
          {(["Manhattan", "Brooklyn"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* MAP */}
          <div className="flex-1 min-h-[300px] md:min-h-0 border-b md:border-r border-gray-200">
            <MapContainer
              center={center}
              zoom={12}
              scrollWheelZoom={true}
              zoomControl={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {/* Render polygons */}
              {neighborhoods[activeTab].map((area) => {
                if (!selectedAreas.includes(area.name)) return null;

                if (area.geometryType === "MultiPolygon") {
                  return (area.coords as LatLngExpression[][]).map(
                    (poly, idx) => (
                      <Polygon
                        key={`${area.name}-${idx}`}
                        positions={poly}
                        pathOptions={{
                          color: "#2563eb",
                          fillColor: "#3b82f6",
                          fillOpacity: 0.4,
                          weight: 2,
                        }}
                      />
                    )
                  );
                }

                return (
                  <Polygon
                    key={area.name}
                    positions={area.coords as LatLngExpression[]}
                    pathOptions={{
                      color: "#2563eb",
                      fillColor: "#3b82f6",
                      fillOpacity: 0.4,
                      weight: 2,
                    }}
                  />
                );
              })}
            </MapContainer>
          </div>

          {/* LIST */}
          <div className="flex-1 flex flex-col min-h-[300px] md:min-h-0">
            <div className="p-4 border-b border-gray-200 shrink-0">
              <h3 className="font-medium text-gray-900">
                Neighborhoods in {activeTab}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Click to select or deselect areas
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {neighborhoods[activeTab].map((area) => (
                  <label
                    key={area.name}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedAreas.includes(area.name)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAreas.includes(area.name)}
                      onChange={() => handleToggleArea(area.name)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {area.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50 shrink-0">
              <button
                onClick={() => setSelectedAreas([])}
                className="flex-1 bg-gray-200 text-gray-800 font-medium py-3 rounded-lg hover:bg-gray-300"
              >
                Clear All
              </button>
              <button
                onClick={handleApply}
                className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700"
              >
                Apply Selection
              </button>
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
