"use client";

import type { FilterType } from "@/components/modals/FilterModals";

export interface FilterableAgentRequestLike {
  referralAgentId?: string | null;
  referrerId?: string | null;
  referralInfo?: {
    referrer?: {
      id?: string | null;
      referrerId?: string | null;
    } | null;
  } | null;
  renterInfo?: {
    referralInfo?: {
      referrerId?: string | null;
      referredByAdmin?: {
        referredBy?: string | null;
      } | null;
    } | null;
  } | null;
  scope?: string | null;
  priceRange?: {
    min?: number;
    max?: number;
  };
  locations?: {
    borough?: string;
    neighborhoods?: string[];
  }[];
  movingDateRange?: {
    earliest?: string | Date | null;
    latest?: string | Date | null;
  };
  bedrooms?: string[];
  bathrooms?: string[];
  unitFeatures?: Record<string, boolean | undefined>;
  buildingFeatures?: Record<string, boolean | undefined>;
  petPolicy?: Record<string, boolean | undefined>;
  guarantorRequired?: Record<string, boolean | undefined>;
  preferences?: string[];
}

export interface AgentListNavigationState {
  page: number;
  limit: number;
  totalPages: number;
  itemIds: string[];
  itemHrefs?: Record<string, string>;
  filters: FilterType;
  matchSearchFilters?: FilterType | null;
  isMatchResultsMode?: boolean;
  isFilterOpen?: boolean;
  showOwnReferrals: boolean;
  showAllMarketReferrals?: boolean;
}

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
  enabledFeatureGroups: {
    unitFeatures: true,
    buildingFeatures: true,
    guarantorRequired: true,
    petPolicy: true,
    availableFeatures: true,
  },
};

const getBedroomValue = (bedroom: string) =>
  bedroom === "Studio" ? 0 : parseInt(bedroom, 10);

const hasAnyExactValue = (
  requestedValues: number[],
  selectedFilters: number[],
) => {
  const validRequestedValues = requestedValues.filter(Number.isFinite);
  const validSelectedFilters = selectedFilters.filter(Number.isFinite);
  if (!validRequestedValues.length || !validSelectedFilters.length) {
    return false;
  }

  return validRequestedValues.some((value) =>
    validSelectedFilters.includes(value),
  );
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const toDateValue = (value?: string | Date | null) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfSelectedDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const endOfSelectedDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(`${value}T23:59:59`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const everySelectedFlagIsEnabled = (
  source: Record<string, boolean | undefined> | undefined,
  selectedKeys: string[],
) => {
  if (!selectedKeys.length) return true;
  if (!source) return false;

  return selectedKeys.every((key) => source[key] === true);
};

const availableFeatureAliases: Record<string, string[]> = {
  lotsOfStorage: ["Lots of Storage"],
  lotsOfLight: ["Lots of Light"],
  gymInBuilding: ["Gym in Building"],
  largeApartment: ["Large Apartment"],
  openViews: ["Open Views"],
  newRenovation: ["New Renovation", "New Ranovation"],
  openKitchen: ["Open Kitchen"],
  highCeilings: ["High Ceilings"],
  ifWalkUpBelow3rdFloor: [
    "If Walk-Up: Below 3rd Floor",
    "If Walk-Up: Prefer Lower Floors",
  ],
  notGroundFloor: [
    "Not Ground Floor",
    "Avoid Ground Floor",
    "Avoid the Ground Floor",
  ],
};

const everySelectedPreferenceIsPresent = (
  preferences: string[] | undefined,
  selectedKeys: string[],
) => {
  if (!selectedKeys.length) return true;
  if (!preferences?.length) return false;

  const normalizedPreferences = new Set(preferences.map(normalizeText));

  return selectedKeys.every((key) => {
    const aliases = availableFeatureAliases[key] ?? [key];
    return aliases.some((alias) => normalizedPreferences.has(normalizeText(alias)));
  });
};

export const sanitizeFilters = (
  filters?: Partial<FilterType> | null,
): FilterType => ({
  borough: filters?.borough ?? null,
  neighborhoods: Array.isArray(filters?.neighborhoods)
    ? filters.neighborhoods
    : [],
  bedrooms: Array.isArray(filters?.bedrooms) ? filters.bedrooms : [],
  bathrooms: Array.isArray(filters?.bathrooms) ? filters.bathrooms : [],
  maxPrice: typeof filters?.maxPrice === "number" ? filters.maxPrice : null,
  movingDate: {
    earliest:
      typeof filters?.movingDate?.earliest === "string"
        ? filters.movingDate.earliest
        : "",
    latest:
      typeof filters?.movingDate?.latest === "string"
        ? filters.movingDate.latest
        : "",
  },
  unitFeatures: Array.isArray(filters?.unitFeatures)
    ? filters.unitFeatures
    : [],
  buildingFeatures: Array.isArray(filters?.buildingFeatures)
    ? filters.buildingFeatures
    : [],
  petPolicy: Array.isArray(filters?.petPolicy) ? filters.petPolicy : [],
  guarantorRequired: Array.isArray(filters?.guarantorRequired)
    ? filters.guarantorRequired
    : [],
  availableFeatures: Array.isArray(filters?.availableFeatures)
    ? filters.availableFeatures
    : [],
  enabledFeatureGroups: filters?.enabledFeatureGroups
    ? {
        unitFeatures: filters.enabledFeatureGroups.unitFeatures ?? true,
        buildingFeatures: filters.enabledFeatureGroups.buildingFeatures ?? true,
        guarantorRequired:
          filters.enabledFeatureGroups.guarantorRequired ?? true,
        petPolicy: filters.enabledFeatureGroups.petPolicy ?? true,
        availableFeatures: filters.enabledFeatureGroups.availableFeatures ?? true,
      }
    : defaultFilters.enabledFeatureGroups,
});

const bedroomMatchLabels: Record<number, string> = {
  0: "Studio",
  1: "1BR",
  2: "2BR",
  3: "3BR",
  4: "4BR+",
};

const bathroomMatchLabels: Record<number, string> = {
  1: "1",
  2: "2",
  3: "3",
  4: "4+",
};

const defaultFeatureGroups = {
  unitFeatures: true,
  buildingFeatures: true,
  guarantorRequired: true,
  petPolicy: true,
  availableFeatures: true,
};

export const buildMatchSearchPayload = (filters: FilterType) => {
  const enabled = filters.enabledFeatureGroups ?? defaultFeatureGroups;

  return {
    borough: filters.borough,
    neighborhood: filters.neighborhoods[0],
    bedrooms: bedroomMatchLabels[filters.bedrooms[0]],
    bathrooms: bathroomMatchLabels[filters.bathrooms[0]],
    rent: filters.maxPrice,
    movingDateRange: {
      earliest: filters.movingDate.earliest,
      latest: filters.movingDate.latest,
    },
    unitFeatures: {
      laundryInUnit: filters.unitFeatures.includes("laundryInUnit"),
      privateOutdoorSpace: filters.unitFeatures.includes("privateOutdoorSpace"),
      dishwasher: filters.unitFeatures.includes("dishwasher"),
    },
    buildingFeatures: {
      doorman: filters.buildingFeatures.includes("doorman"),
      elevator: filters.buildingFeatures.includes("elevator"),
      laundryInBuilding: filters.buildingFeatures.includes("laundryInBuilding"),
    },
    petPolicy: {
      catsAllowed: filters.petPolicy.includes("catsAllowed"),
      dogsAllowed: filters.petPolicy.includes("dogsAllowed"),
    },
    guarantorPolicy: {
      personalGuarantor: filters.guarantorRequired.includes("personalGuarantor"),
      thirdPartyGuarantor: filters.guarantorRequired.includes("thirdPartyGuarantor"),
    },
    availableFeatures: Object.fromEntries(
      filters.availableFeatures.map((feature) => [feature, true]),
    ),
    toggles: {
      unitFeatures: enabled.unitFeatures,
      buildingFeatures: enabled.buildingFeatures,
      petPolicy: enabled.petPolicy,
      guarantorsPolicy: enabled.guarantorRequired,
      priorityBonuses: enabled.availableFeatures,
    },
  };
};

export const matchesAgentFilters = (
  raw: FilterableAgentRequestLike | undefined,
  filters: FilterType,
  showOwnReferrals: boolean,
  currentAgentId?: string | null,
  showAllMarketReferrals: boolean = false,
) => {
  if (!raw) return false;

  if (showAllMarketReferrals) {
    // On the agent dashboard (renter requests): keep Upcoming (M) requests
    // where the current agent is the registered agent for the renter. The
    // registered-agent identity is read from any of the referrer-style
    // fields populated by the backend for this request.
    if (normalizeText(raw.scope ?? "") !== "upcoming (m)") return false;
    if (!isCurrentAgentRegisteredForRequest(raw, currentAgentId)) return false;
  }

  if (filters.borough) {
    const hasBorough = raw.locations?.some(
      (loc) =>
        normalizeText(loc?.borough ?? "") ===
        normalizeText(filters.borough ?? ""),
    );
    if (!hasBorough) return false;
  }

  if (filters.neighborhoods.length) {
    const neighborhoods = raw.locations
      ?.flatMap((loc) => loc?.neighborhoods || [])
      .filter(Boolean) as string[];
    const normalizedNeighborhoods = neighborhoods.map(normalizeText);
    const hasNeighborhood = filters.neighborhoods.some((neighborhood) =>
      normalizedNeighborhoods.includes(normalizeText(neighborhood)),
    );
    if (!hasNeighborhood) return false;
  }

  if (filters.bedrooms.length) {
    const bedroomValues =
      raw.bedrooms?.map((bedroom) => getBedroomValue(bedroom)) || [];
    const hasBedroom = hasAnyExactValue(bedroomValues, filters.bedrooms);
    if (!hasBedroom) return false;
  }

  if (filters.bathrooms.length) {
    const bathroomValues =
      raw.bathrooms?.map((bathroom) => parseInt(bathroom, 10)) || [];
    const hasBathroom = hasAnyExactValue(bathroomValues, filters.bathrooms);
    if (!hasBathroom) return false;
  }

  if (filters.maxPrice != null) {
    const maxPrice = raw.priceRange?.max ?? raw.priceRange?.min;
    if (maxPrice == null || maxPrice < filters.maxPrice) return false;
  }

  const selectedEarliest = startOfSelectedDate(filters.movingDate.earliest);
  const selectedLatest = endOfSelectedDate(filters.movingDate.latest);
  const requestEarliest = toDateValue(raw.movingDateRange?.earliest);
  const requestLatest = toDateValue(raw.movingDateRange?.latest);

  if (selectedEarliest || selectedLatest) {
    if (!requestEarliest && !requestLatest) return false;
    if (selectedEarliest && requestLatest && requestLatest < selectedEarliest) {
      return false;
    }
    if (selectedLatest && requestEarliest && requestEarliest > selectedLatest) {
      return false;
    }
  }

  if (
    !everySelectedFlagIsEnabled(raw.unitFeatures, filters.unitFeatures) ||
    !everySelectedFlagIsEnabled(
      raw.buildingFeatures,
      filters.buildingFeatures,
    ) ||
    !everySelectedFlagIsEnabled(raw.petPolicy, filters.petPolicy) ||
    !everySelectedFlagIsEnabled(
      raw.guarantorRequired,
      filters.guarantorRequired,
    ) ||
    !everySelectedPreferenceIsPresent(
      raw.preferences,
      filters.availableFeatures,
    )
  ) {
    return false;
  }

  if (showOwnReferrals) {
    if (!currentAgentId) return false;
    if (!raw.referralAgentId || raw.referralAgentId !== currentAgentId) {
      return false;
    }
  }

  return true;
};

export const readStoredAgentListState = (
  storageKey: string,
): AgentListNavigationState | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(storageKey);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as Partial<AgentListNavigationState>;
    const page =
      typeof parsed.page === "number" && parsed.page > 0 ? parsed.page : 1;
    const limit =
      typeof parsed.limit === "number" && parsed.limit > 0 ? parsed.limit : 10;
    const totalPages =
      typeof parsed.totalPages === "number" && parsed.totalPages > 0
        ? parsed.totalPages
        : 1;

    return {
      page,
      limit,
      totalPages,
      itemIds: Array.isArray(parsed.itemIds)
        ? parsed.itemIds.filter(
            (itemId): itemId is string => typeof itemId === "string",
          )
        : [],
      itemHrefs:
        parsed.itemHrefs && typeof parsed.itemHrefs === "object"
          ? Object.fromEntries(
              Object.entries(parsed.itemHrefs).filter(
                (entry): entry is [string, string] =>
                  typeof entry[0] === "string" && typeof entry[1] === "string",
              ),
            )
          : undefined,
      filters: sanitizeFilters(parsed.filters),
      matchSearchFilters: parsed.matchSearchFilters
        ? sanitizeFilters(parsed.matchSearchFilters)
        : null,
      isMatchResultsMode: Boolean(parsed.isMatchResultsMode),
      isFilterOpen: Boolean(parsed.isFilterOpen),
      showOwnReferrals: Boolean(parsed.showOwnReferrals),
      showAllMarketReferrals: Boolean(parsed.showAllMarketReferrals),
    };
  } catch {
    return null;
  }
};

export const writeStoredAgentListState = (
  storageKey: string,
  state: AgentListNavigationState,
) => {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(
    storageKey,
    JSON.stringify({
      ...state,
      filters: sanitizeFilters(state.filters),
      matchSearchFilters: state.matchSearchFilters
        ? sanitizeFilters(state.matchSearchFilters)
        : null,
    }),
  );
};

export const getEmptyFilters = () => defaultFilters;

export const isCurrentAgentRegisteredForRequest = (
  raw: FilterableAgentRequestLike | undefined,
  currentAgentId?: string | null,
) => {
  if (!raw || !currentAgentId) return false;

  const registeredAgentIds = [
    raw.referralAgentId,
    raw.referrerId,
    raw.referralInfo?.referrer?.id,
    raw.referralInfo?.referrer?.referrerId,
    raw.renterInfo?.referralInfo?.referrerId,
    raw.renterInfo?.referralInfo?.referredByAdmin?.referredBy,
  ]
    .map((value) => (value ? String(value) : ""))
    .filter(Boolean);

  return registeredAgentIds.includes(String(currentAgentId));
};

export const getAgentRequestHref = (
  raw: FilterableAgentRequestLike | undefined,
  requestId: string,
  currentAgentId?: string | null,
) =>
  isCurrentAgentRegisteredForRequest(raw, currentAgentId)
    ? `/agent/dashboard/${requestId}?from=archive`
    : `/agent/matches/${requestId}?from=archive`;
