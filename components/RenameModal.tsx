"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface RenameModalProps {
  searchName: string | null;
  onClose: () => void;
}

export default function RenameModal({ searchName, onClose }: RenameModalProps) {
  const [name, setName] = useState(searchName || "");

  const handleSave = () => {
    console.log("Renamed to:", name);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[90%] sm:w-[400px] p-6 relative">
        {/* Header */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
          Rename Request
        </h2>
        <p className="text-center text-gray-600 text-sm mb-6">
          Get daily updates of new & updated listings that match your filters
        </p>

        {/* Input Field */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          placeholder="Name your filter"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-gray-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 mb-6"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
