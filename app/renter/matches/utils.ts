export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pos-exterior-researchers-vegetarian.trycloudflare.com/api/v1";

export interface ApiMatchedAgent {
  _id?: string;
  userId?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  profileImageUrl?: string | null;
  hasGrantAccess?: boolean;
}

export interface ApiRequestWithAgents {
  _id?: string;
  id?: string;
  requestId?: string;
  requestName?: string;
  movingDateRange?: {
    earliest?: string;
    latest?: string;
  };
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
  unitFeatures?: Record<string, boolean>;
  buildingFeatures?: Record<string, boolean>;
  petPolicy?: Record<string, boolean>;
  guarantorRequired?: Record<string, boolean>;
  preferences?: string[];
  status?: string;
  agentMatches?: {
    totalCount?: number;
    agents?: ApiMatchedAgent[];
  };
}

export interface ApiMatchesResponse {
  success?: boolean;
  message?: string;
  data?: ApiRequestWithAgents[];
  pagination?: {
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    itemsPerPage?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
    nextPage?: number | null;
    prevPage?: number | null;
  };
}

export interface NormalizedMatchRequest {
  id: string;
  requestName: string;
  boroughsLabel: string;
  neighborhoodsLabel: string;
  dateRangeLabel: string;
  priceRangeLabel: string;
  bedroomsLabel: string;
  bathroomsLabel: string;
  status: string;
  agentMatchCount: number;
  matchedAgents: ApiMatchedAgent[];
  raw: ApiRequestWithAgents;
}

const formatCurrencyRange = (min?: number, max?: number) => {
  if (min == null && max == null) return "Not specified";

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  if (min != null && max != null) return `${formatter.format(min)} - ${formatter.format(max)}`;
  if (min != null) return formatter.format(min);
  return formatter.format(max as number);
};

const formatDateRange = (range?: ApiRequestWithAgents["movingDateRange"]) => {
  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

  const earliest = formatDate(range?.earliest);
  const latest = formatDate(range?.latest);

  if (earliest && latest) return `${earliest} - ${latest}`;
  if (earliest) return earliest;
  if (latest) return latest;
  return "Not specified";
};

const formatLocations = (locations?: ApiRequestWithAgents["locations"]) => {
  if (!locations?.length) {
    return {
      boroughsLabel: "Not specified",
      neighborhoodsLabel: "Not specified",
    };
  }

  const boroughs = Array.from(
    new Set(
      locations
        .map((loc) => loc?.borough)
        .filter((loc): loc is string => Boolean(loc))
    )
  );

  const neighborhoods = locations
    .flatMap((loc) => loc?.neighborhoods ?? [])
    .filter((n): n is string => Boolean(n));

  return {
    boroughsLabel: boroughs.length ? boroughs.join(", ") : "Not specified",
    neighborhoodsLabel: neighborhoods.length
      ? neighborhoods.join(", ")
      : "Not specified",
  };
};

const formatBedrooms = (bedrooms?: string[]) =>
  bedrooms?.length ? bedrooms.join(", ") : "Not specified";

const formatBathrooms = (bathrooms?: string[]) =>
  bathrooms?.length ? bathrooms.join(", ") : "Not specified";

export const normalizeRequest = (
  req: ApiRequestWithAgents
): NormalizedMatchRequest => {
  const { boroughsLabel, neighborhoodsLabel } = formatLocations(req.locations);

  return {
    id: req._id || req.id || req.requestId || Math.random().toString(36).slice(2),
    requestName: req.requestName || req.requestId || "Pre-Market Request",
    boroughsLabel,
    neighborhoodsLabel,
    dateRangeLabel: formatDateRange(req.movingDateRange),
    priceRangeLabel: formatCurrencyRange(req.priceRange?.min, req.priceRange?.max),
    bedroomsLabel: formatBedrooms(req.bedrooms),
    bathroomsLabel: formatBathrooms(req.bathrooms),
    status: req.status || "unknown",
    agentMatchCount: req.agentMatches?.totalCount ?? req.agentMatches?.agents?.length ?? 0,
    matchedAgents: req.agentMatches?.agents ?? [],
    raw: req,
  };
};

const CACHE_KEY = "renter-matches-cache";

export const readCachedMatches = (): NormalizedMatchRequest[] => {
  if (typeof window === "undefined") return [];
  const stored = sessionStorage.getItem(CACHE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as NormalizedMatchRequest[];
  } catch {
    return [];
  }
};

export const cacheMatches = (requests: NormalizedMatchRequest[]) => {
  if (typeof window === "undefined" || requests.length === 0) return;

  const existing = readCachedMatches();
  const map = new Map<string, NormalizedMatchRequest>();

  existing.forEach((item) => map.set(item.id, item));
  requests.forEach((item) => map.set(item.id, item));

  sessionStorage.setItem(CACHE_KEY, JSON.stringify(Array.from(map.values())));
};

export const cacheSingleMatch = (request: NormalizedMatchRequest) => {
  cacheMatches([request]);
};
