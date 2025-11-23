"use client";

import { useState } from "react";
import { MapPin, DollarSign, Calendar, ChevronDown, Bell } from "lucide-react";
import LocationModal from "@/components/LocationModal";
import SuccessModal from "@/components/SuccessModal";

export default function PreMarketListingPage() {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [activeBedrooms, setActiveBedrooms] = useState<string[]>([]);
  const [activeBathrooms, setActiveBathrooms] = useState<string[]>([]);

  const bedroomOptions = ["Studio", "1BR", "2BR", "3BR", "4BR+"];
  const bathroomOptions = ["1", "2", "3", "4+"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccessModalOpen(true);
  };

  const toggleBedroom = (br: string) => {
    setActiveBedrooms((prev) =>
      prev.includes(br) ? prev.filter((x) => x !== br) : [...prev, br]
    );
  };

  const toggleBathroom = (b: string) => {
    setActiveBathrooms((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );
  };

  const unitFeatures = [
    "Laundry in unit",
    "Private outdoor space",
    "Dishwasher",
  ];
  const buildingFeatures = ["Doorman", "Elevator", "Laundry in building"];
  const petPolicy = ["Cats allowed", "Dogs allowed"];
  const guarantorOptions = ["Personal guarantor", "Third party guarantor"];

  return (
    <section className="w-full min-h-screen bg-gray-50 py-8 px-4 sm:px-8 md:px-12">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Pre-Market Listing Request
          </h1>
          <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition">
            Saved Requests
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Form Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Choose your preferences
            </h2>

            {/* Request Name */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <label className="text-sm font-medium text-gray-700">
                Pre-Market request name
              </label>
              <input
                type="text"
                placeholder="BeforeListed-1"
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-1/3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Moving Date */}
            <div className="mb-2">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Moving Date
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {/* Earliest Date */}
              <div className="w-full sm:w-1/2">
                <label className="text-xs text-gray-600">Earliest</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                  <Calendar size={16} className="text-blue-600 mr-2" />
                  <input
                    type="date"
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

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {/* Min Price */}
              <div className="w-full sm:w-1/2">
                <label className="text-xs text-gray-600">Min Price</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                  <DollarSign size={16} className="text-blue-600 mr-2" />
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
              </div>

              {/* Max Price */}
              <div className="w-full sm:w-1/2">
                <label className="text-xs text-gray-600">Max Price</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                  <DollarSign size={16} className="text-blue-600 mr-2" />
                  <input
                    type="number"
                    placeholder="Max"
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
                <span className="text-gray-500 text-sm">
                  Choose Borough and neighborhoods
                </span>
              </div>
            </div>

            {/* Bedrooms */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Bedrooms
              </p>
              <div className="grid grid-cols-5 gap-2">
                {bedroomOptions.map((br) => (
                  <button
                    key={br}
                    onClick={() => toggleBedroom(br)}
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
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Bathrooms
              </p>
              <div className="grid grid-cols-4 gap-2">
                {bathroomOptions.map((b) => (
                  <button
                    key={b}
                    onClick={() => toggleBathroom(b)}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Unit Features
                </p>
                {unitFeatures.map((f) => (
                  <label
                    key={f}
                    className="flex items-center gap-2 mb-1 text-sm text-gray-800"
                  >
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                    {f}
                  </label>
                ))}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Building Features
                </p>
                {buildingFeatures.map((f) => (
                  <label
                    key={f}
                    className="flex items-center gap-2 mb-1 text-sm text-gray-800"
                  >
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                    {f}
                  </label>
                ))}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Pet Policy
                </p>
                {petPolicy.map((f) => (
                  <label
                    key={f}
                    className="flex items-center gap-2 mb-1 text-sm text-gray-800"
                  >
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                    {f}
                  </label>
                ))}
              </div>
            </div>

            {/* Guarantor */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Accept Guarantor
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {guarantorOptions.map((f) => (
                  <label
                    key={f}
                    className="flex items-center gap-2 text-sm text-gray-800"
                  >
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                    {f}
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Notes sent to your agent when they find a matching pre-market
                apartment
              </p>
              <textarea
                placeholder="Write here"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-blue-500 text-white text-sm sm:text-base font-medium rounded-lg px-5 py-3 hover:bg-blue-700 transition"
              >
                <Bell size={16} />
                Save Request & Get Match
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Location Modal */}
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
