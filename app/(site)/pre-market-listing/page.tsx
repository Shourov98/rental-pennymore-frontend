"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, DollarSign, Calendar, Bell } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { selectReferrerName } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

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
  resetPreferences,
} from "@/store/slices/preferenceSlice";

import LocationModal from "@/components/LocationModal";
import SuccessModal from "@/components/SuccessModal";
import { neighborhoods } from "@/data/neighborhoods";

const PreferencesDragList = dynamic(
  () => import("@/components/PreferencesDragList"),
  { ssr: false },
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function PreMarketListingPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const earliestDateRef = useRef<HTMLInputElement>(null);
  const latestDateRef = useRef<HTMLInputElement>(null);

  // Modal state (local UI)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [description, setDescription] = useState("");
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);
  const [shareConsent, setShareConsent] = useState(false);
  const [marketScope, setMarketScope] = useState<
    "" | "Upcoming" | "All Market"
  >("");
  const [agreementWarning, setAgreementWarning] = useState<string | null>(null);
  const referrerName = useSelector(selectReferrerName);

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
  const role = useSelector((state: RootState) => state.auth.role);
  const user = useSelector((state: RootState) => state.auth.user);
  const renter = useSelector((state: RootState) => state.auth.renter);

  const renterName = renter?.fullName || user?.fullName || "Unknown renter";
  const renterEmail = renter?.email || user?.email || "";
  const renterPhone = renter?.phoneNumber || user?.phone || "";

  const registrationLink = useMemo(() => {
    const baseQuery = "env=na1";
    const baseUrl =
      "https://powerforms.docusign.net/3d78f62d-edfc-4831-890c-5b4e9f71978d";

    const encode = (value: string) => value.replace(/ /g, "%20");

    let url = `${baseUrl}?${baseQuery}`;
    if (renterName) url += `&renter_name=${encode(renterName)}`;
    if (renterEmail) url += `&renter_email=${renterEmail}`;
    if (renterPhone) url += `&renter_phone=${renterPhone}`;
    if (referrerName) url += `&agent_name=${encode(referrerName)}`;

    return url;
  }, [renterEmail, renterName, renterPhone, referrerName]);

  const toInputDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const earliestMinDate = toInputDate(today);

  const latestMinDate = useMemo(() => {
    if (!movingDate.earliest) return earliestMinDate;
    const date = new Date(`${movingDate.earliest}T00:00:00`);
    if (Number.isNaN(date.getTime())) return earliestMinDate;
    date.setDate(date.getDate() + 1);
    return toInputDate(date);
  }, [earliestMinDate, movingDate.earliest]);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/signin");
      return;
    }

    if (role === "Agent") {
      alert("This page is only available for renters.");
      router.replace("/");
    }
  }, [accessToken, role, router]);

  const openDatePicker = (input: HTMLInputElement | null) => {
    if (!input) return;
    (input as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
    input.focus();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setFormError(null);

    const nextFieldErrors: Record<string, string> = {};

    if (!movingDate.earliest || !movingDate.latest) {
      nextFieldErrors.movingDate =
        "Please select your earliest and latest dates.";
    } else {
      const earliestDate = new Date(`${movingDate.earliest}T00:00:00`);
      const latestDate = new Date(`${movingDate.latest}T00:00:00`);
      const minLatestDate = new Date(earliestDate);
      minLatestDate.setDate(minLatestDate.getDate() + 1);

      if (earliestDate < today) {
        nextFieldErrors.movingDate =
          "Earliest date cannot be earlier than today.";
      } else if (latestDate < minLatestDate) {
        nextFieldErrors.movingDate =
          "Latest date must be at least 1 day after the earliest date.";
      }
    }

    const minPrice = Number.isFinite(priceRange.min) ? priceRange.min : 0;
    const maxPrice = Number.isFinite(priceRange.max) ? priceRange.max : 0;

    if (!maxPrice) {
      nextFieldErrors.priceRange = "Please enter a maximum price.";
    }

    if (locations.length === 0) {
      nextFieldErrors.locations = "Please select at least one location.";
    }

    if (bedrooms.length === 0) {
      nextFieldErrors.bedrooms = "Please select at least one option.";
    }

    if (bathrooms.length === 0) {
      nextFieldErrors.bathrooms = "Please select at least one option.";
    }

    if (!isAgreementChecked) {
      nextFieldErrors.agreement =
        "Please confirm the registration has been signed.";
    }

    if (!marketScope) {
      nextFieldErrors.scope = "Please select one market scope option.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setFormError("Please fill out the required fields before submitting.");
      return;
    }

    setFieldErrors({});

    const toIsoDate = (date: string, endOfDay?: boolean) =>
      date ? `${date}T${endOfDay ? "23:59:59" : "00:00:00"}Z` : "";

    const payload = {
      movingDateRange: {
        earliest: toIsoDate(movingDate.earliest),
        latest: toIsoDate(movingDate.latest, true),
      },
      priceRange: {
        min: minPrice || 0,
        max: maxPrice,
      },
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
      shareConsent,
      scope: marketScope,
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

      console.log(response);

      const data = await response.json().catch(() => null);

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            "We couldn't submit your request right now. Please try again.",
        );
      }

      setIsSuccessModalOpen(true);
      dispatch(resetPreferences());
      setDescription("");
      setIsAgreementChecked(false);
      setShareConsent(false);
      setMarketScope("");
      setAgreementWarning(null);
      if (registrationLink && typeof window !== "undefined") {
        window.open(registrationLink, "_blank", "noopener,noreferrer");
      }
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
                  min={earliestMinDate}
                  onChange={(e) =>
                    dispatch(
                      setMovingDate({
                        earliest: e.target.value,
                        latest: movingDate.latest,
                      }),
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
                  min={latestMinDate}
                  onChange={(e) =>
                    dispatch(
                      setMovingDate({
                        latest: e.target.value,
                        earliest: movingDate.earliest,
                      }),
                    )
                  }
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>
          {fieldErrors.movingDate && (
            <p className="text-sm text-red-600">{fieldErrors.movingDate}</p>
          )}

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
                        min: e.target.value === "" ? 0 : Number(e.target.value),
                        max: priceRange.max,
                      }),
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
                        max: e.target.value === "" ? 0 : Number(e.target.value),
                        min: priceRange.min,
                      }),
                    )
                  }
                  placeholder="Max"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>
          {fieldErrors.priceRange && (
            <p className="text-sm text-red-600">{fieldErrors.priceRange}</p>
          )}

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
                          `${loc.borough} (${loc.neighborhoods.length}, ${loc.neighborhoods})`,
                      )
                      .join(", ")}
              </span>
            </div>
          </div>
          {fieldErrors.locations && (
            <p className="text-sm text-red-600">{fieldErrors.locations}</p>
          )}

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
            {fieldErrors.bedrooms && (
              <p className="text-sm text-red-600 mt-2">
                {fieldErrors.bedrooms}
              </p>
            )}
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
            {fieldErrors.bathrooms && (
              <p className="text-sm text-red-600 mt-2">
                {fieldErrors.bathrooms}
              </p>
            )}
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
              Check to include only owners who accept guarantors
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

          <div className="border-t border-gray-300 pt-4 space-y-3">
            <p className="text-base font-semibold leading-snug text-gray-900">
              How would you like your agent to assist you?
            </p>
            <p className="text-base leading-relaxed text-gray-600">
              Your agent can guide you, schedule tours, communicate with owners
              or listing agents, represent your interests throughout the rental
              process, and improve your chances in a competitive market.
            </p>

            <div className="space-y-3 text-gray-800">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="marketScope"
                  checked={marketScope === "Upcoming"}
                  onChange={() => setMarketScope("Upcoming")}
                  className="mt-1 h-4 w-4 accent-gray-600"
                />
                <span className="space-y-1">
                  <span className="block text-sm leading-snug text-gray-600">
                    Focus Only on Rentals Not Currently Publicly Advertised
                  </span>
                  <span className="block text-sm leading-snug text-gray-600">
                    Your agent can initiate outreach only for rental
                    opportunities that may not be publicly advertised at the
                    time of outreach.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="marketScope"
                  checked={marketScope === "All Market"}
                  onChange={() => setMarketScope("All Market")}
                  className="mt-1 h-4 w-4 accent-gray-600"
                />
                <span className="space-y-1">
                  <span className="block text-sm leading-snug text-gray-800">
                    Full Agent Experience
                  </span>
                  <span className="block text-sm leading-snug text-gray-600">
                    You would like the full-service agent experience across the
                    entire rental market. The agent’s search will include both
                    publicly advertised listings and those not currently
                    publicly advertised that match your request, reducing the
                    chance of missing an opportunity.
                  </span>
                </span>
              </label>
            </div>

            {fieldErrors.scope && (
              <p className="text-sm text-red-600">{fieldErrors.scope}</p>
            )}
          </div>

          {/* Submit */}
          {errorMessage && (
            <p className="text-sm text-red-600 text-right">{errorMessage}</p>
          )}
          {formError && (
            <p className="text-sm text-red-600 text-right">{formError}</p>
          )}
          {/* Agreement text + checkbox */}
          <div className="border-t pt-4 text-gray-600 space-y-3">
            <div className="space-y-3">
              <p className="text-[15px] font-semibold leading-snug text-gray-700">
                Share your search (optional)
              </p>
              <p className="text-[13px] leading-relaxed text-gray-600">
                To receive assistance beyond one agent, you may choose to allow
                your request to be shared with other licensed New York real
                estate agents who could assist in identifying potential rental
                opportunities that may not yet be publicly advertised.
              </p>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareConsent}
                  onChange={(e) => setShareConsent(e.target.checked)}
                  className="h-5 w-5 accent-gray-600"
                />
                <span className="text-[13px] leading-relaxed text-gray-600">
                  By checking this box, I consent to my request being shared
                  with other licensed New York real estate agents and to being
                  contacted by such agents.
                </span>
              </label>
            </div>

            <p className="text-[15px] font-semibold leading-snug text-gray-700">
              Client registration and agency disclosure (required)
            </p>
            <p className="text-[13px] leading-relaxed text-gray-600">
              To allow your agent,{" "}
              <span className="font-bold">{referrerName || "Tuval Mor"}</span>,
              to reach out on your behalf, please sign the{" "}
              <a
                href={registrationLink}
                target="_blank"
                className="text-blue-700 underline hover:text-blue-800"
              >
                Corcoran client registration{" "}
              </a>
              unless you have already done so. It opens in a new tab. Please
              return here after signing. This registration is non-exclusive, the
              broker fee may be negotiated, and no broker fee is due unless you
              choose to move forward with a rental presented by the agent.
            </p>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAgreementChecked}
                onChange={(e) => {
                  if (e.target.checked && !renterPhone) {
                    setAgreementWarning(
                      "Please add your phone number in your profile to continue.",
                    );
                    return;
                  }
                  setAgreementWarning(null);
                  setIsAgreementChecked(e.target.checked);
                }}
                className="h-5 w-5 accent-gray-600"
              />
              <span className="text-[13px] leading-relaxed text-gray-600">
                By checking this box, you confirm you have signed client
                registration and agency disclosure.
              </span>
            </label>
            {agreementWarning && (
              <p className="text-sm text-red-600">{agreementWarning}</p>
            )}
            {fieldErrors.agreement && (
              <p className="text-sm text-red-600">{fieldErrors.agreement}</p>
            )}
          </div>

          {/* Submit button */}
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSubmitting || !isAgreementChecked || !marketScope}
              className="flex items-center gap-2 bg-blue-500 text-white text-sm sm:text-base font-medium rounded-lg px-5 py-3 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Bell size={16} />
              {isSubmitting ? "Submitting..." : "Save Request & Send to Agent"}
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
        redirectPath="/renter/saved-requests"
        buttonLabel="Go to Saved Requests"
      />
    </section>
  );
}
