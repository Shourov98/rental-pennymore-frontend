export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ApiAgentRequest {
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
  shareConsent?: boolean;
  scope?: string;
  visibility?: string;
  status?: string;
  preferences?: string[];
  isActive?: boolean;
  listingStatus?: string;
  grantAccessStatus?: string;
  grantAccessId?: string;
  accessType?: string;
  chargeAmount?: number;
  payment?: {
    amount?: number;
    currency?: string;
    status?: string;
  };
  renterInfo?: {
    renterId?: string;
    renterName?: string;
    renterEmail?: string;
    renterPhone?: string;
    registrationType?: string;
    referrer?: string | null;
  };
  referralInfo?: {
    registrationType?: string;
    referrer?: {
      referrerId?: string;
      referrerName?: string;
      fullName?: string;
      referrerEmail?: string;
      referrerPhoneNumber?: string;
      referralCode?: string;
      referrerType?: string;
    } | null;
  } | null;
  canRequestAccess?: boolean;
}

export interface ApiAgentRequestsResponse {
  success?: boolean;
  message?: string;
  data?: ApiAgentRequest[];
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

export interface NormalizedAgentRequest {
  id: string;
  requestName: string;
  boroughsLabel: string;
  neighborhoodsLabel?: string;
  dateLabel: string;
  priceMaxLabel: string;
  bedroomsLabel: string;
  bathroomsLabel: string;
  scopeLabel: string;
  visibilityLabel: string;
  isPrivateVisibility: boolean;
  status: string;
  preferences: string[];
  renterName?: string;
  renterEmail?: string;
  renterPhone?: string;
  raw: ApiAgentRequest;
  canRequestAccess?: boolean;
}

const formatCurrency = (value?: number) => {
  if (value == null) return "Not specified";
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  return formatter.format(value);
};

const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Not specified";

const formatDateLabel = (
  range?: ApiAgentRequest["movingDateRange"],
  createdAt?: string
) => {
  // Prefer created date if available, else earliest in moving window.
  if (createdAt) return formatDate(createdAt);
  return formatDate(range?.earliest);
};

const formatLocations = (locations?: ApiAgentRequest["locations"]) => {
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
      : undefined,
  };
};

const formatBedrooms = (bedrooms?: string[]) =>
  bedrooms?.length ? bedrooms.join(", ") : "Not specified";

const formatBathrooms = (bathrooms?: string[]) =>
  bathrooms?.length ? bathrooms.join(", ") : "Not specified";

const formatScope = (scope?: string) => {
  const value = scope?.trim();
  return value ? value : "Not specified";
};

const formatVisibility = (
  visibility?: string,
  shareConsent?: boolean
): { visibilityLabel: string; isPrivateVisibility: boolean } => {
  if (visibility && visibility.trim()) {
    const normalized = visibility.trim().toLowerCase();
    const isPrivate = normalized === "private";
    const label =
      normalized === "shared"
        ? "Shared"
        : normalized === "private"
          ? "Private"
          : visibility;
    return { visibilityLabel: label, isPrivateVisibility: isPrivate };
  }

  if (typeof shareConsent === "boolean") {
    return shareConsent
      ? { visibilityLabel: "Shared", isPrivateVisibility: false }
      : { visibilityLabel: "Private", isPrivateVisibility: true };
  }

  return { visibilityLabel: "Not specified", isPrivateVisibility: false };
};

export const normalizeAgentRequest = (
  req: ApiAgentRequest & {
    createdAt?: string;
    renterInfo?: ApiAgentRequest["renterInfo"];
  }
): NormalizedAgentRequest => {
  const { boroughsLabel, neighborhoodsLabel } = formatLocations(req.locations);
  const { visibilityLabel, isPrivateVisibility } = formatVisibility(
    req.visibility,
    req.shareConsent
  );

  return {
    id:
      req._id || req.id || req.requestId || Math.random().toString(36).slice(2),
    requestName: req.requestName || req.requestId || "Pre-Market Request",
    boroughsLabel,
    neighborhoodsLabel,
    dateLabel: formatDateLabel(req.movingDateRange, req.createdAt),
    priceMaxLabel: formatCurrency(req.priceRange?.max ?? req.priceRange?.min),
    bedroomsLabel: formatBedrooms(req.bedrooms),
    bathroomsLabel: formatBathrooms(req.bathrooms),
    scopeLabel: formatScope(req.scope),
    visibilityLabel,
    isPrivateVisibility,
    status: req.status || (req.isActive ? "active" : "inactive"),
    preferences: req.preferences ?? [],
    renterName: req.renterInfo?.renterName,
    renterEmail: req.renterInfo?.renterEmail,
    renterPhone: req.renterInfo?.renterPhone,
    raw: req,
  };
};

const CACHE_KEY = "agent-dashboard-requests";

export const readCachedAgentRequests = (): NormalizedAgentRequest[] => {
  if (typeof window === "undefined") return [];
  const stored = sessionStorage.getItem(CACHE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as NormalizedAgentRequest[];
  } catch {
    return [];
  }
};

export const cacheAgentRequests = (requests: NormalizedAgentRequest[]) => {
  if (typeof window === "undefined" || requests.length === 0) return;

  const existing = readCachedAgentRequests();
  const map = new Map<string, NormalizedAgentRequest>();

  existing.forEach((item) => map.set(item.id, item));
  requests.forEach((item) => map.set(item.id, item));

  sessionStorage.setItem(CACHE_KEY, JSON.stringify(Array.from(map.values())));
};

export const cacheSingleAgentRequest = (request: NormalizedAgentRequest) => {
  cacheAgentRequests([request]);
};
