"use client";

import { useRef, useState } from "react";
import { MapPin, DollarSign, Calendar, Bell } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import dynamic from "next/dynamic";

import {
  setMovingDate,
  setPriceRange,
  toggleBedroom,
  toggleBathroom,
  toggleUnitFeature,
  toggleBuildingFeature,
  togglePetPolicy,
  toggleGuarantor,
  setPreferencesList,
} from "@/store/slices/preferenceSlice";

import LocationModal from "@/components/LocationModal";
import SuccessModal from "@/components/SuccessModal";
import { neighborhoods } from "@/data/neighborhoods";

const PreferencesDragList = dynamic(
  () => import("@/components/PreferencesDragList"),
  { ssr: false }
);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pos-exterior-researchers-vegetarian.trycloudflare.com/api/v1";

export default function PreMarketListingPage() {
  const dispatch = useDispatch();
  const earliestDateRef = useRef<HTMLInputElement>(null);
  const latestDateRef = useRef<HTMLInputElement>(null);

  // Modal state (local UI)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  // Redux Global States
  const {
    movingDate,
    priceRange,
    locations,
    bedrooms,
    bathrooms,
    unitFeatures,
    buildingFeatures,
    petPolicy,
    guarantor,
    preferences,
  } = useSelector((state: RootState) => state.preferences);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const openDatePicker = (input: HTMLInputElement | null) => {
    if (!input) return;
    (input as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
    input.focus();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const toIsoDate = (date: string, endOfDay?: boolean) =>
      date ? `${date}T${endOfDay ? "23:59:59" : "00:00:00"}Z` : "";

    const payload = {
      movingDateRange: {
        earliest: toIsoDate(movingDate.earliest),
        latest: toIsoDate(movingDate.latest, true),
      },
      priceRange,
      locations,
      bedrooms,
      bathrooms,
      description,
      unitFeatures: {
        laundryInUnit: unitFeatures.includes("Laundry in unit"),
        privateOutdoorSpace: unitFeatures.includes("Private outdoor space"),
        dishwasher: unitFeatures.includes("Dishwasher"),
      },
      buildingFeatures: {
        doorman: buildingFeatures.includes("Doorman"),
        elevator: buildingFeatures.includes("Elevator"),
        laundryInBuilding: buildingFeatures.includes("Laundry in building"),
      },
      petPolicy: {
        catsAllowed: petPolicy.includes("Cats allowed"),
        dogsAllowed: petPolicy.includes("Dogs allowed"),
      },
      guarantorRequired: {
        personalGuarantor: guarantor.includes("Personal guarantor"),
        thirdPartyGuarantor: guarantor.includes("Third party guarantor"),
      },
      preferences,
    };

    try {
      setIsSubmitting(true);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${API_BASE_URL}/pre-market/create`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            "We couldn't submit your request right now. Please try again."
        );
      }

      setIsSuccessModalOpen(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't submit your request right now. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bedroomOptions = ["Studio", "1BR", "2BR", "3BR", "4BR+"];
  const bathroomOptions = ["1", "2", "3", "4+"];
  const unitOptions = [
    "Laundry in unit",
    "Private outdoor space",
    "Dishwasher",
  ];
  const buildingOptions = ["Doorman", "Elevator", "Laundry in building"];
  const petOptions = ["Cats allowed", "Dogs allowed"];
  const guarantorOptions = ["Personal guarantor", "Third party guarantor"];

  return (
    <section className="w-full min-h-screen bg-gray-50 py-8 px-4 sm:px-8 md:px-12">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Pre-Market Listing Request
          </h1>
        </div>

        {/* Form Section */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Choose your preferences
          </h2>

          {/* Moving Date */}
          <div className="mb-2">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Moving Date
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Earliest */}
            <div className="w-full sm:w-1/2">
              <label className="text-xs text-gray-600">Earliest</label>
              <div
                className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 cursor-pointer"
                onClick={() => openDatePicker(earliestDateRef.current)}
              >
                <Calendar size={16} className="text-blue-600 mr-2" />
                <input
                  type="date"
                  ref={earliestDateRef}
                  value={movingDate.earliest}
                  onChange={(e) =>
                    dispatch(
                      setMovingDate({
                        earliest: e.target.value,
                        latest: movingDate.latest,
                      })
                    )
                  }
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* Latest */}
            <div className="w-full sm:w-1/2">
              <label className="text-xs text-gray-600">Latest</label>
              <div
                className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 cursor-pointer"
                onClick={() => openDatePicker(latestDateRef.current)}
              >
                <Calendar size={16} className="text-blue-600 mr-2" />
                <input
                  type="date"
                  ref={latestDateRef}
                  value={movingDate.latest}
                  onChange={(e) =>
                    dispatch(
                      setMovingDate({
                        latest: e.target.value,
                        earliest: movingDate.earliest,
                      })
                    )
                  }
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
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                <DollarSign size={16} className="text-blue-600 mr-2" />
                <input
                  type="number"
                  value={priceRange.min === 0 ? "" : priceRange.min}
                  step={25}
                  onChange={(e) =>
                    dispatch(
                      setPriceRange({
                        min: Number(e.target.value),
                        max: priceRange.max,
                      })
                    )
                  }
                  placeholder="Min"
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
                  value={priceRange.max === 0 ? "" : priceRange.max}
                  step={25}
                  onChange={(e) =>
                    dispatch(
                      setPriceRange({
                        max: Number(e.target.value),
                        min: priceRange.min,
                      })
                    )
                  }
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

              <span className="text-gray-600 text-sm overflow-x-">
                {locations.length === 0
                  ? "Choose Borough and Neighborhoods"
                  : locations
                      .map(
                        (loc) =>
                          `${loc.borough} (${loc.neighborhoods.length}, ${loc.neighborhoods})`
                      )
                      .join(", ")}
              </span>
            </div>
          </div>

          {/* Bedrooms */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Bedrooms</p>

            <div className="grid grid-cols-5 gap-2">
              {bedroomOptions.map((br) => (
                <button
                  key={br}
                  type="button"
                  onClick={() => dispatch(toggleBedroom(br))}
                  className={`py-2 rounded-lg text-sm font-medium border ${
                    bedrooms.includes(br)
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
                  type="button"
                  onClick={() => dispatch(toggleBathroom(b))}
                  className={`py-2 rounded-lg text-sm font-medium border ${
                    bathrooms.includes(b)
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
            {/* Unit */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Unit Features
              </p>
              {unitOptions.map((f) => (
                <label key={f} className="flex items-center gap-2 mb-1 text-sm">
                  <input
                    type="checkbox"
                    checked={unitFeatures.includes(f)}
                    onChange={() => dispatch(toggleUnitFeature(f))}
                    className="w-4 h-4 text-blue-600"
                  />
                  {f}
                </label>
              ))}
            </div>

            {/* Building */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Building Features
              </p>
              {buildingOptions.map((f) => (
                <label key={f} className="flex items-center gap-2 mb-1 text-sm">
                  <input
                    type="checkbox"
                    checked={buildingFeatures.includes(f)}
                    onChange={() => dispatch(toggleBuildingFeature(f))}
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
              {petOptions.map((f) => (
                <label key={f} className="flex items-center gap-2 mb-1 text-sm">
                  <input
                    type="checkbox"
                    checked={petPolicy.includes(f)}
                    onChange={() => dispatch(togglePetPolicy(f))}
                    className="w-4 h-4 text-blue-600"
                  />
                  {f}
                </label>
              ))}
            </div>
          </div>

          {/* Guarantor */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Check if you need a guarantor
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              {guarantorOptions.map((f) => (
                <label key={f} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={guarantor.includes(f)}
                    onChange={() => dispatch(toggleGuarantor(f))}
                    className="w-4 h-4 text-blue-600"
                  />
                  {f}
                </label>
              ))}
            </div>
          </div>

          {/* Preferences Drag List */}
          <div className="mb-6">
            <PreferencesDragList
              onChange={(list) => dispatch(setPreferencesList(list))}
              initialList={preferences}
            />
          </div>

          {/* Submit */}
          {errorMessage && (
            <p className="text-sm text-red-600 text-right">{errorMessage}</p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-500 text-white text-sm sm:text-base font-medium rounded-lg px-5 py-3 hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Bell size={16} />
              {isSubmitting ? "Submitting..." : "Save Request & Send to Agents"}
            </button>
          </div>
        </form>
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </section>
  );
}
