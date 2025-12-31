export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pos-exterior-researchers-vegetarian.trycloudflare.com/api/v1";

export interface ApiAgentMatch {
  _id?: string;
  id?: string;
  requestId?: string;
  requestName?: string;
  renterId?: string;
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
  status?: string;
  preferences?: string[];
  isActive?: boolean;
  renterInfo?: {
    renterId?: string;
    renterName?: string;
    renterEmail?: string;
    renterPhone?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    profileImage?: string | null;
    registrationType?: string;
    referrer?: string | null;
    referralInfo?: {
      referrer?: {
        fullName?: string;
      } | null;
    } | null;
  };
  createdAt?: string;
}

export interface ApiAgentMatchesResponse {
  success?: boolean;
  message?: string;
  data?: ApiAgentMatch[];
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

export interface NormalizedAgentMatch {
  id: string;
  requestName: string;
  boroughsLabel: string;
  dateLabel: string;
  priceMaxLabel: string;
  bedroomsLabel: string;
  bathroomsLabel: string;
  status: string;
  isActive: boolean;
  preferences: string[];
  renterName?: string;
  renterEmail?: string;
  renterPhone?: string;
  raw: ApiAgentMatch;
}

const formatCurrency = (value?: number) => {
  if (value == null) return "Not specified";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Not specified";

const formatLocations = (locations?: ApiAgentMatch["locations"]) => {
  if (!locations?.length) {
    return "Not specified";
  }

  const boroughs = Array.from(
    new Set(
      locations
        .map((loc) => loc?.borough)
        .filter((loc): loc is string => Boolean(loc))
    )
  );

  return boroughs.length ? boroughs.join(", ") : "Not specified";
};

const formatBedrooms = (bedrooms?: string[]) =>
  bedrooms?.length ? bedrooms.join(", ") : "Not specified";

const formatBathrooms = (bathrooms?: string[]) =>
  bathrooms?.length ? bathrooms.join(", ") : "Not specified";

export const normalizeAgentMatch = (
  req: ApiAgentMatch
): NormalizedAgentMatch => {
  return {
    id: req._id || req.id || req.requestId || Math.random().toString(36).slice(2),
    requestName: req.requestName || req.requestId || "Pre-Market Request",
    boroughsLabel: formatLocations(req.locations),
    dateLabel: formatDate(req.createdAt || req.movingDateRange?.earliest),
    priceMaxLabel: formatCurrency(req.priceRange?.max ?? req.priceRange?.min),
    bedroomsLabel: formatBedrooms(req.bedrooms),
    bathroomsLabel: formatBathrooms(req.bathrooms),
    status: req.status || (req.isActive ? "active" : "inactive"),
    isActive: req.isActive ?? false,
    preferences: req.preferences ?? [],
    renterName: req.renterInfo?.renterName || req.renterInfo?.fullName,
    renterEmail: req.renterInfo?.renterEmail || req.renterInfo?.email,
    renterPhone: req.renterInfo?.renterPhone || req.renterInfo?.phoneNumber,
    raw: req,
  };
};

const CACHE_KEY = "agent-matches-cache";

export const readCachedAgentMatches = (): NormalizedAgentMatch[] => {
  if (typeof window === "undefined") return [];
  const stored = sessionStorage.getItem(CACHE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as NormalizedAgentMatch[];
  } catch {
    return [];
  }
};

export const cacheAgentMatches = (requests: NormalizedAgentMatch[]) => {
  if (typeof window === "undefined" || requests.length === 0) return;
  const existing = readCachedAgentMatches();
  const map = new Map<string, NormalizedAgentMatch>();
  existing.forEach((item) => map.set(item.id, item));
  requests.forEach((item) => map.set(item.id, item));
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(Array.from(map.values())));
};

export const cacheSingleAgentMatch = (request: NormalizedAgentMatch) => {
  cacheAgentMatches([request]);
};
