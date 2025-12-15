"use client";

import { useState, useMemo } from "react";
import { X, Search, Map } from "lucide-react";
import dynamic from "next/dynamic";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  addNeighborhood,
  removeNeighborhood,
} from "@/store/slices/preferenceSlice";

import boroughNeighborhoods from "@/data/boroughNeighborhoods";

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

  const selectedNeighborhoods = useMemo(
    () =>
      locations.flatMap((loc) =>
        (loc.neighborhoods || []).map((n) => ({
          borough: loc.borough,
          neighborhood: n,
        }))
      ),
    [locations]
  );

  // SEARCH LOGIC
  const allNeighborhoods = useMemo(
    () =>
      Object.entries(boroughNeighborhoods).flatMap(([borough, neighborhoods]) =>
        neighborhoods.map((n) => ({ borough, neighborhood: n }))
      ),
    []
  );

  const searchResults = useMemo(() => {
    if (!search.trim()) return allNeighborhoods;

    const query = search.toLowerCase();

    return allNeighborhoods.filter(
      (item) =>
        item.borough.toLowerCase().includes(query) ||
        item.neighborhood.toLowerCase().includes(query)
    );
  }, [allNeighborhoods, search]);

  if (!isOpen) return null;

  // SELECT / REMOVE
  const toggleNeighborhood = (borough: string, neighborhood: string) => {
    const boroughEntry = locations.find((l) => l.borough === borough);
    const isSelected = boroughEntry?.neighborhoods.includes(neighborhood);

    if (isSelected) {
      dispatch(removeNeighborhood({ borough, neighborhood }));
    } else {
      dispatch(addNeighborhood({ borough, neighborhood }));
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
                    key={`${item.borough}-${item.neighborhood}`}
                    className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-1 rounded-full"
                  >
                    <b className="font-semibold">{item.borough}</b>
                    <span>{item.neighborhood}</span>
                    <button
                      onClick={() =>
                        toggleNeighborhood(item.borough, item.neighborhood)
                      }
                      aria-label={`Remove ${item.neighborhood}`}
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
          <div className="max-h-48 overflow-y-auto mb-4 rounded-lg p-2 bg-gray-100">
            {searchResults.length === 0 ? (
              <p className="text-sm text-gray-500">No results</p>
            ) : (
              searchResults.map((item, i) => {
                const isSelected = locations
                  .find((l) => l.borough === item.borough)
                  ?.neighborhoods.includes(item.neighborhood);

                return (
                  <button
                    key={i}
                    onClick={() =>
                      toggleNeighborhood(item.borough, item.neighborhood)
                    }
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md ${
                      isSelected
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <b>{item.borough}</b> — {item.neighborhood}
                  </button>
                );
              })
            )}
          </div>

          {/* SEE ALL */}
          <button
            onClick={() => openNeighborhoodModal("")}
            className="flex items-center gap-2 text-blue-600 font-medium text-sm mb-6 hover:underline mx-auto"
          >
            <Map size={18} className="text-blue-600" />
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
