export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ApiAgentMatch {
  _id?: string;
  id?: string;
  requestId?: string;
  requestName?: string;
  renterId?: string;
  referralAgentId?: string;
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
  isArchivedForAgent?: boolean;
  archiveReason?: string | null;
  archiveReasonLabel?: string | null;
  archiveSource?: string | null;
  archivedAt?: string | null;
  status?: string;
  representation_type?: "owner_representation" | "renter_representation";
  representationSelectedAt?: string | null;
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
      registrationType?: string;
      referrerId?: string;
      referrerName?: string;
      fullName?: string;
      referredByAdmin?: {
        referredBy?: string;
        referrerName?: string;
        referrerEmail?: string;
      } | null;
      referrerEmail?: string;
      referrerPhoneNumber?: string;
      referralCode?: string;
      referrerType?: string;
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
  scopeLabel: string;
  visibilityLabel: string;
  isPrivateVisibility: boolean;
  isArchivedForAgent?: boolean;
  archiveReason?: string | null;
  archiveReasonLabel?: string | null;
  archiveSource?: string | null;
  archivedAt?: string | null;
  status: string;
  representation_type?: "owner_representation" | "renter_representation";
  representationSelectedAt?: string | null;
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
    ? new Date(date).toLocaleDateString("en-US", {
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

export const normalizeAgentMatch = (
  req: ApiAgentMatch
): NormalizedAgentMatch => {
  const { visibilityLabel, isPrivateVisibility } = formatVisibility(
    req.visibility,
    req.shareConsent
  );

  return {
    id:
      req._id || req.id || req.requestId || Math.random().toString(36).slice(2),
    requestName: req.requestName || req.requestId || "Pre-Market Request",
    boroughsLabel: formatLocations(req.locations),
    dateLabel: formatDate(req.createdAt || req.movingDateRange?.earliest),
    priceMaxLabel: formatCurrency(req.priceRange?.max ?? req.priceRange?.min),
    bedroomsLabel: formatBedrooms(req.bedrooms),
    bathroomsLabel: formatBathrooms(req.bathrooms),
    scopeLabel: formatScope(req.scope),
    visibilityLabel,
    isPrivateVisibility,
    isArchivedForAgent: Boolean(req.isArchivedForAgent),
    archiveReason: req.archiveReason ?? null,
    archiveReasonLabel: req.archiveReasonLabel ?? null,
    archiveSource: req.archiveSource ?? null,
    archivedAt: req.archivedAt ?? null,
    status: req.status || (req.isActive ? "active" : "inactive"),
    representation_type: req.representation_type,
    representationSelectedAt: req.representationSelectedAt ?? null,
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
