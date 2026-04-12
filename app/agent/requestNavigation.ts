"use client";

import type { FilterType } from "@/components/modals/FilterModals";

export interface FilterableAgentRequestLike {
  referralAgentId?: string | null;
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
      raw.bedrooms?.map((bedroom) =>
        bedroom === "Studio" ? 0 : parseInt(bedroom, 10),
      ) || [];
    const hasBedroom = filters.bedrooms.some((bedroom) =>
      bedroomValues.includes(bedroom),
    );
    if (!hasBedroom) return false;
  }

  if (filters.bathrooms.length) {
    const bathroomValues =
      raw.bathrooms?.map((bathroom) => parseInt(bathroom, 10)) || [];
    const hasBathroom = filters.bathrooms.some((bathroom) =>
      bathroomValues.includes(bathroom),
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
