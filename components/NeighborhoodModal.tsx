"use client";

import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import boroughNeighborhoods from "@/data/neighborhoods.manhattan-brooklyn";
import { neighborhoods } from "@/data/neighborhoods";
import type { LatLngExpression, PathOptions } from "leaflet";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  addNeighborhood,
  removeNeighborhood,
} from "@/store/slices/preferenceSlice";

type Borough = "Manhattan" | "Brooklyn";
type SelectionMode = "multiple" | "single";
type SelectedAreasByBorough = Record<Borough, string[]>;

export interface NeighborhoodSelection {
  borough: Borough;
  key: string;
  label: string;
}

interface NeighborhoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBorough: Borough | "";
  selectionMode?: SelectionMode;
  selectedAreasByBorough?: Partial<SelectedAreasByBorough>;
  onApplySelection?: (selection: NeighborhoodSelection | null) => void;
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

const selectedPolygonStyle: PathOptions = {
  color: "#2563eb",
  fillColor: "#3b82f6",
  fillOpacity: 0.42,
  opacity: 0.95,
  weight: 3,
};

const unselectedPolygonStyle: PathOptions = {
  color: "#7c9fca",
  fillColor: "#dbeafe",
  fillOpacity: 0.16,
  opacity: 0.65,
  weight: 1,
};

const getPolygonStyle = (isSelected: boolean): PathOptions => ({
  ...(isSelected ? selectedPolygonStyle : unselectedPolygonStyle),
});

export default function NeighborhoodModal({
  isOpen,
  onClose,
  selectedBorough,
  selectionMode = "multiple",
  selectedAreasByBorough,
  onApplySelection,
}: NeighborhoodModalProps) {
  const isSingleSelection = selectionMode === "single";
  const dispatch = useDispatch();
  const locations = useSelector(
    (state: RootState) => state.preferences.locations
  );

  // LOCAL UI STATE (track selections per borough so they stay highlighted)
  const [state, setState] = useState({
    activeTab: "Manhattan" as Borough,
    selectedAreasByBorough: {
      Manhattan: [] as string[],
      Brooklyn: [] as string[],
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isOpen]);

  // -------------------------------------------------------
  // 🔥 PREFILL ONLY WHEN MODAL OPENS (fixes setState warnings)
  // -------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return; // prevent unnecessary effects

    const getSelections = (borough: Borough) =>
      selectedAreasByBorough?.[borough] ??
      locations.find((loc) => loc.borough === borough)?.neighborhoods ??
      [];

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
  }, [isOpen, locations, selectedAreasByBorough, selectedBorough]); // ONLY trigger when modal becomes visible

  const currentSelections = state.selectedAreasByBorough[state.activeTab];
  const totalSelectionCount =
    state.selectedAreasByBorough.Manhattan.length +
    state.selectedAreasByBorough.Brooklyn.length;
  const activeBoroughData = boroughNeighborhoods[state.activeTab];

  const geometryByLabel = useMemo(() => {
    const map = new globalThis.Map<
      string,
      (typeof neighborhoods)["Manhattan"][number]
    >();
    neighborhoods[state.activeTab].forEach((area) => {
      map.set(area.name, area);
    });
    return map;
  }, [state.activeTab]);

  const activeMapAreas = useMemo(() => {
    const areasByKey = new globalThis.Map<
      string,
      {
        key: string;
        label: string;
        area: (typeof neighborhoods)["Manhattan"][number];
      }
    >();

    activeBoroughData.sections.forEach((section) => {
      section.items.forEach((item) => {
        const area =
          geometryByLabel.get(item.label) ?? geometryByLabel.get(item.key);

        if (!area || areasByKey.has(item.key)) return;

        areasByKey.set(item.key, {
          key: item.key,
          label: item.label,
          area,
        });
      });
    });

    return Array.from(areasByKey.values());
  }, [activeBoroughData.sections, geometryByLabel]);

  // -------------------------------------------------------
  // EARLY RETURN AFTER HOOKS (no conditional hooks error)
  // -------------------------------------------------------
  if (!isOpen) return null;

  // -------------------------------------------------------
  const findItemByKey = (borough: Borough, key: string) => {
    for (const section of boroughNeighborhoods[borough].sections) {
      const item = section.items.find((sectionItem) => sectionItem.key === key);
      if (item) return item;
    }

    return null;
  };

  const firstSelectedNeighborhood = (): NeighborhoodSelection | null => {
    for (const borough of ["Manhattan", "Brooklyn"] as const) {
      const key = state.selectedAreasByBorough[borough][0];
      if (!key) continue;

      const item = findItemByKey(borough, key);

      return {
        borough,
        key,
        label: item?.label ?? key,
      };
    }

    return null;
  };

  // Toggle neighborhood
  // -------------------------------------------------------
  const handleToggleArea = (key: string) => {
    setState((prev) => ({
      ...prev,
      selectedAreasByBorough: isSingleSelection
        ? {
            Manhattan: [],
            Brooklyn: [],
            [prev.activeTab]: prev.selectedAreasByBorough[
              prev.activeTab
            ].includes(key)
              ? []
              : [key],
          }
        : {
            ...prev.selectedAreasByBorough,
            [prev.activeTab]: prev.selectedAreasByBorough[
              prev.activeTab
            ].includes(key)
              ? prev.selectedAreasByBorough[prev.activeTab].filter(
                  (x) => x !== key
                )
              : [...prev.selectedAreasByBorough[prev.activeTab], key],
          },
    }));
  };

  // -------------------------------------------------------
  // Apply button → Sync Redux
  // -------------------------------------------------------
  const handleApply = () => {
    if (onApplySelection) {
      onApplySelection(firstSelectedNeighborhood());
      onClose();
      return;
    }

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
      selectedAreasByBorough: isSingleSelection
        ? { Manhattan: [], Brooklyn: [] }
        : { ...prev.selectedAreasByBorough, [borough]: [] },
    }));
  };

  const handleToggleSection = (
    items: { key: string; label: string }[],
    shouldSelect: boolean
  ) => {
    if (isSingleSelection) return;

    setState((prev) => {
      const current = new globalThis.Set(
        prev.selectedAreasByBorough[prev.activeTab]
      );
      items.forEach((item) => {
        if (shouldSelect) {
          current.add(item.key);
        } else {
          current.delete(item.key);
        }
      });
      return {
        ...prev,
        selectedAreasByBorough: {
          ...prev.selectedAreasByBorough,
          [prev.activeTab]: Array.from(current),
        },
      };
    });
  };

  // -------------------------------------------------------
  // Map Center
  // -------------------------------------------------------
  const center: LatLngExpression =
    state.activeTab === "Manhattan" ? [40.7831, -73.9712] : [40.6782, -73.9442];

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-3 sm:p-4 overscroll-contain">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden text-sm sm:text-base">
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-base sm:text-xl font-semibold text-gray-900">
              Select Your Neighborhoods
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {isSingleSelection
                ? `${totalSelectionCount} area${
                    totalSelectionCount !== 1 ? "s" : ""
                  } selected`
                : `${currentSelections.length} area${
                    currentSelections.length !== 1 ? "s" : ""
                  } selected`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-gray-800 transition p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-1 sm:py-2 border-b border-gray-200 bg-gray-50">
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

              {activeMapAreas.map(({ key, area }) => {
                const isSelected = currentSelections.includes(key);
                const selectionState = isSelected ? "selected" : "default";
                const pathOptions = getPolygonStyle(isSelected);
                const eventHandlers = {
                  click: () => handleToggleArea(key),
                };

                if (area.geometryType === "MultiPolygon") {
                  return (area.coords as LatLngExpression[][]).map(
                    (poly, idx) => (
                      <Polygon
                        key={`${state.activeTab}-${key}-${selectionState}-${area.name}-${idx}`}
                        positions={poly}
                        pathOptions={pathOptions}
                        eventHandlers={eventHandlers}
                      />
                    )
                  );
                }

                return (
                  <Polygon
                    key={`${state.activeTab}-${key}-${selectionState}-${area.name}`}
                    positions={area.coords as LatLngExpression[]}
                    pathOptions={pathOptions}
                    eventHandlers={eventHandlers}
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

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2 min-h-0">
              {activeBoroughData.sections.map((section) => (
                <div key={section.title} className="sm:col-span-2">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {!isSingleSelection ? (
                      <input
                        type="checkbox"
                        checked={section.items.every((item) =>
                          currentSelections.includes(item.key)
                        )}
                        onChange={(event) =>
                          handleToggleSection(
                            section.items,
                            event.target.checked
                          )
                        }
                        className="w-4 h-4 shrink-0 accent-blue-600"
                        aria-label={`Select ${section.title}`}
                      />
                    ) : null}
                    <p className="text-xs sm:text-sm font-semibold text-gray-700 text-center">
                      {section.title}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {section.items.map((item) => {
                      const isChecked = currentSelections.includes(item.key);

                      return (
                        <label
                          key={item.key}
                          className={`flex items-center gap-2 sm:gap-1 px-3 py-1 rounded-lg cursor-pointer transition-all text-sm sm:text-base ${
                            isChecked
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type={isSingleSelection ? "radio" : "checkbox"}
                            name={
                              isSingleSelection
                                ? "match-search-neighborhood"
                                : undefined
                            }
                            checked={isChecked}
                            onChange={() => handleToggleArea(item.key)}
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span className="text-sm text-gray-900">
                            {item.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
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
