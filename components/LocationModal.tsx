"use client";

import { useState, useMemo } from "react";
import { X, Search, Map as MapIcon } from "lucide-react";
import dynamic from "next/dynamic";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  addNeighborhood,
  removeNeighborhood,
} from "@/store/slices/preferenceSlice";

import boroughNeighborhoods from "@/data/neighborhoods.manhattan-brooklyn";

const NeighborhoodModal = dynamic(() => import("./NeighborhoodModal"), {
  ssr: false,
});

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const dispatch = useDispatch();

  const { locations } = useSelector((state: RootState) => state.preferences);

  const [search, setSearch] = useState("");
  const [isNeighborhoodOpen, setIsNeighborhoodOpen] = useState(false);
  const [selectedBorough, setSelectedBorough] = useState<
    "" | "Manhattan" | "Brooklyn"
  >("");

  // SEARCH LOGIC
  const allNeighborhoods = useMemo(
    () =>
      Object.entries(boroughNeighborhoods).flatMap(([borough, data]) =>
        data.sections.flatMap((section) =>
          section.items.map((item) => ({
            borough,
            section: section.title,
            key: item.key,
            label: item.label,
          }))
        )
      ),
    []
  );

  const neighborhoodLabelByKey = useMemo(() => {
    const map = new globalThis.Map<string, string>();
    allNeighborhoods.forEach((item) => {
      map.set(`${item.borough}:${item.key}`, item.label);
    });
    return map;
  }, [allNeighborhoods]);

  const selectedNeighborhoods = useMemo(
    () =>
      locations.flatMap((loc) =>
        (loc.neighborhoods || []).map((key) => ({
          borough: loc.borough,
          key,
          label: neighborhoodLabelByKey.get(`${loc.borough}:${key}`) ?? key,
        }))
      ),
    [locations, neighborhoodLabelByKey]
  );

  const filteredBoroughs = useMemo(() => {
    if (!search.trim()) return boroughNeighborhoods;

    const query = search.toLowerCase();
    const result: typeof boroughNeighborhoods = {
      Manhattan: { ...boroughNeighborhoods.Manhattan, sections: [] },
      Brooklyn: { ...boroughNeighborhoods.Brooklyn, sections: [] },
    };

    (Object.keys(boroughNeighborhoods) as Array<"Manhattan" | "Brooklyn">).forEach(
      (borough) => {
        const boroughData = boroughNeighborhoods[borough];
        const filteredSections = boroughData.sections
          .map((section) => {
            const matchesSection = section.title
              .toLowerCase()
              .includes(query);
            const matchesBorough = borough.toLowerCase().includes(query);
            const items = section.items.filter(
              (item) =>
                matchesSection ||
                matchesBorough ||
                item.label.toLowerCase().includes(query) ||
                item.key.toLowerCase().includes(query)
            );
            return items.length ? { ...section, items } : null;
          })
          .filter(Boolean);

        if (filteredSections.length) {
          result[borough] = {
            ...boroughData,
            sections: filteredSections as typeof boroughData.sections,
          };
        } else {
          result[borough] = { ...boroughData, sections: [] };
        }
      }
    );

    return result;
  }, [search]);

  if (!isOpen) return null;

  // SELECT / REMOVE
  const toggleNeighborhood = (borough: string, neighborhoodKey: string) => {
    const boroughEntry = locations.find((l) => l.borough === borough);
    const isSelected = boroughEntry?.neighborhoods.includes(neighborhoodKey);

    if (isSelected) {
      dispatch(removeNeighborhood({ borough, neighborhood: neighborhoodKey }));
    } else {
      dispatch(addNeighborhood({ borough, neighborhood: neighborhoodKey }));
    }
  };

  const openNeighborhoodModal = (borough: "" | "Manhattan" | "Brooklyn") => {
    setSelectedBorough(borough);
    setIsNeighborhoodOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
        <div className="bg-white w-[90%] sm:w-[400px] md:w-[460px] rounded-2xl shadow-lg p-6 relative animate-fadeIn">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-800 transition"
          >
            <X size={20} />
          </button>

          <h3 className="text-sm font-medium text-gray-700 mb-3">Location</h3>

          {/* SEARCH INPUT */}
          <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5 mb-4">
            <Search size={16} className="text-blue-500 mr-2" />
            <input
              type="text"
              placeholder="Search neighborhoods or boroughs"
              className="w-full bg-transparent text-gray-600 outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {selectedNeighborhoods.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">
                Selected neighborhoods
              </p>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                {selectedNeighborhoods.map((item) => (
                  <span
                    key={`${item.borough}-${item.key}`}
                    className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-1 rounded-full"
                  >
                    <b className="font-semibold">{item.borough}</b>
                    <span>{item.label}</span>
                    <button
                      onClick={() => toggleNeighborhood(item.borough, item.key)}
                      aria-label={`Remove ${item.label}`}
                      className="hover:text-blue-900 transition"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SEARCH RESULTS */}
          {/* BROWSE BY BOROUGH → SECTION → NEIGHBORHOOD */}
          <div className="max-h-56 overflow-y-auto mb-4 rounded-lg bg-gray-100 p-3 space-y-4">
            {(
              Object.keys(filteredBoroughs) as Array<"Manhattan" | "Brooklyn">
            ).map((borough) => {
              const boroughData = filteredBoroughs[borough];
              if (!boroughData.sections.length) return null;

              return (
                <div key={borough}>
                  {/* Borough Title */}
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    {borough}
                  </h4>

                  {boroughData.sections.map((section) => (
                    <div key={section.title} className="mb-3 pl-2">
                      {/* Section Title */}
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {section.title}
                      </p>

                      <div className="space-y-1">
                        {section.items.map((item) => {
                          const isSelected = locations
                            .find((l) => l.borough === borough)
                            ?.neighborhoods.includes(item.key);

                          return (
                            <button
                              key={`${borough}-${item.key}`}
                              onClick={() =>
                                toggleNeighborhood(borough, item.key)
                              }
                              className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                                isSelected
                                  ? "bg-blue-100 text-blue-700"
                                  : "hover:bg-gray-200 text-gray-700"
                              }`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* SEE ALL */}
          <button
            onClick={() => openNeighborhoodModal("")}
            className="flex items-center gap-2 text-blue-600 font-medium text-sm mb-6 hover:underline mx-auto"
          >
            <MapIcon size={18} className="text-blue-600" />
            See all neighborhoods
          </button>

          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>

      {/* NEIGHBORHOOD MODAL */}
      <NeighborhoodModal
        isOpen={isNeighborhoodOpen}
        onClose={() => setIsNeighborhoodOpen(false)}
        selectedBorough={selectedBorough}
      />
    </>
  );
}
