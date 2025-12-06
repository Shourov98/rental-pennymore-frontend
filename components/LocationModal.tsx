"use client";

import { useEffect, useState } from "react";
import { X, MapPin, Search } from "lucide-react";
import boroughNeighborhoods from "@/data/boroughNeighborhoods";

interface NeighborhoodSelection {
  borough: string;
  neighborhood: string;
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelection?: NeighborhoodSelection[];
  onSave: (locations: { borough: string; neighborhoods: string[] }[]) => void;
}

export default function LocationModal({
  isOpen,
  onClose,
  initialSelection = [],
  onSave,
}: LocationModalProps) {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<NeighborhoodSelection[]>([]);
  const [selected, setSelected] = useState<NeighborhoodSelection[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelected(initialSelection);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 🔍 SEARCH FUNCTION
  const handleSearch = (value: string) => {
    setSearch(value);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const lower = value.toLowerCase();
    const matches: NeighborhoodSelection[] = [];

    Object.entries(boroughNeighborhoods).forEach(([borough, hoods]) => {
      hoods.forEach((hood) => {
        if (hood.toLowerCase().includes(lower)) {
          matches.push({ borough, neighborhood: hood });
        }
      });
    });

    setSuggestions(matches);
  };

  // ➕ Add selected item
  const addSelection = (item: NeighborhoodSelection) => {
    if (
      !selected.some(
        (s) =>
          s.neighborhood === item.neighborhood && s.borough === item.borough
      )
    ) {
      setSelected((prev) => [...prev, item]);
    }

    // Clear search
    setSearch("");
    setSuggestions([]);
  };

  // ❌ Remove one neighborhood
  const removeSelection = (hood: string) => {
    setSelected((prev) => prev.filter((s) => s.neighborhood !== hood));
  };

  // ✅ SAVE IN YOUR FINAL BACKEND FORMAT
  const handleApply = () => {
    const grouped: Record<string, string[]> = {};

    selected.forEach(({ borough, neighborhood }) => {
      if (!grouped[borough]) grouped[borough] = [];
      grouped[borough].push(neighborhood);
    });

    const finalOutput = Object.entries(grouped).map(
      ([borough, neighborhoods]) => ({
        borough,
        neighborhoods,
      })
    );

    onSave(finalOutput);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div
        className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Select Location
        </h2>

        {/* Search Box */}
        <div className="relative mb-4">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Search size={16} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search neighborhoods…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>

          {suggestions.length > 0 && (
            <div className="absolute w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto z-50">
              {suggestions.map((item) => (
                <div
                  key={`${item.borough}-${item.neighborhood}`}
                  onClick={() => addSelection(item)}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 flex justify-between"
                >
                  <span>{item.neighborhood}</span>
                  <span className="text-xs text-gray-500">{item.borough}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Neighborhoods */}
        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
          {selected.map((item) => (
            <div
              key={item.neighborhood}
              className="flex justify-between items-center bg-blue-50 border border-blue-400 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-blue-600" />
                <span className="font-medium text-sm">{item.neighborhood}</span>
                <span className="text-xs text-gray-500">({item.borough})</span>
              </div>

              <button
                onClick={() => removeSelection(item.neighborhood)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setSelected([])}
            className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-medium hover:bg-gray-300"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
