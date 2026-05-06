"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";
import boroughNeighborhoodsData from "../../data/neighborhoods.manhattan-brooklyn";

export interface FilterType {
  borough: string | null;
  neighborhoods: string[];
  bedrooms: number[];
  bathrooms: number[];
  maxPrice: number | null;
}

const uniqueLabels = (labels: string[]) => Array.from(new Set(labels));

const boroughNeighborhoods: Record<string, string[]> = {
  Manhattan: uniqueLabels(
    boroughNeighborhoodsData.Manhattan.sections.flatMap((section) =>
      section.items.map((item) => item.label),
    ),
  ),
  Brooklyn: uniqueLabels(
    boroughNeighborhoodsData.Brooklyn.sections.flatMap((section) =>
      section.items.map((item) => item.label),
    ),
  ),
};

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
  initialFilters,
  resultCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterType) => void;
  initialFilters?: FilterType;
  resultCount?: number;
}) {
  const defaultFilters: FilterType = {
    borough: null,
    neighborhoods: [],
    bedrooms: [],
    bathrooms: [],
    maxPrice: null,
  };
  const resolvedInitialFilters = initialFilters ?? defaultFilters;
  const [borough, setBorough] = useState<string | null>(
    resolvedInitialFilters.borough,
  );
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>(
    resolvedInitialFilters.neighborhoods,
  );
  const [bedrooms, setBedrooms] = useState<number[]>(
    resolvedInitialFilters.bedrooms,
  );
  const [bathrooms, setBathrooms] = useState<number[]>(
    resolvedInitialFilters.bathrooms,
  );
  const [maxPrice, setMaxPrice] = useState<number | null>(
    resolvedInitialFilters.maxPrice,
  );

  const neighborhoods = useMemo(
    () => (borough ? boroughNeighborhoods[borough] : []),
    [borough],
  );

  const toggleSelection = (
    value: number,
    setter: React.Dispatch<React.SetStateAction<number[]>>,
    state: number[],
  ) => {
    if (state.includes(value)) {
      setter(state.filter((item) => item !== value));
    } else {
      setter([...state, value]);
    }
  };

  const toggleStringSelection = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    state: string[],
  ) => {
    if (state.includes(value)) {
      setter(state.filter((item) => item !== value));
    } else {
      setter([...state, value]);
    }
  };

  const resetAll = () => {
    setBorough(defaultFilters.borough);
    setSelectedNeighborhoods(defaultFilters.neighborhoods);
    setBedrooms(defaultFilters.bedrooms);
    setBathrooms(defaultFilters.bathrooms);
    setMaxPrice(defaultFilters.maxPrice);
    onApply(defaultFilters);
  };

  const applyFilters = () => {
    onApply({
      borough,
      neighborhoods: selectedNeighborhoods,
      bedrooms,
      bathrooms,
      maxPrice,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 text-black z-50 flex justify-end"
      onClick={onClose}
    >
      <div
        className="bg-white h-full w-[85%] sm:w-[350px] shadow-xl animate-slideIn flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER (fixed) */}
        <div className="p-5 flex border border-gray-300 justify-between items-center shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Filter</h2>
          <X
            className="w-5 h-5 text-gray-600 cursor-pointer"
            onClick={onClose}
          />
        </div>

        {/* CONTENT (scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Borough */}
          <div>
            <p className="text-sm font-medium mb-2">Borough</p>
            <div className="grid grid-cols-2 gap-2">
              {["Manhattan", "Brooklyn"].map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    setBorough(b);
                    setSelectedNeighborhoods([]); // reset neighborhoods on borough switch
                  }}
                  className={`py-2 rounded-full border text-sm font-medium ${
                    borough === b
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Neighborhood Chips + List */}
          {borough && (
            <div>
              <p className="text-sm font-medium mb-2">Neighborhood</p>

              {/* Selected Chips */}
              <div className="flex flex-wrap gap-2 mb-3 max-h-20 overflow-y-auto">
                {selectedNeighborhoods.map((n) => (
                  <span
                    key={n}
                    className="px-3 py-1 border border-gray-300 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1"
                  >
                    {n}
                    <button
                      onClick={() =>
                        setSelectedNeighborhoods(
                          selectedNeighborhoods.filter((x) => x !== n),
                        )
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Neighborhood List */}
              <div className="border border-gray-300 rounded-lg p-2 max-h-40 overflow-y-auto space-y-1">
                {neighborhoods.map((n) => (
                  <button
                    key={n}
                    onClick={() =>
                      toggleStringSelection(
                        n,
                        setSelectedNeighborhoods,
                        selectedNeighborhoods,
                      )
                    }
                    className={`block w-full text-left p-2 rounded-md text-sm border ${
                      selectedNeighborhoods.includes(n)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bedrooms */}
          <div>
            <p className="text-sm font-medium mb-2">Bedrooms</p>
            <div className="grid grid-cols-3 gap-2">
              {["Studio", "1BR", "2BR", "3BR", "4BR+"].map((b) => {
                const value = b === "Studio" ? 0 : parseInt(b);
                return (
                  <button
                    key={b}
                    onClick={() =>
                      toggleSelection(value, setBedrooms, bedrooms)
                    }
                    className={`py-2 rounded-lg border text-sm ${
                      bedrooms.includes(value)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <p className="text-sm font-medium mb-2">Bathrooms</p>
            <div className="grid grid-cols-4 gap-2">
              {["1", "2", "3", "4+"].map((b) => {
                const value = b.endsWith("+") ? parseInt(b) : parseInt(b);
                return (
                  <button
                    key={b}
                    onClick={() =>
                      toggleSelection(value, setBathrooms, bathrooms)
                    }
                    className={`py-2 rounded-lg border text-sm ${
                      bathrooms.includes(value)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Max Price Threshold (Manual Input) */}
          <div>
            <p className="text-sm font-medium mb-2">Rent</p>

            <div className="flex items-center gap-2 border border-gray-300 bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-blue-600 font-medium">$</span>

              <input
                type="number"
                min={0}
                step={100}
                value={maxPrice ?? ""}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? null : Number(e.target.value);
                  setMaxPrice(value);
                }}
                placeholder="Enter amount"
                className="w-full bg-transparent outline-none text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* FOOTER (fixed) */}
        <div className="p-5 border-t border-gray-300 bg-white flex flex-col gap-3 shrink-0">
          {typeof resultCount === "number" && (
            <div className="text-xs text-gray-500">
              Showing {resultCount} request{resultCount === 1 ? "" : "s"}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={resetAll}
              className="flex-1 py-2 border border-gray-300 rounded-full text-gray-700 font-medium"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 py-2 bg-blue-600 text-white rounded-full font-medium"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0%);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
