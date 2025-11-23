"use client";

import { X } from "lucide-react";
import { useState, useMemo } from "react";

const boroughNeighborhoods: Record<string, string[]> = {
  Manhattan: [
    "Harlem",
    "Upper West Side",
    "Upper East Side",
    "Hell’s Kitchen",
    "Midtown East",
    "Chelsea",
    "SoHo",
    "Tribeca",
    "Financial District",
    "West Village",
    "East Village",
    "Lower East Side",
    "Chinatown",
  ],
  Brooklyn: [
    "Williamsburg",
    "Greenpoint",
    "Bushwick",
    "Bedford-Stuyvesant",
    "Brooklyn Heights",
    "Park Slope",
    "Fort Greene",
    "Clinton Hill",
    "Crown Heights",
    "Flatbush",
    "Kensington",
    "Bay Ridge",
    "Bensonhurst",
    "Brighton Beach",
    "Sheepshead Bay",
    "DUMBO",
  ],
};

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: {
    borough: string | null;
    neighborhoods: string[];
    bedrooms: string[];
    bathrooms: string[];
    maxPrice: number | null;
  }) => void;
}

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
}: FilterModalProps) {
  const boroughOptions = Object.keys(boroughNeighborhoods);

  // STATE
  const [borough, setBorough] = useState<string | null>(null);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>(
    []
  );
  const [bedrooms, setBedrooms] = useState<string[]>([]);
  const [bathrooms, setBathrooms] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  // OPTIONS
  const bedroomOptions = ["Studio", "1BR", "2BR", "3BR", "4BR+"];
  const bathroomOptions = ["1", "2", "3", "4+"];
  const priceOptions = Array.from({ length: 11 }, (_, i) => i * 1000);

  // Derive neighborhoods from borough
  const neighborhoods = useMemo(() => {
    return borough ? boroughNeighborhoods[borough] || [] : [];
  }, [borough]);

  // Reset selected neighborhoods when borough changes by using a key on the parent component

  const toggleSelection = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    state: string[]
  ) => {
    if (state.includes(value)) {
      setter(state.filter((v) => v !== value));
    } else {
      setter([...state, value]);
    }
  };

  const resetAll = () => {
    setBorough(null);
    setSelectedNeighborhoods([]);
    setBedrooms([]);
    setBathrooms([]);
    setMaxPrice(null);
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
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
      <div className="bg-white w-[85%] sm:w-[350px] h-full p-6 shadow-xl animate-slideIn relative overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Filter</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="space-y-6 pb-20">
          {/* Borough */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Borough</p>
            <div className="grid grid-cols-2 gap-2">
              {boroughOptions.map((b) => (
                <button
                  key={b}
                  onClick={() => setBorough(b)}
                  className={`py-2 border rounded-lg text-sm font-medium ${
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

          {/* Neighborhood (Multi-select + Chips) */}
          {borough && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Neighborhood
              </p>

              {/* Selected chips */}
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedNeighborhoods.map((n) => (
                  <span
                    key={n}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-2"
                  >
                    {n}
                    <button
                      onClick={() =>
                        setSelectedNeighborhoods((prev) =>
                          prev.filter((i) => i !== n)
                        )
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Dropdown list */}
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border p-2 rounded-lg">
                {neighborhoods.map((n) => (
                  <button
                    key={n}
                    onClick={() =>
                      toggleSelection(
                        n,
                        setSelectedNeighborhoods,
                        selectedNeighborhoods
                      )
                    }
                    className={`text-left p-2 rounded-lg text-sm border ${
                      selectedNeighborhoods.includes(n)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 border-gray-200 text-gray-700"
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
            <p className="text-sm font-medium text-gray-700 mb-2">Bedrooms</p>
            <div className="grid grid-cols-3 gap-2">
              {bedroomOptions.map((br) => (
                <button
                  key={br}
                  onClick={() => toggleSelection(br, setBedrooms, bedrooms)}
                  className={`py-2 border rounded-lg text-sm ${
                    bedrooms.includes(br)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  {br}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Bathrooms</p>
            <div className="grid grid-cols-4 gap-2">
              {bathroomOptions.map((b) => (
                <button
                  key={b}
                  onClick={() => toggleSelection(b, setBathrooms, bathrooms)}
                  className={`py-2 border rounded-lg text-sm ${
                    bathrooms.includes(b)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Max Price</p>
            <select
              className="w-full border px-3 py-2 rounded-lg bg-gray-50"
              value={maxPrice ?? ""}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            >
              <option value="">Select Price</option>
              {priceOptions.map((p) => (
                <option key={p} value={p}>
                  ${p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-0 left-0 right-0 bg-white p-6 flex gap-3 border-t">
          <button
            onClick={resetAll}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium"
          >
            Reset
          </button>
          <button
            onClick={applyFilters}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium"
          >
            Apply
          </button>
        </div>
      </div>

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
