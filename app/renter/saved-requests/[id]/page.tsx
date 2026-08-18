"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, DollarSign, Calendar, Bell } from "lucide-react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import dynamic from "next/dynamic";
import LocationModal from "@/components/LocationModal";
import SuccessModal from "@/components/SuccessModal";
import { RootState } from "@/store/store";
import {
  defaultPreferencesList,
  setLocations as setPreferenceLocations,
} from "@/store/slices/preferenceSlice";

const PreferencesDragList = dynamic(
  () => import("@/components/PreferencesDragList"),
  { ssr: false },
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const MARKET_SCOPE_SWITCH_LOCKED_MESSAGE =
  "A rental specialist is already assigned. To switch to upcoming only, you can notify your registered agent, delete the request and start again, or contact support@beforelisted.com.";

type FeatureGroup = "unit" | "building" | "pet" | "guarantor";

const featureLabels: Record<FeatureGroup, Record<string, string>> = {
  unit: {
    laundryInUnit: "Laundry in unit",
    privateOutdoorSpace: "Private outdoor space",
    dishwasher: "Dishwasher",
  },
  building: {
    doorman: "Doorman",
    elevator: "Elevator",
    laundryInBuilding: "Laundry in Building",
  },
  pet: {
    catsAllowed: "Cats allowed",
    dogsAllowed: "Dogs allowed",
  },
  guarantor: {
    personalGuarantor: "Personal guarantor",
    thirdPartyGuarantor: "Third party guarantor",
  },
};

interface ApiRequest {
  _id: string;
  requestName?: string;
  movingDateRange?: { earliest?: string; latest?: string };
  priceRange?: { min?: number; max?: number };
  locations?: { borough?: string; neighborhoods?: string[] }[];
  bedrooms?: string[];
  bathrooms?: string[];
  unitFeatures?: Record<string, boolean>;
  buildingFeatures?: Record<string, boolean>;
  petPolicy?: Record<string, boolean>;
  guarantorRequired?: Record<string, boolean>;
  preferences?: string[];
  notes?: string;
  shareConsent?: boolean;
  scope?: "Upcoming" | "All Market";
  visibility?: "PRIVATE" | "SHARED";
  marketScopeSwitchLocked?: boolean;
  marketScopeSwitchLockedReason?: string;
}

export default function EditPreMarketListingPage() {
  const params = useParams();
  const requestId = params?.id as string | undefined;
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const dispatch = useDispatch();
  const preferenceLocations = useSelector(
    (state: RootState) => state.preferences.locations,
  );

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------------------
  // Local Editable States
  // -----------------------------------------
  const [requestName, setRequestName] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeBedrooms, setActiveBedrooms] = useState<string[]>([]);
  const [activeBathrooms, setActiveBathrooms] = useState<string[]>([]);
  const [selectedUnitFeatures, setSelectedUnitFeatures] = useState<string[]>(
    [],
  );
  const [selectedBuildingFeatures, setSelectedBuildingFeatures] = useState<
    string[]
  >([]);
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const [selectedGuarantor, setSelectedGuarantor] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>(
    defaultPreferencesList,
  );
  const [locations, setLocations] = useState<
    { borough?: string; neighborhoods?: string[] }[]
  >([]);

  // Share + Subject Market Scope
  const [shareConsent, setShareConsent] = useState(false);
  const [shareConsentLocked, setShareConsentLocked] = useState(false);
  const [scope, setScope] = useState<"Upcoming" | "All Market">("Upcoming");
  const [visibility, setVisibility] = useState<"PRIVATE" | "SHARED">(
    "PRIVATE",
  );
  const [marketScopeSwitchLocked, setMarketScopeSwitchLocked] = useState(false);
  const [marketScopeSwitchLockedReason, setMarketScopeSwitchLockedReason] =
    useState(MARKET_SCOPE_SWITCH_LOCKED_MESSAGE);

  useEffect(() => {
    setLocations(preferenceLocations);
  }, [preferenceLocations]);

  // Fetch request details
  useEffect(() => {
    if (!requestId) return;
    const controller = new AbortController();

    const fetchRequest = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = {};
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

        const response = await fetch(
          `${API_BASE_URL}/pre-market/renter/${requestId}`,
          {
            method: "GET",
            headers,
            signal: controller.signal,
          },
        );
        const data = (await response.json().catch(() => ({}))) as {
          success?: boolean;
          data?: ApiRequest;
          message?: string;
        };

        if (!response.ok || data?.success === false || !data.data) {
          throw new Error(
            data?.message ||
              "We couldn't load this request right now. Please try again.",
          );
        }

        const req = data.data;
        setRequestName(req.requestName || "");
        setMinPrice(req.priceRange?.min ?? "");
        setMaxPrice(req.priceRange?.max ?? "");
        setStartDate(
          req.movingDateRange?.earliest
            ? new Date(req.movingDateRange.earliest).toISOString().slice(0, 10)
            : "",
        );
        setEndDate(
          req.movingDateRange?.latest
            ? new Date(req.movingDateRange.latest).toISOString().slice(0, 10)
            : "",
        );
        setActiveBedrooms(req.bedrooms ?? []);
        setActiveBathrooms(req.bathrooms ?? []);
        const apiPreferences =
          req.preferences && req.preferences.length > 0
            ? req.preferences
            : defaultPreferencesList;
        setPreferences(apiPreferences);
        const nextLocations = req.locations ?? [];
        setLocations(nextLocations);
        dispatch(
          setPreferenceLocations(
            nextLocations as {
              borough: "Manhattan" | "Brooklyn";
              neighborhoods: string[];
            }[],
          ),
        );

        const mapFeatures = (
          group: FeatureGroup,
          values?: Record<string, boolean>,
        ) => {
          if (!values) return [];
          return Object.entries(values)
            .filter(([, v]) => v)
            .map(([k]) => featureLabels[group][k] || k);
        };

        setSelectedUnitFeatures(mapFeatures("unit", req.unitFeatures));
        setSelectedBuildingFeatures(
          mapFeatures("building", req.buildingFeatures),
        );
        setSelectedPets(mapFeatures("pet", req.petPolicy));
        setSelectedGuarantor(mapFeatures("guarantor", req.guarantorRequired));

        // Share + Market Scope hydration
        setShareConsent(Boolean(req.shareConsent));
        setShareConsentLocked(Boolean(req.shareConsent));
        setScope(req.scope ?? "Upcoming");
        setVisibility(req.visibility ?? "PRIVATE");
        setMarketScopeSwitchLocked(Boolean(req.marketScopeSwitchLocked));
        setMarketScopeSwitchLockedReason(
          req.marketScopeSwitchLockedReason ||
            MARKET_SCOPE_SWITCH_LOCKED_MESSAGE,
        );
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error
            ? err.message
            : "We couldn't load this request right now. Please try again.";
        setError(message);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchRequest();

    return () => controller.abort();
  }, [accessToken, dispatch, requestId]);

  const locationEntries = useMemo(() => {
    if (!locations?.length) return [];
    return locations.map((loc) => ({
      borough: loc.borough || "Borough",
      neighborhoods: loc.neighborhoods?.join(" • ") || "Neighborhoods",
    }));
  }, [locations]);

  // Toggles
  const toggleItem = (
    item: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    list: string[],
  ) => {
    setter(
      list.includes(item) ? list.filter((x) => x !== item) : [...list, item],
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
  const buildingFeatures = ["Doorman", "Elevator", "Laundry in Building"];
  const petPolicy = ["Cats allowed", "Dogs allowed"];
  const guarantorOptions = ["Personal guarantor", "Third party guarantor"];

  // Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId) return;

    try {
      setIsSaving(true);
      setError(null);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const toIsoDate = (date: string, endOfDay?: boolean) =>
        date ? `${date}T${endOfDay ? "23:59:59" : "00:00:00"}Z` : "";

      const payload = {
        requestName,
        movingDateRange: {
          earliest: toIsoDate(startDate),
          latest: toIsoDate(endDate, true),
        },
        priceRange: {
          min: typeof minPrice === "number" ? minPrice : Number(minPrice) || 0,
          max: typeof maxPrice === "number" ? maxPrice : Number(maxPrice) || 0,
        },
        locations,
        bedrooms: activeBedrooms,
        bathrooms: activeBathrooms,
        unitFeatures: {
          laundryInUnit: selectedUnitFeatures.includes("Laundry in unit"),
          privateOutdoorSpace: selectedUnitFeatures.includes(
            "Private outdoor space",
          ),
          dishwasher: selectedUnitFeatures.includes("Dishwasher"),
        },
        buildingFeatures: {
          doorman: selectedBuildingFeatures.includes("Doorman"),
          elevator: selectedBuildingFeatures.includes("Elevator"),
          laundryInBuilding: selectedBuildingFeatures.includes("Laundry in Building"),
        },
        petPolicy: {
          catsAllowed: selectedPets.includes("Cats allowed"),
          dogsAllowed: selectedPets.includes("Dogs allowed"),
        },
        guarantorRequired: {
          personalGuarantor: selectedGuarantor.includes("Personal guarantor"),
          thirdPartyGuarantor: selectedGuarantor.includes(
            "Third party guarantor",
          ),
        },
        preferences,
        shareConsent,
        scope,
        visibility,
      };

      const response = await fetch(`${API_BASE_URL}/pre-market/${requestId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            "We couldn't save your changes right now. Please try again.",
        );
      }

      setIsSuccessModalOpen(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't save your changes right now. Please try again.";
      if (
        message === MARKET_SCOPE_SWITCH_LOCKED_MESSAGE &&
        typeof window !== "undefined"
      ) {
        window.alert(message);
        setScope("All Market");
      }
      setError(message);
    } finally {
      setIsSaving(false);
    }
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

        {error && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-sm text-gray-500">Loading request…</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Request Name */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <label className="mt-2 text-sm font-medium text-gray-700">
                Pre-Market request name
              </label>
              <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-1/3 text-sm text-gray-500">
                {requestName || "Request name"}
              </div>
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
                {locationEntries.length === 0 ? (
                  <span className="text-gray-700 text-sm">Add locations</span>
                ) : (
                  <div className="flex flex-col gap-2 text-sm text-gray-700">
                    {locationEntries.map((loc, index) => (
                      <div
                        key={`${loc.borough}-${index}`}
                        className="flex flex-col leading-snug"
                      >
                        <span className="font-semibold">{loc.borough}</span>
                        <span className="text-gray-600">
                          {loc.neighborhoods}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Bedrooms
              </p>
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
                          selectedUnitFeatures,
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
                          selectedBuildingFeatures,
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
                Check to include only owners who accept guarantors
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

            {/* Preferences Drag List */}
            <PreferencesDragList
              initialList={preferences}
              onChange={setPreferences}
            />

            {/* Subject Market Scope + Share */}
            <div className="border-t border-gray-300 pt-4 space-y-3">
              <div>
                <p className="text-[13px] font-semibold leading-snug text-black sm:text-sm md:text-[15px]">
                  Subject Market Scope
                </p>

                <div className="space-y-4 text-gray-800 mt-3">
                  <label className="flex items-start gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="marketScope"
                      checked={scope === "All Market"}
                      onChange={() => {
                        setScope("All Market");
                        setVisibility("PRIVATE");
                      }}
                      className="h-6 w-6 shrink-0 accent-gray-600"
                    />
                    <span className="space-y-1">
                      <span className="block text-[13px] font-semibold leading-snug text-gray-600 sm:text-sm md:text-[15px]">
                        Rentals Publicly Advertised + BeforeListed
                      </span>
                      <span className="block text-[13px] leading-relaxed text-gray-600 sm:text-sm md:text-[15px] md:leading-7">
                        A rental specialist agent will assist you with the full
                        rental market, and you will also be notified if an
                        upcoming rental that matches your request is found.
                      </span>
                    </span>
                  </label>

                  <label className="flex items-start gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="marketScope"
                      checked={scope === "Upcoming"}
                      onChange={() => {
                        if (marketScopeSwitchLocked) {
                          if (typeof window !== "undefined") {
                            window.alert(marketScopeSwitchLockedReason);
                          }
                          setScope("All Market");
                          return;
                        }

                        setScope("Upcoming");
                        setVisibility("PRIVATE");
                      }}
                      className="h-6 w-6 shrink-0 accent-gray-600"
                    />
                    <span className="space-y-1">
                      <span className="block text-[13px] font-semibold leading-snug text-gray-600 sm:text-sm md:text-[15px]">
                        Rentals Not Publicly Advertised Only (BeforeListed)
                      </span>
                      <span className="block text-[13px] leading-relaxed text-gray-600 sm:text-sm md:text-[15px] md:leading-7">
                        We will only notify you if an upcoming rental that
                        matches your request is found.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Share checkbox — always visible regardless of market scope */}
              <div className="border-t pt-4 text-gray-600 space-y-3">
                <div className="space-y-3">
                  <p className="text-[13px] font-semibold leading-snug text-black sm:text-sm md:text-[15px]">
                    Share your search to improve matching chances (optional -
                    highly recommended)
                  </p>
                  <p className="text-[13px] leading-relaxed text-gray-600 sm:text-sm md:text-[15px] md:leading-7">
                    To receive assistance beyond one agent, you may choose to
                    allow your request, including your first name and last
                    initial, to be shared with other licensed New York real
                    estate agents who could assist in identifying potential
                    rental opportunities that may not yet be publicly
                    advertised.
                  </p>
                  <label className="flex items-start gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareConsent}
                      onChange={(e) => {
                        const next = e.target.checked;
                        // Locked once enabled
                        if (shareConsentLocked && !next) {
                          if (typeof window !== "undefined") {
                            window.alert(
                              "This request has already been shared with your permission. To stop sharing, delete this request and create a new one without enabling Share.",
                            );
                          }
                          return;
                        }
                        setShareConsent(next);
                        if (next) setShareConsentLocked(true);
                      }}
                      className="mt-1 h-5 w-5 accent-gray-600"
                    />
                    <span className="text-[13px] leading-relaxed text-gray-600 sm:text-sm md:text-[15px] md:leading-7">
                      By checking this box, I consent to my request being
                      shared with other licensed New York real estate agents
                      and to being contacted by such agents.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg px-5 py-3 hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Bell size={16} />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
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
