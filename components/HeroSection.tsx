"use client";

import Image from "next/image";
import { MapPin, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setLocations, setPriceRange } from "@/store/slices/preferenceSlice";
import LocationModal from "./LocationModal";
import { useState } from "react";

export default function HeroSection() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { locations, priceRange } = useSelector(
    (state: RootState) => state.preferences
  );

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const handleSaveLocations = (data) => {
    dispatch(setLocations(data));
    setIsLocationModalOpen(false);
  };

  return (
    <section className="relative w-full min-h-[85vh] flex flex-col justify-center items-center text-center text-white">
      {/* BG */}
      <div className="absolute inset-0 z-10">
        <Image
          src="/hero-bg.svg"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-black/40 -z-10" />

      {/* Headings */}
      <div className="px-4 sm:px-8 max-w-4xl mx-auto z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
          See it first. Rent it first
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-100">
          Get Access to NYC pre-market apartments before they are listed
        </p>
      </div>

      {/* Form card */}
      <div className="mt-10 bg-white text-gray-900 rounded-2xl shadow-md w-[90%] sm:w-[85%] md:w-[80%] lg:w-[70%] xl:w-[60%] px-4 sm:px-6 md:px-8 py-6 z-10">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-4 text-center">
          Submit your Pre-Market Listing Preferences
        </h3>

        <form className="flex flex-col sm:flex-row items-center gap-4 sm:gap-3 w-full">
          {/* Location */}
          <div className="flex flex-col w-full sm:w-2/5">
            <label className="text-xs font-medium pl-2 mb-1 text-gray-600">
              Location
            </label>
            <div
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 cursor-pointer hover:border-blue-500 transition"
            >
              <MapPin size={16} className="text-blue-600 mr-2" />
              <span className="text-gray-500 text-sm">
                {locations.length > 0
                  ? `${locations.length} location${
                      locations.length > 1 ? "s" : ""
                    } selected`
                  : "Choose Borough and neighborhoods"}
              </span>
            </div>
          </div>

          {/* Min Price */}
          <div className="flex flex-col w-full sm:w-[20%]">
            <label className="text-xs font-medium pl-2 mb-1 text-gray-600">
              Price
            </label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              <DollarSign size={16} className="text-blue-600 mr-2" />
              <input
                type="number"
                placeholder="Min Price"
                value={priceRange.min || ""}
                onChange={(e) =>
                  dispatch(
                    setPriceRange({
                      ...priceRange,
                      min: Number(e.target.value),
                    })
                  )
                }
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          {/* Max Price */}
          <div className="flex flex-col w-full sm:w-[20%]">
            <label className="text-xs font-medium mb-1 text-gray-600 invisible sm:visible">
              &nbsp;
            </label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              <DollarSign size={16} className="text-blue-600 mr-2" />
              <input
                type="number"
                placeholder="Max Price"
                value={priceRange.max || ""}
                onChange={(e) =>
                  dispatch(
                    setPriceRange({
                      ...priceRange,
                      max: Number(e.target.value),
                    })
                  )
                }
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            className="w-full sm:w-[20%] bg-blue-500 text-white text-sm sm:text-base font-semibold rounded-xl mt-5 px-6 py-2 hover:bg-blue-700"
            onClick={() => router.push("/pre-market-listing")}
          >
            Next
          </button>
        </form>
      </div>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        initialSelection={locations}
        onSave={handleSaveLocations}
      />
    </section>
  );
}
