"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { neighborhoods } from "@/data/neighborhoods";
import type { LatLngExpression } from "leaflet";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  addNeighborhood,
  removeNeighborhood,
} from "@/store/slices/preferenceSlice";

interface NeighborhoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBorough: "Manhattan" | "Brooklyn" | "";
}

// Dynamic imports for Leaflet
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

export default function NeighborhoodModal({
  isOpen,
  onClose,
  selectedBorough,
}: NeighborhoodModalProps) {
  const dispatch = useDispatch();
  const locations = useSelector(
    (state: RootState) => state.preferences.locations
  );

  // LOCAL UI STATE (track selections per borough so they stay highlighted)
  const [state, setState] = useState({
    activeTab: "Manhattan" as "Manhattan" | "Brooklyn",
    selectedAreasByBorough: {
      Manhattan: [] as string[],
      Brooklyn: [] as string[],
    },
  });

  // -------------------------------------------------------
  // 🔥 PREFILL ONLY WHEN MODAL OPENS (fixes setState warnings)
  // -------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return; // prevent unnecessary effects

    const getSelections = (borough: "Manhattan" | "Brooklyn") =>
      locations.find((loc) => loc.borough === borough)?.neighborhoods ?? [];

    // determine which tab to show
    const newTab = selectedBorough === "Brooklyn" ? "Brooklyn" : "Manhattan";

    // Re-seed local draft selections from Redux when opening the modal.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({
      activeTab: newTab,
      selectedAreasByBorough: {
        Manhattan: getSelections("Manhattan"),
        Brooklyn: getSelections("Brooklyn"),
      },
    });
  }, [isOpen, locations, selectedBorough]); // ONLY trigger when modal becomes visible

  // -------------------------------------------------------
  // EARLY RETURN AFTER HOOKS (no conditional hooks error)
  // -------------------------------------------------------
  if (!isOpen) return null;

  // -------------------------------------------------------
  // Toggle single neighborhood
  // -------------------------------------------------------
  const handleToggleArea = (name: string) => {
    setState((prev) => ({
      ...prev,
      selectedAreasByBorough: {
        ...prev.selectedAreasByBorough,
        [prev.activeTab]: prev.selectedAreasByBorough[prev.activeTab].includes(
          name
        )
          ? prev.selectedAreasByBorough[prev.activeTab].filter(
              (x) => x !== name
            )
          : [...prev.selectedAreasByBorough[prev.activeTab], name],
      },
    }));
  };

  // -------------------------------------------------------
  // Apply button → Sync Redux
  // -------------------------------------------------------
  const handleApply = () => {
    (["Manhattan", "Brooklyn"] as const).forEach((borough) => {
      const desired = state.selectedAreasByBorough[borough];
      const existing =
        locations.find((loc) => loc.borough === borough)?.neighborhoods ?? [];

      // remove deselected
      existing
        .filter((n) => !desired.includes(n))
        .forEach((n) =>
          dispatch(removeNeighborhood({ borough, neighborhood: n }))
        );

      // add new selections
      desired
        .filter((n) => !existing.includes(n))
        .forEach((n) =>
          dispatch(addNeighborhood({ borough, neighborhood: n }))
        );
    });

    onClose();
  };

  // -------------------------------------------------------
  // Clear All (active borough only)
  // -------------------------------------------------------
  const handleClearAll = () => {
    const borough = state.activeTab;

    setState((prev) => ({
      ...prev,
      selectedAreasByBorough: { ...prev.selectedAreasByBorough, [borough]: [] },
    }));
  };

  // -------------------------------------------------------
  // Map Center
  // -------------------------------------------------------
  const center: LatLngExpression =
    state.activeTab === "Manhattan" ? [40.7831, -73.9712] : [40.6782, -73.9442];

  const currentSelections = state.selectedAreasByBorough[state.activeTab];

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden text-sm sm:text-base">
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-base sm:text-xl font-semibold text-gray-900">
              Select Your Neighborhoods
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {currentSelections.length} area
              {currentSelections.length !== 1 ? "s" : ""} selected
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
        <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-2 sm:py-3 border-b border-gray-200 bg-gray-50">
          {(["Manhattan", "Brooklyn"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  activeTab: tab,
                }))
              }
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                state.activeTab === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* MAP */}
          <div className="w-full md:flex-1 h-56 md:h-full border-b md:border-r border-gray-200">
            <MapContainer
              center={center}
              zoom={12}
              scrollWheelZoom
              zoomControl
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {neighborhoods[state.activeTab].map((area) => {
                if (!currentSelections.includes(area.name)) return null;

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
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 sm:px-5 py-3 sm:py-4">
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                Neighborhoods in {state.activeTab}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Click to select or deselect
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 min-h-0">
              {neighborhoods[state.activeTab].map((area) => {
                const isChecked = currentSelections.includes(area.name);

                return (
                  <label
                    key={area.name}
                    className={`flex items-center gap-2 sm:gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm sm:text-base ${
                      isChecked
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleArea(area.name)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-sm text-gray-900">{area.name}</span>
                  </label>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex gap-2 sm:gap-3 p-4 bg-gray-50">
              <button
                onClick={handleClearAll}
                className="flex-1 bg-gray-200 text-gray-800 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
              >
                Clear All
              </button>

              <button
                onClick={handleApply}
                className="flex-1 bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              >
                Apply Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
