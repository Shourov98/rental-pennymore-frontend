"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import RenameModal from "@/components/RenameModal";
// import modal component

export default function SavedSearchesPage() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedSearch, setSelectedSearch] = useState<string | null>(null);

  const savedSearches = [
    { id: 1, type: "Rent", name: "Search filter name" },
    { id: 2, type: "Rent", name: "Search filter name" },
    { id: 3, type: "Rent", name: "Search filter name" },
  ];

  const handleEdit = (name: string) => {
    setSelectedSearch(name);
    setOpenModal(true);
  };

  return (
    <section className="w-full bg-gray-50 min-h-screen py-10 px-4 sm:px-8 md:px-12">
      {/* Page Header */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-900">
          Submitted Pre-Market Searches
        </h1>
      </div>

      {/* Tab Header */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-4 border border-gray-100 mb-6">
        <p className="text-lg font-semibold text-gray-800">Saved search</p>
      </div>

      {/* Saved Searches */}
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        {savedSearches.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-white rounded-xl shadow-sm p-4 border border-gray-100"
          >
            <p className="text-gray-800 text-sm sm:text-base">
              <span className="font-semibold">{item.type}:</span> {item.name}
            </p>
            <button
              onClick={() => handleEdit(item.name)}
              className="flex items-center gap-1 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Edit
              <ChevronDown size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Rename Modal */}
      {openModal && (
        <RenameModal
          searchName={selectedSearch}
          onClose={() => setOpenModal(false)}
        />
      )}
    </section>
  );
}
