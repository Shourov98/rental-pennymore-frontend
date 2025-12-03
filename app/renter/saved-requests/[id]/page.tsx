"use client";

import { useState, useEffect } from "react";
import { MapPin, DollarSign, Calendar, Bell } from "lucide-react";
import LocationModal from "@/components/LocationModal";
import SuccessModal from "@/components/SuccessModal";

export default function EditPreMarketListingPage() {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // -----------------------------------------
  // Mock Saved Request (Later fetched from API)
  // -----------------------------------------
  const savedRequest = {
    id: 1,
    requestName: "BeforeListed-1",
    borough: "Manhattan",
    neighborhoods: ["West Chelsea", "Hudson Yards"],
    dateRange: "5/21/25 - 6/21/25",
    minPrice: 3000,
    maxPrice: 4500,
    bedrooms: ["2BR"],
    bathrooms: ["1"],
    unitFeatures: ["Laundry in unit"],
    buildingFeatures: ["Doorman"],
    petPolicy: ["Cats allowed"],
    guarantor: ["Personal guarantor"],
    notes: "I want the room clean.",
  };

  // Extract earliest & latest date
  const [earliestDate, latestDate] = savedRequest.dateRange.split(" - ");

  // -----------------------------------------
  // Local Editable States
  // -----------------------------------------
  const [requestName, setRequestName] = useState(savedRequest.requestName);
  const [minPrice, setMinPrice] = useState(savedRequest.minPrice);
  const [maxPrice, setMaxPrice] = useState(savedRequest.maxPrice);
  const [startDate, setStartDate] = useState(earliestDate);
  const [endDate, setEndDate] = useState(latestDate);
  const [activeBedrooms, setActiveBedrooms] = useState<string[]>(
    savedRequest.bedrooms
  );
  const [activeBathrooms, setActiveBathrooms] = useState<string[]>(
    savedRequest.bathrooms
  );
  const [selectedUnitFeatures, setSelectedUnitFeatures] = useState<string[]>(
    savedRequest.unitFeatures
  );
  const [selectedBuildingFeatures, setSelectedBuildingFeatures] = useState<
    string[]
  >(savedRequest.buildingFeatures);
  const [selectedPets, setSelectedPets] = useState<string[]>(
    savedRequest.petPolicy
  );
  const [selectedGuarantor, setSelectedGuarantor] = useState<string[]>(
    savedRequest.guarantor
  );
  const [notes, setNotes] = useState(savedRequest.notes);

  // Toggles
  const toggleItem = (
    item: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    list: string[]
  ) => {
    setter(
      list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
    );
  };

  // Options
  const bedroomOptions = ["Studio", "1BR", "2BR", "3BR", "4BR+"];
  const bathroomOptions = ["1", "2", "3", "4+"];
  const unitFeatures = [
    "Laundry in unit",
    "Private outdoor space",
    "Dishwasher",
  ];
  const buildingFeatures = ["Doorman", "Elevator", "Laundry in building"];
  const petPolicy = ["Cats allowed", "Dogs allowed"];
  const guarantorOptions = ["Personal guarantor", "Third party guarantor"];

  // Submit
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccessModalOpen(true);
  };

  return (
    <section className="w-full min-h-screen bg-gray-50 py-8 px-4 sm:px-8 md:px-12 overflow-y-auto">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Edit Pre-Market Listing Request
          </h1>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Request Name */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <label className="mt-2 text-sm font-medium text-gray-700">
              Pre-Market request name
            </label>
            <input
              type="text"
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-1/3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Moving Date */}
          <div className="mb-2 text-gray-500">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Moving Date
            </p>
          </div>

          <div className="flex flex-col text-gray-500 sm:flex-row gap-3 mb-4">
            {/* Earliest Date */}
            <div className="w-full sm:w-1/2">
              <label className="text-xs text-gray-600">Earliest</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                <Calendar size={16} className="text-blue-600 mr-2" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* Latest Date */}
            <div className="w-full sm:w-1/2">
              <label className="text-xs text-gray-600">Latest</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                <Calendar size={16} className="text-blue-600 mr-2" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-2">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Price Range
            </p>
          </div>

          <div className="flex flex-col text-gray-500 sm:flex-row gap-3 mb-4">
            {/* Min Price */}
            <div className="w-full sm:w-1/2">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                <DollarSign size={16} className="text-blue-600 mr-2" />
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  placeholder="Min Price"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* Max Price */}
            <div className="w-full sm:w-1/2">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                <DollarSign size={16} className="text-blue-600 mr-2" />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  placeholder="Max Price"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col mb-4">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Location
            </label>
            <div
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 cursor-pointer hover:border-blue-500 transition"
            >
              <MapPin size={16} className="text-blue-600 mr-2 shrink-0" />
              <span className="text-gray-700 text-sm">
                {savedRequest.borough} • {savedRequest.neighborhoods.join(", ")}
              </span>
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Bedrooms</p>
            <div className="grid grid-cols-5 gap-2">
              {bedroomOptions.map((br) => (
                <button
                  key={br}
                  type="button"
                  onClick={() =>
                    toggleItem(br, setActiveBedrooms, activeBedrooms)
                  }
                  className={`py-2 rounded-lg text-sm font-medium border ${
                    activeBedrooms.includes(br)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-500"
                  }`}
                >
                  {br}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Bathrooms
            </p>
            <div className="grid grid-cols-4 gap-2">
              {bathroomOptions.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() =>
                    toggleItem(b, setActiveBathrooms, activeBathrooms)
                  }
                  className={`py-2 rounded-lg text-sm font-medium border ${
                    activeBathrooms.includes(b)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-500"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Unit Features */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Unit Features
              </p>
              {unitFeatures.map((f) => (
                <label
                  key={f}
                  className="flex items-center gap-2 mb-1 text-sm text-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={selectedUnitFeatures.includes(f)}
                    onChange={() =>
                      toggleItem(
                        f,
                        setSelectedUnitFeatures,
                        selectedUnitFeatures
                      )
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  {f}
                </label>
              ))}
            </div>

            {/* Building Features */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Building Features
              </p>
              {buildingFeatures.map((f) => (
                <label
                  key={f}
                  className="flex items-center gap-2 mb-1 text-sm text-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={selectedBuildingFeatures.includes(f)}
                    onChange={() =>
                      toggleItem(
                        f,
                        setSelectedBuildingFeatures,
                        selectedBuildingFeatures
                      )
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  {f}
                </label>
              ))}
            </div>

            {/* Pet Policy */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Pet Policy
              </p>
              {petPolicy.map((f) => (
                <label
                  key={f}
                  className="flex items-center gap-2 mb-1 text-sm text-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={selectedPets.includes(f)}
                    onChange={() =>
                      toggleItem(f, setSelectedPets, selectedPets)
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  {f}
                </label>
              ))}
            </div>
          </div>

          {/* Guarantor */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Check if you need a guarantor to qualify
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {guarantorOptions.map((f) => (
                <label
                  key={f}
                  className="flex items-center gap-2 text-sm text-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={selectedGuarantor.includes(f)}
                    onChange={() =>
                      toggleItem(f, setSelectedGuarantor, selectedGuarantor)
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  {f}
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg px-5 py-3 hover:bg-blue-700 transition"
            >
              <Bell size={16} />
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Modals */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </section>
  );
}
