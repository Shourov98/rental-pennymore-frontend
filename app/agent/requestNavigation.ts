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
  priceRange?: {
    min?: number;
    max?: number;
  };
  locations?: {
    borough?: string;
    neighborhoods?: string[];
  }[];
  bedrooms?: string[];
  bathrooms?: string[];
}

export interface AgentListNavigationState {
  page: number;
  limit: number;
  totalPages: number;
  itemIds: string[];
  itemHrefs?: Record<string, string>;
  filters: FilterType;
  showOwnReferrals: boolean;
}

const defaultFilters: FilterType = {
  borough: null,
  neighborhoods: [],
  bedrooms: [],
  bathrooms: [],
  maxPrice: null,
};

const getBedroomValue = (bedroom: string) =>
  bedroom === "Studio" ? 0 : parseInt(bedroom, 10);

const hasValueAtOrBelowThreshold = (
  requestedValues: number[],
  selectedFilters: number[],
) => {
  const validRequestedValues = requestedValues.filter(Number.isFinite);
  const validSelectedFilters = selectedFilters.filter(Number.isFinite);
  if (!validRequestedValues.length || !validSelectedFilters.length) {
    return false;
  }

  const threshold = Math.max(...validSelectedFilters);
  return validRequestedValues.some((value) => value <= threshold);
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
});

export const matchesAgentFilters = (
  raw: FilterableAgentRequestLike | undefined,
  filters: FilterType,
  showOwnReferrals: boolean,
  currentAgentId?: string | null,
) => {
  if (!raw) return false;

  if (filters.borough) {
    const hasBorough = raw.locations?.some(
      (loc) => loc?.borough === filters.borough,
    );
    if (!hasBorough) return false;
  }

  if (filters.neighborhoods.length) {
    const neighborhoods = raw.locations
      ?.flatMap((loc) => loc?.neighborhoods || [])
      .filter(Boolean) as string[];
    const hasNeighborhood = filters.neighborhoods.some((neighborhood) =>
      neighborhoods.includes(neighborhood),
    );
    if (!hasNeighborhood) return false;
  }

  if (filters.bedrooms.length) {
    const bedroomValues =
      raw.bedrooms?.map((bedroom) => getBedroomValue(bedroom)) || [];
    const hasBedroom = hasValueAtOrBelowThreshold(
      bedroomValues,
      filters.bedrooms,
    );
    if (!hasBedroom) return false;
  }

  if (filters.bathrooms.length) {
    const bathroomValues =
      raw.bathrooms?.map((bathroom) => parseInt(bathroom, 10)) || [];
    const hasBathroom = hasValueAtOrBelowThreshold(
      bathroomValues,
      filters.bathrooms,
    );
    if (!hasBathroom) return false;
  }

  if (filters.maxPrice != null) {
    const maxPrice = raw.priceRange?.max ?? raw.priceRange?.min;
    if (maxPrice != null && maxPrice < filters.maxPrice) return false;
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
      showOwnReferrals: Boolean(parsed.showOwnReferrals),
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
