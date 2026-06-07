"use client";

import { Calendar, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import boroughNeighborhoodsData from "../../data/neighborhoods.manhattan-brooklyn";

export interface FilterType {
  borough: string | null;
  neighborhoods: string[];
  bedrooms: number[];
  bathrooms: number[];
  maxPrice: number | null;
  movingDate: {
    earliest: string;
    latest: string;
  };
  unitFeatures: string[];
  buildingFeatures: string[];
  petPolicy: string[];
  guarantorRequired: string[];
  availableFeatures: string[];
  enabledFeatureGroups?: Record<FeatureGroupKey, boolean>;
}

type FilterModalVariant = "default" | "matchRequests";
type FeatureGroupKey =
  | "unitFeatures"
  | "buildingFeatures"
  | "guarantorRequired"
  | "petPolicy"
  | "availableFeatures";

interface FeatureOption {
  label: string;
  value: string;
}

const defaultFeatureGroups: Record<FeatureGroupKey, boolean> = {
  unitFeatures: true,
  buildingFeatures: true,
  guarantorRequired: true,
  petPolicy: true,
  availableFeatures: true,
};

const defaultFilters: FilterType = {
  borough: null,
  neighborhoods: [],
  bedrooms: [],
  bathrooms: [],
  maxPrice: null,
  movingDate: {
    earliest: "",
    latest: "",
  },
  unitFeatures: [],
  buildingFeatures: [],
  petPolicy: [],
  guarantorRequired: [],
  availableFeatures: [],
  enabledFeatureGroups: defaultFeatureGroups,
};

const unitFeatureOptions: FeatureOption[] = [
  { label: "Laundry in unit", value: "laundryInUnit" },
  { label: "Private outdoor space", value: "privateOutdoorSpace" },
  { label: "Dishwasher", value: "dishwasher" },
];

const buildingFeatureOptions: FeatureOption[] = [
  { label: "Doorman", value: "doorman" },
  { label: "Elevator", value: "elevator" },
  { label: "Laundry in Building", value: "laundryInBuilding" },
];

const guarantorOptions: FeatureOption[] = [
  { label: "Personal guarantor", value: "personalGuarantor" },
  { label: "Third party guarantor", value: "thirdPartyGuarantor" },
];

const petPolicyOptions: FeatureOption[] = [
  { label: "Cats allowed", value: "catsAllowed" },
  { label: "Dogs allowed", value: "dogsAllowed" },
];

const availableFeatureOptions: FeatureOption[] = [
  { label: "Lots of Storage", value: "lotsOfStorage" },
  { label: "Lots of Light", value: "lotsOfLight" },
  { label: "Gym in Building", value: "gymInBuilding" },
  { label: "Large Apartment", value: "largeApartment" },
  { label: "Open Views", value: "openViews" },
  { label: "New Renovation", value: "newRenovation" },
  { label: "Open Kitchen", value: "openKitchen" },
  { label: "High Ceilings", value: "highCeilings" },
  {
    label: "If Walk-Up: Below 3rd Floor",
    value: "ifWalkUpBelow3rdFloor",
  },
  { label: "Not Ground Floor", value: "notGroundFloor" },
];

const uniqueLabels = (labels: string[]) => Array.from(new Set(labels));

const boroughNeighborhoods: Record<string, string[]> = {
  Manhattan: uniqueLabels(
    boroughNeighborhoodsData.Manhattan.sections.flatMap((section) =>
      section.items.map((item) => item.label),
    ),
  ),
  Brooklyn: uniqueLabels(
    boroughNeighborhoodsData.Brooklyn.sections.flatMap((section) =>
      section.items.map((item) => item.label),
    ),
  ),
};

const resolveFilters = (filters?: Partial<FilterType>): FilterType => ({
  borough: filters?.borough ?? defaultFilters.borough,
  neighborhoods: Array.isArray(filters?.neighborhoods)
    ? filters.neighborhoods
    : defaultFilters.neighborhoods,
  bedrooms: Array.isArray(filters?.bedrooms)
    ? filters.bedrooms
    : defaultFilters.bedrooms,
  bathrooms: Array.isArray(filters?.bathrooms)
    ? filters.bathrooms
    : defaultFilters.bathrooms,
  maxPrice:
    typeof filters?.maxPrice === "number"
      ? filters.maxPrice
      : defaultFilters.maxPrice,
  movingDate: {
    earliest: filters?.movingDate?.earliest ?? "",
    latest: filters?.movingDate?.latest ?? "",
  },
  unitFeatures: Array.isArray(filters?.unitFeatures)
    ? filters.unitFeatures
    : defaultFilters.unitFeatures,
  buildingFeatures: Array.isArray(filters?.buildingFeatures)
    ? filters.buildingFeatures
    : defaultFilters.buildingFeatures,
  petPolicy: Array.isArray(filters?.petPolicy)
    ? filters.petPolicy
    : defaultFilters.petPolicy,
  guarantorRequired: Array.isArray(filters?.guarantorRequired)
    ? filters.guarantorRequired
    : defaultFilters.guarantorRequired,
  availableFeatures: Array.isArray(filters?.availableFeatures)
    ? filters.availableFeatures
    : defaultFilters.availableFeatures,
  enabledFeatureGroups: filters?.enabledFeatureGroups ?? defaultFeatureGroups,
});

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
  initialFilters,
  resultCount,
  variant = "default",
  isApplying = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterType) => void;
  initialFilters?: FilterType;
  resultCount?: number;
  variant?: FilterModalVariant;
  isApplying?: boolean;
}) {
  const isMatchRequestsVariant = variant === "matchRequests";
  const isMatchRequestsApplying = isMatchRequestsVariant && isApplying;
  const resolvedInitialFilters = resolveFilters(initialFilters);
  const [borough, setBorough] = useState<string | null>(
    resolvedInitialFilters.borough,
  );
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>(
    resolvedInitialFilters.neighborhoods,
  );
  const [bedrooms, setBedrooms] = useState<number[]>(
    resolvedInitialFilters.bedrooms,
  );
  const [bathrooms, setBathrooms] = useState<number[]>(
    resolvedInitialFilters.bathrooms,
  );
  const [maxPrice, setMaxPrice] = useState<number | null>(
    resolvedInitialFilters.maxPrice,
  );
  const [movingDate, setMovingDate] = useState(resolvedInitialFilters.movingDate);
  const [unitFeatures, setUnitFeatures] = useState<string[]>(
    resolvedInitialFilters.unitFeatures,
  );
  const [buildingFeatures, setBuildingFeatures] = useState<string[]>(
    resolvedInitialFilters.buildingFeatures,
  );
  const [petPolicy, setPetPolicy] = useState<string[]>(
    resolvedInitialFilters.petPolicy,
  );
  const [guarantorRequired, setGuarantorRequired] = useState<string[]>(
    resolvedInitialFilters.guarantorRequired,
  );
  const [availableFeatures, setAvailableFeatures] = useState<string[]>(
    resolvedInitialFilters.availableFeatures,
  );
  const [enabledFeatureGroups, setEnabledFeatureGroups] =
    useState(resolvedInitialFilters.enabledFeatureGroups ?? defaultFeatureGroups);
  const [showNeighborhoodPicker, setShowNeighborhoodPicker] = useState(false);

  const syncLocalFilters = (nextFilters: FilterType) => {
    setBorough(nextFilters.borough);
    setSelectedNeighborhoods(nextFilters.neighborhoods);
    setBedrooms(nextFilters.bedrooms);
    setBathrooms(nextFilters.bathrooms);
    setMaxPrice(nextFilters.maxPrice);
    setMovingDate(nextFilters.movingDate);
    setUnitFeatures(nextFilters.unitFeatures);
    setBuildingFeatures(nextFilters.buildingFeatures);
    setPetPolicy(nextFilters.petPolicy);
    setGuarantorRequired(nextFilters.guarantorRequired);
    setAvailableFeatures(nextFilters.availableFeatures);
    setEnabledFeatureGroups(nextFilters.enabledFeatureGroups ?? defaultFeatureGroups);
    setShowNeighborhoodPicker(false);
  };

  const neighborhoods = useMemo(
    () => (borough ? boroughNeighborhoods[borough] : []),
    [borough],
  );

  const toggleSelection = (
    value: number,
    setter: React.Dispatch<React.SetStateAction<number[]>>,
    state: number[],
  ) => {
    setter(
      state.includes(value)
        ? state.filter((item) => item !== value)
        : [...state, value],
    );
  };

  const toggleStringSelection = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    state: string[],
  ) => {
    setter(
      state.includes(value)
        ? state.filter((item) => item !== value)
        : [...state, value],
    );
  };

  const currentFilters = (): FilterType => ({
    borough,
    neighborhoods: selectedNeighborhoods,
    bedrooms,
    bathrooms,
    maxPrice,
    movingDate,
    unitFeatures,
    buildingFeatures,
    petPolicy,
    guarantorRequired,
    availableFeatures,
    enabledFeatureGroups,
  });

  const resetAll = () => {
    const next = resolveFilters(defaultFilters);
    syncLocalFilters(next);
    onApply(next);
  };

  const applyFilters = () => {
    onApply(currentFilters());
    if (!isMatchRequestsVariant) onClose();
  };

  const clearFeatureGroup = (group: FeatureGroupKey) => {
    if (group === "unitFeatures") setUnitFeatures([]);
    if (group === "buildingFeatures") setBuildingFeatures([]);
    if (group === "guarantorRequired") setGuarantorRequired([]);
    if (group === "petPolicy") setPetPolicy([]);
    if (group === "availableFeatures") setAvailableFeatures([]);
  };

  const toggleFeatureGroup = (group: FeatureGroupKey) => {
    setEnabledFeatureGroups((prev) => {
      const nextValue = !prev[group];
      if (!nextValue) clearFeatureGroup(group);
      return { ...prev, [group]: nextValue };
    });
  };

  const renderFeatureGroupHeader = (label: string, group: FeatureGroupKey) => (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={enabledFeatureGroups[group]}
        onClick={() => toggleFeatureGroup(group)}
        className={`relative inline-flex h-3.5 w-6 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 ease-out hover:scale-105 ${
          enabledFeatureGroups[group] ? "bg-blue-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full bg-white transition ${
            enabledFeatureGroups[group] ? "translate-x-3" : "translate-x-0.5"
          }`}
        />
      </button>
      <p className="text-xs font-semibold text-gray-700">{label}</p>
    </div>
  );

  const renderFeatureCheckboxes = (
    group: FeatureGroupKey,
    options: FeatureOption[],
    selected: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    const isEnabled = enabledFeatureGroups[group];

    return (
      <div className="mt-2 space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-start gap-2 text-xs leading-4 ${
              isEnabled ? "text-gray-700" : "text-gray-400"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              disabled={!isEnabled}
              onChange={() =>
                toggleStringSelection(option.value, setter, selected)
              }
              className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    );
  };

  const renderMatchRequestsFilters = () => (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold text-gray-700">Borough</p>
          <div className="grid grid-cols-2 gap-2">
            {["Manhattan", "Brooklyn"].map((b) => (
              <button
                type="button"
                key={b}
                onClick={() => {
                  setBorough(borough === b ? null : b);
                  setSelectedNeighborhoods([]);
                  setShowNeighborhoodPicker(false);
                }}
                className={`h-8 cursor-pointer rounded-2xl border px-2 text-xs font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm ${
                  borough === b
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {borough && (
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-gray-700">
                Neighborhood
              </p>
              <button
                type="button"
                onClick={() => setShowNeighborhoodPicker((prev) => !prev)}
                className="cursor-pointer rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-sm"
              >
                See All Neighborhoods
              </button>
            </div>

            {selectedNeighborhoods[0] ? (
              <div className="mb-2 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                {selectedNeighborhoods[0]}
                <button
                  type="button"
                  onClick={() => setSelectedNeighborhoods([])}
                  aria-label="Clear selected neighborhood"
                  className="text-blue-500"
                >
                  x
                </button>
              </div>
            ) : null}

            {showNeighborhoodPicker ? (
              <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-2">
                {neighborhoods.map((neighborhood) => (
                  <button
                    type="button"
                    key={neighborhood}
                    onClick={() => {
                      setSelectedNeighborhoods([neighborhood]);
                      setShowNeighborhoodPicker(false);
                    }}
                    className={`block w-full rounded-md border p-2 text-left text-xs transition ${
                      selectedNeighborhoods.includes(neighborhood)
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-100 bg-white text-gray-700 hover:border-gray-200"
                    }`}
                  >
                    {neighborhood}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-semibold text-gray-700">Bedrooms</p>
          <div className="grid grid-cols-3 gap-2">
            {["Studio", "1BR", "2BR", "3BR", "4BR+"].map((label) => {
              const value = label === "Studio" ? 0 : parseInt(label, 10);
              return (
                <button
                  type="button"
                  key={label}
                  onClick={() => setBedrooms([value])}
                  className={`h-8 cursor-pointer rounded-lg border text-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm ${
                    bedrooms.includes(value)
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-gray-700">Bathrooms</p>
          <div className="grid grid-cols-4 gap-2">
            {["1", "2", "3", "4+"].map((label) => {
              const value = parseInt(label, 10);
              return (
                <button
                  type="button"
                  key={label}
                  onClick={() => setBathrooms([value])}
                  className={`h-8 cursor-pointer rounded-lg border text-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm ${
                    bathrooms.includes(value)
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-gray-700">Rent</p>
          <div className="flex h-9 items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3">
            <span className="text-sm font-semibold text-blue-600">$</span>
            <input
              type="number"
              min={0}
              step={100}
              value={maxPrice ?? ""}
              onChange={(event) => {
                const value =
                  event.target.value === "" ? null : Number(event.target.value);
                setMaxPrice(value);
              }}
              placeholder="Enter amount"
              className="min-w-0 flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-gray-700">
            Moving Date
          </p>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-[10px] font-medium text-gray-500">
                Earliest
              </span>
              <div
                title="Type a date manually or use the date picker"
                className="flex h-9 cursor-text items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2 transition-colors duration-200 hover:border-blue-300 hover:bg-blue-50/50 focus-within:border-blue-400 focus-within:bg-white"
              >
                <Calendar className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                <input
                  type="date"
                  value={movingDate.earliest}
                  onChange={(event) =>
                    setMovingDate((prev) => ({
                      ...prev,
                      earliest: event.target.value,
                    }))
                  }
                  className="min-w-0 flex-1 cursor-text bg-transparent text-[11px] text-gray-700 outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-medium text-gray-500">
                Latest
              </span>
              <div
                title="Type a date manually or use the date picker"
                className="flex h-9 cursor-text items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2 transition-colors duration-200 hover:border-blue-300 hover:bg-blue-50/50 focus-within:border-blue-400 focus-within:bg-white"
              >
                <Calendar className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                <input
                  type="date"
                  value={movingDate.latest}
                  onChange={(event) =>
                    setMovingDate((prev) => ({
                      ...prev,
                      latest: event.target.value,
                    }))
                  }
                  className="min-w-0 flex-1 cursor-text bg-transparent text-[11px] text-gray-700 outline-none"
                />
              </div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            {renderFeatureGroupHeader("Unit Features", "unitFeatures")}
            {renderFeatureCheckboxes(
              "unitFeatures",
              unitFeatureOptions,
              unitFeatures,
              setUnitFeatures,
            )}
          </div>

          <div>
            {renderFeatureGroupHeader("Building Features", "buildingFeatures")}
            {renderFeatureCheckboxes(
              "buildingFeatures",
              buildingFeatureOptions,
              buildingFeatures,
              setBuildingFeatures,
            )}
          </div>

          <div>
            {renderFeatureGroupHeader(
              "Guarantors Policy",
              "guarantorRequired",
            )}
            {renderFeatureCheckboxes(
              "guarantorRequired",
              guarantorOptions,
              guarantorRequired,
              setGuarantorRequired,
            )}
          </div>

          <div>
            {renderFeatureGroupHeader("Pet Policy", "petPolicy")}
            {renderFeatureCheckboxes(
              "petPolicy",
              petPolicyOptions,
              petPolicy,
              setPetPolicy,
            )}
          </div>
        </div>

        <div>
          {renderFeatureGroupHeader(
            "Please check available features",
            "availableFeatures",
          )}
          <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-2">
            {availableFeatureOptions.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-2 text-xs leading-4 ${
                  enabledFeatureGroups.availableFeatures
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                <input
                  type="checkbox"
                  checked={availableFeatures.includes(option.value)}
                  disabled={!enabledFeatureGroups.availableFeatures}
                  onChange={() =>
                    toggleStringSelection(
                      option.value,
                      setAvailableFeatures,
                      availableFeatures,
                    )
                  }
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDefaultFilters = () => (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-sm font-medium">Borough</p>
          <div className="grid grid-cols-2 gap-2">
            {["Manhattan", "Brooklyn"].map((b) => (
              <button
                type="button"
                key={b}
                onClick={() => {
                  setBorough(b);
                  setSelectedNeighborhoods([]);
                }}
                className={`rounded-full border py-2 text-sm font-medium ${
                  borough === b
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 bg-gray-50 text-gray-700"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {borough && (
          <div>
            <p className="mb-2 text-sm font-medium">Neighborhood</p>

            <div className="mb-3 flex max-h-20 flex-wrap gap-2 overflow-y-auto">
              {selectedNeighborhoods.map((neighborhood) => (
                <span
                  key={neighborhood}
                  className="flex items-center gap-1 rounded-full border border-gray-300 bg-blue-100 px-3 py-1 text-xs text-blue-800"
                >
                  {neighborhood}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedNeighborhoods(
                        selectedNeighborhoods.filter(
                          (item) => item !== neighborhood,
                        ),
                      )
                    }
                  >
                    x
                  </button>
                </span>
              ))}
            </div>

            <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-gray-300 p-2">
              {neighborhoods.map((neighborhood) => (
                <button
                  type="button"
                  key={neighborhood}
                  onClick={() =>
                    toggleStringSelection(
                      neighborhood,
                      setSelectedNeighborhoods,
                      selectedNeighborhoods,
                    )
                  }
                  className={`block w-full rounded-md border p-2 text-left text-sm ${
                    selectedNeighborhoods.includes(neighborhood)
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 bg-gray-50 text-gray-700"
                  }`}
                >
                  {neighborhood}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-medium">Bedrooms</p>
          <div className="grid grid-cols-3 gap-2">
            {["Studio", "1BR", "2BR", "3BR", "4BR+"].map((label) => {
              const value = label === "Studio" ? 0 : parseInt(label, 10);
              return (
                <button
                  type="button"
                  key={label}
                  onClick={() => toggleSelection(value, setBedrooms, bedrooms)}
                  className={`rounded-lg border py-2 text-sm ${
                    bedrooms.includes(value)
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 bg-gray-50 text-gray-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Bathrooms</p>
          <div className="grid grid-cols-4 gap-2">
            {["1", "2", "3", "4+"].map((label) => {
              const value = parseInt(label, 10);
              return (
                <button
                  type="button"
                  key={label}
                  onClick={() => toggleSelection(value, setBathrooms, bathrooms)}
                  className={`rounded-lg border py-2 text-sm ${
                    bathrooms.includes(value)
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 bg-gray-50 text-gray-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Rent</p>

          <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2">
            <span className="font-medium text-blue-600">$</span>
            <input
              type="number"
              min={0}
              step={100}
              value={maxPrice ?? ""}
              onChange={(event) => {
                const value =
                  event.target.value === "" ? null : Number(event.target.value);
                setMaxPrice(value);
              }}
              placeholder="Enter amount"
              className="w-full bg-transparent text-gray-700 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30 text-black"
      onClick={() => {
        if (!isMatchRequestsApplying) onClose();
      }}
    >
      <div
        className={`relative flex h-full max-w-[calc(100vw-24px)] animate-slideIn flex-col bg-white shadow-xl ${
          isMatchRequestsVariant ? "w-[350px]" : "w-[85%] sm:w-[350px]"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`flex shrink-0 items-center justify-between border-b border-gray-200 ${
            isMatchRequestsVariant ? "px-4 py-4" : "p-5"
          }`}
        >
          <h2
            className={`font-semibold text-gray-900 ${
              isMatchRequestsVariant ? "text-sm" : "text-lg"
            }`}
          >
            {isMatchRequestsVariant ? "Match Requests" : "Filter"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isMatchRequestsApplying}
            aria-label="Close filters"
            className="cursor-pointer rounded-full p-1 text-gray-600 transition-all duration-200 ease-out hover:rotate-90 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:rotate-0 disabled:hover:bg-transparent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <fieldset
            disabled={isMatchRequestsApplying}
            aria-hidden={isMatchRequestsApplying}
            className={`m-0 flex min-h-0 min-w-0 flex-1 flex-col border-0 p-0 transition-opacity duration-200 ${
              isMatchRequestsApplying
                ? "pointer-events-none select-none opacity-45"
                : ""
            }`}
          >
            {isMatchRequestsVariant
              ? renderMatchRequestsFilters()
              : renderDefaultFilters()}

            <div
              className={`shrink-0 border-t border-gray-200 bg-white ${
                isMatchRequestsVariant ? "px-4 py-4" : "p-5"
              }`}
            >
              {typeof resultCount === "number" && (
                <div className="mb-3 text-xs text-gray-500">
                  Showing {resultCount} request{resultCount === 1 ? "" : "s"}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetAll}
                  className="flex-1 cursor-pointer rounded-full border border-gray-200 bg-white py-2 text-sm font-medium text-gray-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-sm disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-white disabled:hover:shadow-none"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="flex-1 cursor-pointer rounded-full bg-blue-600 py-2 text-sm font-medium text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-sm disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-blue-600 disabled:hover:shadow-none"
                >
                  {isMatchRequestsVariant ? "Match" : "Apply"}
                </button>
              </div>
            </div>
          </fieldset>

          {isMatchRequestsApplying ? (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/50"
              aria-live="polite"
              aria-label="Matching requests"
            >
              <Spinner className="size-8 text-blue-600" />
            </div>
          ) : null}
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
