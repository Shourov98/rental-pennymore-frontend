"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Lock,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { CenteredPageSpinner } from "@/components/ui/centered-page-spinner";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchAgentProfile } from "@/store/slices/agentProfileSlice";
import ArchiveRequestDialog, {
  type ArchiveReason,
} from "@/components/agent/ArchiveRequestDialog";
import RequestUpdateDialog from "@/components/agent/RequestUpdateDialog";
import UnmatchRequestDialog from "@/components/agent/UnmatchRequestDialog";
import FilterModal, { type FilterType } from "@/components/modals/FilterModals";
import {
  API_BASE_URL,
  ApiAgentRequest,
  ApiAgentRequestsResponse,
  NormalizedAgentRequest,
  cacheAgentRequests,
  cacheSingleAgentRequest,
  normalizeAgentRequest,
} from "./utils";
import {
  buildMatchSearchPayload,
  getEmptyFilters,
  matchesAgentFilters,
  sanitizeFilters,
  writeStoredAgentListState,
} from "../requestNavigation";

const FILTERS_STORAGE_KEY = "agent-dashboard-filters";
const LIST_STATE_STORAGE_KEY = "agent-dashboard-list-state";
const defaultFilters: FilterType = getEmptyFilters();
const NAVIGATION_STORAGE_KEY = "agent-dashboard-navigation";
const MATCH_DEMO_STORAGE_KEY = "beforelisted-match-demo";

type QuickSelectThreshold = "none" | "one" | "two" | "three" | "four" | "five";
type RepresentationType = "owner_representation" | "renter_representation";
type ConfirmScopeType = "upcoming" | "all-market" | "mixed" | "request";

const OPPORTUNITY_DETAILS_MAX_LENGTH = 350;
const RISKY_OPPORTUNITY_DETAIL_PHRASES = [
  "I have a listing",
  "I have",
  "exclusive",
  "my owner",
  "my landlord",
  "my building",
  "private listing",
  "only through me",
  "off-market listing",
  "guaranteed",
  "no one else has access",
];
const OPPORTUNITY_DETAILS_RISKY_WORDING_MESSAGE =
  "Please revise this wording to use neutral, factual language. The message should not suggest that you represent the owner unless that has been properly selected and disclosed.";

const opportunityDetailsHelperText: Record<RepresentationType, string> = {
  renter_representation:
    "Included in the email to the renter and visible to the registered agent. Kindly use neutral, factual details only (apartment features, address, cross streets, viewing times, next steps).",
  owner_representation:
    "Included in the email to the registered agent. Kindly use neutral, factual details only (apartment features, address, cross streets, viewing times, next steps).",
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const riskyOpportunityDetailsPattern = () =>
  new RegExp(
    `(${RISKY_OPPORTUNITY_DETAIL_PHRASES.map(escapeRegExp).join("|")})`,
    "gi",
  );

const hasRiskyOpportunityDetailsWording = (value: string) =>
  riskyOpportunityDetailsPattern().test(value);

const getConfirmScopeType = (
  scope?: string,
): Exclude<ConfirmScopeType, "mixed"> => {
  const normalized = scope?.trim().toLowerCase();
  if (normalized === "all market") return "all-market";
  if (normalized?.startsWith("upcoming")) return "upcoming";
  return "request";
};

const renderHighlightedOpportunityDetails = (value: string) => {
  const pattern = riskyOpportunityDetailsPattern();
  const parts = value.split(pattern);

  return parts.map((part, index) =>
    RISKY_OPPORTUNITY_DETAIL_PHRASES.some(
      (phrase) => phrase.toLowerCase() === part.toLowerCase(),
    ) ? (
      <mark key={`${part}-${index}`} className="bg-red-50 text-red-600">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
};

const quickSelectOptions: Array<{
  key: QuickSelectThreshold;
  label: string;
  starCount: number;
  suffix: string;
  threshold: number;
}> = [
  { key: "none", label: "None", starCount: 0, suffix: "", threshold: Infinity },
  {
    key: "one",
    label: "1 star & above",
    starCount: 1,
    suffix: "& above",
    threshold: 1,
  },
  {
    key: "two",
    label: "2 stars & above",
    starCount: 2,
    suffix: "& above",
    threshold: 2,
  },
  {
    key: "three",
    label: "3 stars & above",
    starCount: 3,
    suffix: "& above",
    threshold: 3,
  },
  {
    key: "four",
    label: "4 stars & above",
    starCount: 4,
    suffix: "& above",
    threshold: 4,
  },
  {
    key: "five",
    label: "5 stars only",
    starCount: 5,
    suffix: "only",
    threshold: 5,
  },
];

const bedroomQueryLabels: Record<number, string> = {
  0: "Studio",
  1: "1BR",
  2: "2BR",
  3: "3BR",
  4: "4BR+",
};

const bathroomQueryLabels: Record<number, string> = {
  1: "1",
  2: "2",
  3: "3",
  4: "4+",
};

const missingFeatureIcons: Record<string, string> = {
  bedrooms: "/icons/match/bedrooms.png",
  bathrooms: "/icons/match/bathrooms.png",
  rent: "/icons/match/rent.png",
  rentBelowMin: "/icons/match/rent-below-min-normalized.png",
  location: "/icons/match/location.png",
  moveDateTotalMiss: "/icons/match/move-date-total-miss.png",
  moveDateNearMiss: "/icons/match/move-date-near-miss.png",
  laundryInUnit: "/icons/match/laundry-in-unit.png",
  privateOutdoorSpace: "/icons/match/private-outdoor-space.png",
  dishwasher: "/icons/match/dishwasher.png",
  doorman: "/icons/match/doorman.png",
  elevator: "/icons/match/elevator.png",
  laundryInBuilding: "/icons/match/laundry-in-building.png",
};

const missingFeatureIconVisibilityStyle = {
  filter: "brightness(0.72) contrast(1.35)",
};

const starIconSrc = "/icons/match/star-filled.svg";
const starEmptyIconSrc = "/icons/match/star-empty.svg";
const preferenceFilledIconSrc = "/icons/match/preference-filled.svg";
const preferenceEmptyIconSrc = "/icons/match/preference-empty.svg";
const matchMissingColumnClass = "min-w-[170px]";
const matchPreferenceColumnClass = "min-w-[175px]";

const formatPriorityTitle = (index: number, preference?: string) => {
  const priorityLabel = `Priority ${index + 1}`;
  const preferenceLabel = preference?.trim();

  return preferenceLabel
    ? `${priorityLabel} / ${preferenceLabel}`
    : priorityLabel;
};

const formatMissingMatchFieldsMessage = (missingFields: string[]) => {
  const fields = missingFields.map((field, index) =>
    field === "move-in dates" && index > 0 ? `and ${field}` : field,
  );

  return `Please enter ${fields.join(", ")} before matching.`;
};

const missingFeatureLegend = [
  ["rent", "Rent over budget", "1-10% above renter's budget"],
  ["rentBelowMin", "Min price Range", "Rent below min price range"],
  ["location", "Location", "Neighborhood mismatch, same region match only"],
  ["moveDateNearMiss", "Move date near miss", "Move date gap within 16 days"],
  [
    "moveDateTotalMiss",
    "Move date total miss",
    "Move-in date is more than 16 days from the apartment's availability",
  ],
  ["bedrooms", "Bedrooms", "One bedroom shortfall"],
  ["bathrooms", "Bathrooms", "One bathroom shortfall"],
  ["laundryInUnit", "W/D in Unit", "No in-unit W/D"],
  ["privateOutdoorSpace", "Outdoor space", "No private outdoor space"],
  ["dishwasher", "Dishwasher", "No dishwasher"],
  ["doorman", "Doorman", "No doorman"],
  ["elevator", "Elevator", "No elevator"],
  ["laundryInBuilding", "Laundry in building", "No building laundry"],
] as const;

const demoMatchFilters: FilterType = {
  borough: "Manhattan",
  neighborhoods: ["Upper West Side (Central)"],
  bedrooms: [2],
  bathrooms: [2],
  maxPrice: 5000,
  movingDate: {
    earliest: "2026-05-15",
    latest: "2026-06-15",
  },
  unitFeatures: ["laundryInUnit", "privateOutdoorSpace", "dishwasher"],
  buildingFeatures: ["doorman", "elevator", "laundryInBuilding"],
  petPolicy: ["catsAllowed", "dogsAllowed"],
  guarantorRequired: ["personalGuarantor", "thirdPartyGuarantor"],
  availableFeatures: [
    "largeApartment",
    "lotsOfLight",
    "newRenovation",
    "highCeilings",
  ],
  enabledFeatureGroups: {
    unitFeatures: true,
    buildingFeatures: true,
    guarantorRequired: true,
    petPolicy: true,
    availableFeatures: true,
  },
};

const isLocalMatchDemoEnabled = () => {
  if (typeof window === "undefined" || process.env.NODE_ENV === "production") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("matchDemo") === "1") {
    sessionStorage.setItem(MATCH_DEMO_STORAGE_KEY, "1");
    return true;
  }

  return sessionStorage.getItem(MATCH_DEMO_STORAGE_KEY) === "1";
};

const getDemoParam = (key: string) => {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(key);
};

const createDemoRequest = (
  index: number,
  overrides: Partial<ApiAgentRequest>,
) =>
  normalizeAgentRequest({
    _id: `local-demo-request-${index}`,
    requestId: `R-DEMO-${String(index).padStart(3, "0")}`,
    requestName: `R-DEMO-${String(index).padStart(3, "0")}`,
    renterId: `local-demo-renter-${index}`,
    renterName: [
      "Michael B",
      "Naomi L",
      "Michael J",
      "Bundit S",
      "Aashima P",
      "Donna M",
      "Josh D",
      "Ofek I",
      "Abhishek S",
      "Jesus D",
    ][index - 1],
    createdAt: `2026-04-${String(31 - index).padStart(2, "0")}T12:00:00.000Z`,
    movingDateRange: {
      earliest: "2026-05-20T00:00:00.000Z",
      latest: "2026-06-10T00:00:00.000Z",
    },
    priceRange: { min: 3500, max: 5000 },
    locations: [
      {
        borough: "Manhattan",
        neighborhoods: ["Upper West Side (Central)"],
      },
    ],
    bedrooms: ["2BR"],
    bathrooms: ["2"],
    unitFeatures: {
      laundryInUnit: true,
      privateOutdoorSpace: true,
      dishwasher: true,
    },
    buildingFeatures: {
      doorman: true,
      elevator: true,
      laundryInBuilding: true,
    },
    petPolicy: {
      catsAllowed: true,
      dogsAllowed: true,
    },
    guarantorRequired: {
      personalGuarantor: true,
      thirdPartyGuarantor: true,
    },
    shareConsent: true,
    scope: "Upcoming",
    visibility: "shared",
    registrationDisclosureConfirmed: true,
    status: "available",
    preferences: [
      "Large Apartment",
      "Lots of Light",
      "New Renovation",
      "High Ceilings",
    ],
    isActive: true,
    matchScore: 100,
    matchStarRating: 5,
    matchMissingFeatures: [],
    matchPreferenceMatches: [true, true, true, true],
    matchPriorityBonus: 20,
    ...overrides,
  });

const createDemoRequests = () =>
  [
    createDemoRequest(1, {
      priceRange: { min: 60000, max: 80000 },
      alreadyMatchedByAgent: true,
      status: "matched",
    }),
    createDemoRequest(2, {
      scope: "All Market",
      matchPreferenceMatches: [false, true, true, false],
    }),
    createDemoRequest(3, {
      priceRange: { min: 45000, max: 50000 },
      matchPreferenceMatches: [false, true, true, false],
    }),
    createDemoRequest(4, {
      bedrooms: ["1BR", "2BR"],
      priceRange: { min: 3000, max: 3500 },
      matchScore: 92,
      matchStarRating: 4.5,
      matchMissingFeatures: [
        {
          code: "rent",
          label: "Rent over budget",
          description: "1-10% above renter's budget",
          deduction: -30,
        },
      ],
      matchPreferenceMatches: [false, true, true, false],
      alreadyMatchedByAgent: true,
      status: "matched",
    }),
    createDemoRequest(5, {
      bedrooms: ["1BR"],
      priceRange: { min: 3500, max: 4000 },
      matchScore: 90,
      matchStarRating: 4.5,
      matchMissingFeatures: [
        {
          code: "moveDateNearMiss",
          label: "Move date near miss",
          description: "Move date gap within 16 days",
          deduction: -10,
        },
      ],
    }),
    createDemoRequest(6, {
      bedrooms: ["Studio"],
      priceRange: { min: 3500, max: 4000 },
      matchScore: 54,
      matchStarRating: 2.5,
      matchMissingFeatures: [
        {
          code: "rent",
          label: "Rent over budget",
          description: "1-10% above renter's budget",
          deduction: -30,
        },
        {
          code: "bedrooms",
          label: "Bedrooms",
          description: "One bedroom shortfall",
          deduction: -50,
        },
        {
          code: "laundryInUnit",
          label: "W/D in Unit",
          description: "No in-unit W/D",
          deduction: -40,
        },
      ],
      matchPreferenceMatches: [false, true, true, false],
    }),
    createDemoRequest(7, {
      bedrooms: ["1BR", "2BR"],
      bathrooms: ["1", "2"],
      matchScore: 50,
      matchStarRating: 2.5,
      matchMissingFeatures: [
        {
          code: "moveDateTotalMiss",
          label: "Move date total miss",
          description:
            "Move-in date is more than 16 days from the apartment's availability",
          deduction: -40,
        },
        {
          code: "privateOutdoorSpace",
          label: "Outdoor space",
          description: "No private outdoor space",
          deduction: -40,
        },
        {
          code: "doorman",
          label: "Doorman",
          description: "No doorman",
          deduction: -40,
        },
      ],
      matchPreferenceMatches: [false, true, true, true],
    }),
    createDemoRequest(8, {
      bedrooms: ["1BR"],
      bathrooms: ["1"],
      priceRange: { min: 3500, max: 4000 },
      matchScore: 28,
      matchStarRating: 1.5,
      matchMissingFeatures: [
        {
          code: "location",
          label: "Location",
          description: "Neighborhood mismatch, same region match only",
          deduction: -40,
        },
        {
          code: "elevator",
          label: "Elevator",
          description: "No elevator",
          deduction: -40,
        },
        {
          code: "laundryInBuilding",
          label: "Laundry in building",
          description: "No building laundry",
          deduction: -40,
        },
      ],
      matchPreferenceMatches: [false, false, false, false],
    }),
    createDemoRequest(9, {
      bedrooms: ["1BR"],
      bathrooms: ["1"],
      scope: "All Market",
      priceRange: { min: 3300, max: 3800 },
      matchScore: 22,
      matchStarRating: 1.5,
      matchMissingFeatures: [
        {
          code: "moveDateNearMiss",
          label: "Move date near miss",
          description: "Move date gap within 16 days",
          deduction: -10,
        },
        {
          code: "location",
          label: "Location",
          description: "Neighborhood mismatch, same region match only",
          deduction: -40,
        },
        {
          code: "bathrooms",
          label: "Bathrooms",
          description: "One bathroom shortfall",
          deduction: -50,
        },
      ],
      matchPreferenceMatches: [true, true, true, false],
    }),
    createDemoRequest(10, {
      bedrooms: ["1BR"],
      bathrooms: ["1"],
      priceRange: { min: 3200, max: 3600 },
      matchScore: 20,
      matchStarRating: 1.5,
      matchMissingFeatures: [
        {
          code: "moveDateTotalMiss",
          label: "Move date total miss",
          description:
            "Move-in date is more than 16 days from the apartment's availability",
          deduction: -40,
        },
        {
          code: "dishwasher",
          label: "Dishwasher",
          description: "No dishwasher",
          deduction: -40,
        },
        {
          code: "elevator",
          label: "Elevator",
          description: "No elevator",
          deduction: -40,
        },
      ],
      matchPreferenceMatches: [false, true, true, false],
    }),
  ].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

const StarSvgIcon = ({
  filled,
  half = false,
  size = 18,
}: {
  filled: boolean;
  half?: boolean;
  size?: number;
}) => {
  if (half) {
    return (
      <span
        className="relative inline-block shrink-0 overflow-hidden"
        style={{ width: size, height: size }}
      >
        <Image
          src={starEmptyIconSrc}
          alt=""
          aria-hidden="true"
          width={size}
          height={size}
          className="absolute inset-0 h-full w-full"
        />
        <span className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
          <Image
            src={starIconSrc}
            alt=""
            aria-hidden="true"
            width={size}
            height={size}
            className="h-full max-w-none"
            style={{ width: size, height: size }}
          />
        </span>
      </span>
    );
  }

  return (
    <Image
      src={filled ? starIconSrc : starEmptyIconSrc}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className="shrink-0"
    />
  );
};

const renderStars = (rating?: number) => {
  const value = rating ?? 0;
  const full = Math.floor(value);
  const hasHalf = value % 1 === 0.5;
  const empty = Math.max(0, 5 - full - (hasHalf ? 1 : 0));

  return (
    <span className="inline-flex min-w-[110px] items-center gap-0.5 leading-none">
      {Array.from({ length: full }).map((_, index) => (
        <StarSvgIcon key={`full-${index}`} filled />
      ))}
      {hasHalf ? <StarSvgIcon filled half /> : null}
      {Array.from({ length: empty }).map((_, index) => (
        <StarSvgIcon key={`empty-${index}`} filled={false} />
      ))}
    </span>
  );
};

const renderQuickSelectLabel = (
  option: (typeof quickSelectOptions)[number],
) => {
  if (option.key === "none") return option.label;

  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: option.starCount }).map((_, index) => (
          <StarSvgIcon key={index} filled size={12} />
        ))}
      </span>
      <span>{option.suffix}</span>
    </span>
  );
};

const appendCsvParam = (
  params: URLSearchParams,
  key: string,
  values: string[],
) => {
  const activeValues = values.filter(Boolean);
  if (activeValues.length) params.set(key, activeValues.join(","));
};

const appendFilterParams = (params: URLSearchParams, filters: FilterType) => {
  if (filters.borough) params.set("borough", filters.borough);
  appendCsvParam(
    params,
    "bedrooms",
    filters.bedrooms.flatMap((value) =>
      bedroomQueryLabels[value] ? [bedroomQueryLabels[value]] : [],
    ),
  );
  appendCsvParam(
    params,
    "bathrooms",
    filters.bathrooms.flatMap((value) =>
      bathroomQueryLabels[value] ? [bathroomQueryLabels[value]] : [],
    ),
  );
  if (filters.maxPrice != null) params.set("rent", String(filters.maxPrice));
  if (filters.movingDate.earliest) {
    params.set("movingDateEarliest", filters.movingDate.earliest);
  }
  if (filters.movingDate.latest) {
    params.set("movingDateLatest", filters.movingDate.latest);
  }
  appendCsvParam(params, "unitFeatures", filters.unitFeatures);
  appendCsvParam(params, "buildingFeatures", filters.buildingFeatures);
  appendCsvParam(params, "petPolicy", filters.petPolicy);
  appendCsvParam(params, "guarantorRequired", filters.guarantorRequired);
  appendCsvParam(params, "availableFeatures", filters.availableFeatures);
};

const isCurrentAgentRegisteredForRequest = (
  request: NormalizedAgentRequest,
  currentAgentId?: string | null,
) => {
  if (!currentAgentId) return false;

  const raw = request.raw;
  const registeredAgentIds = [
    raw?.referralAgentId,
    raw?.referrerId,
    raw?.referralInfo?.referrer?.id,
    raw?.referralInfo?.referrer?.referrerId,
    raw?.renterInfo?.referralInfo?.referrerId,
    raw?.renterInfo?.referralInfo?.referredByAdmin?.referredBy,
  ]
    .map((value) => (value ? String(value) : ""))
    .filter(Boolean);

  return registeredAgentIds.includes(String(currentAgentId));
};

const formatRenterDisplayName = (fullName?: string | null) => {
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "Not specified";
  if (parts.length === 1) return parts[0];

  return `${parts[0]} ${parts[parts.length - 1][0]}`;
};

const isSharedVisibility = (visibility?: string | null) =>
  visibility?.trim().toLowerCase() === "shared";

const readStoredFilters = (): FilterType => {
  if (typeof window === "undefined") return defaultFilters;

  try {
    const stored = sessionStorage.getItem(FILTERS_STORAGE_KEY);
    if (!stored) return defaultFilters;
    const parsed = JSON.parse(stored) as Partial<FilterType>;
    return sanitizeFilters(parsed);
  } catch {
    return defaultFilters;
  }
};

const readStoredListState = () => {
  if (typeof window === "undefined") {
    return {
      page: 1,
      showOwnReferrals: false,
      showAllMarketReferrals: false,
      isMatchResultsMode: false,
      matchSearchFilters: null,
      isFilterOpen: false,
    };
  }

  try {
    const stored = sessionStorage.getItem(LIST_STATE_STORAGE_KEY);
    if (!stored) {
      return {
        page: 1,
        showOwnReferrals: false,
        showAllMarketReferrals: false,
        isMatchResultsMode: false,
        matchSearchFilters: null,
        isFilterOpen: false,
      };
    }
    const parsed = JSON.parse(stored) as Partial<{
      page: number;
      showOwnReferrals: boolean;
      showAllMarketReferrals: boolean;
      isMatchResultsMode: boolean;
      matchSearchFilters: FilterType | null;
      isFilterOpen: boolean;
    }>;
    const restoredMatchSearchFilters = parsed.matchSearchFilters
      ? sanitizeFilters(parsed.matchSearchFilters)
      : null;
    return {
      page:
        typeof parsed.page === "number" && parsed.page > 0 ? parsed.page : 1,
      showOwnReferrals: Boolean(parsed.showOwnReferrals),
      showAllMarketReferrals: Boolean(parsed.showAllMarketReferrals),
      isMatchResultsMode:
        Boolean(parsed.isMatchResultsMode) &&
        Boolean(restoredMatchSearchFilters),
      matchSearchFilters: restoredMatchSearchFilters,
      isFilterOpen: Boolean(parsed.isFilterOpen),
    };
  } catch {
    return {
      page: 1,
      showOwnReferrals: false,
      showAllMarketReferrals: false,
      isMatchResultsMode: false,
      matchSearchFilters: null,
      isFilterOpen: false,
    };
  }
};

export default function AgentRenterRequestsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const currentAgentId = useSelector(
    (state: RootState) => state.auth.user?._id,
  );
  const [requests, setRequests] = useState<NormalizedAgentRequest[]>([]);
  const [filters, setFilters] = useState<FilterType>(defaultFilters);
  const [matchSearchFilters, setMatchSearchFilters] =
    useState<FilterType | null>(null);
  const [isMatchResultsMode, setIsMatchResultsMode] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showOwnReferrals, setShowOwnReferrals] = useState(false);
  const [showAllMarketReferrals, setShowAllMarketReferrals] = useState(false);
  const [isStateRestored, setIsStateRestored] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutatingShareId, setMutatingShareId] = useState<string | null>(null);
  const [
    mutatingRegistrationDisclosureId,
    setMutatingRegistrationDisclosureId,
  ] = useState<string | null>(null);
  const [archiveTarget, setArchiveTarget] =
    useState<NormalizedAgentRequest | null>(null);
  const [archiveReason, setArchiveReason] = useState<ArchiveReason | "">("");
  const [isArchiving, setIsArchiving] = useState(false);
  const [requestUpdateTarget, setRequestUpdateTarget] =
    useState<NormalizedAgentRequest | null>(null);
  const [unmatchTarget, setUnmatchTarget] =
    useState<NormalizedAgentRequest | null>(null);
  const [isRequestUpdating, setIsRequestUpdating] = useState(false);
  const [isUnmatching, setIsUnmatching] = useState(false);
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [quickSelect, setQuickSelect] = useState<QuickSelectThreshold>("none");
  const [isMatchingChecked, setIsMatchingChecked] = useState(false);
  const [isBulkRepresentationOpen, setIsBulkRepresentationOpen] =
    useState(false);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [bulkRepresentationType, setBulkRepresentationType] = useState<
    RepresentationType | ""
  >("");
  const [bulkOpportunityDetails, setBulkOpportunityDetails] = useState("");
  const [isBulkConfirmChecked, setIsBulkConfirmChecked] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isMatchDemoMode, setIsMatchDemoMode] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<
    ApiAgentRequestsResponse["pagination"]
  >({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const limit = 10;

  useEffect(() => {
    const demoEnabled = isLocalMatchDemoEnabled();
    setIsMatchDemoMode(demoEnabled);
    setFilters(readStoredFilters());
    const {
      page: storedPage,
      showOwnReferrals: storedShowOwnReferrals,
      showAllMarketReferrals: storedShowAllMarketReferrals,
      isMatchResultsMode: storedIsMatchResultsMode,
      matchSearchFilters: storedMatchSearchFilters,
      isFilterOpen: storedIsFilterOpen,
    } = readStoredListState();
    setPage(storedPage);
    setShowOwnReferrals(storedShowOwnReferrals);
    setShowAllMarketReferrals(storedShowAllMarketReferrals);
    setMatchSearchFilters(storedMatchSearchFilters);
    setIsMatchResultsMode(storedIsMatchResultsMode);
    setIsFilterOpen(storedIsFilterOpen);
    if (demoEnabled) {
      const shouldShowResults = getDemoParam("results") === "1";
      setFilters(demoMatchFilters);
      setMatchSearchFilters(demoMatchFilters);
      setIsMatchResultsMode(shouldShowResults);
      setIsFilterOpen(getDemoParam("openDrawer") === "1");
      setIsLegendOpen(getDemoParam("legend") === "1");
    }
    setIsStateRestored(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isStateRestored) return;
    sessionStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [filters, isStateRestored]);

  useEffect(() => {
    if (typeof window === "undefined" || !isStateRestored) return;
    sessionStorage.setItem(
      LIST_STATE_STORAGE_KEY,
      JSON.stringify({
        page,
        showOwnReferrals,
        showAllMarketReferrals,
        isMatchResultsMode,
        matchSearchFilters,
        isFilterOpen,
      }),
    );
  }, [
    isFilterOpen,
    isMatchResultsMode,
    isStateRestored,
    matchSearchFilters,
    page,
    showAllMarketReferrals,
    showOwnReferrals,
  ]);

  useEffect(() => {
    if (!accessToken) return;
    if (isMatchDemoMode) return;
    dispatch(fetchAgentProfile());
  }, [accessToken, dispatch, isMatchDemoMode]);

  useEffect(() => {
    if (!isStateRestored) return;
    const controller = new AbortController();

    const fetchRequests = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (isMatchDemoMode) {
          const demoRequests = createDemoRequests();
          setRequests(demoRequests);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: demoRequests.length,
            itemsPerPage: limit,
            hasNext: false,
            hasPrev: false,
            nextPage: null,
            prevPage: null,
          });
          cacheAgentRequests(demoRequests);

          const quickParam = getDemoParam(
            "quick",
          ) as QuickSelectThreshold | null;
          const quickOption = quickSelectOptions.find(
            (option) => option.key === quickParam,
          );
          if (quickOption && quickOption.key !== "none") {
            setQuickSelect(quickOption.key);
            setSelectedRequestIds(
              demoRequests
                .filter(
                  (request) =>
                    (request.matchStarRating ?? 0) >= quickOption.threshold,
                )
                .map((request) => request.id),
            );
          } else {
            setSelectedRequestIds([]);
            setQuickSelect("none");
          }

          return;
        }

        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        appendFilterParams(params, filters);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

        const response =
          isMatchResultsMode && matchSearchFilters
            ? await fetch(`${API_BASE_URL}/pre-market/agent/match-search`, {
                method: "POST",
                headers,
                signal: controller.signal,
                body: JSON.stringify({
                  ...buildMatchSearchPayload(matchSearchFilters),
                  page,
                  limit,
                }),
              })
            : await fetch(
                `${API_BASE_URL}/pre-market/all?${params.toString()}`,
                {
                  method: "GET",
                  headers,
                  signal: controller.signal,
                },
              );

        const data: ApiAgentRequestsResponse = await response
          .json()
          .catch(() => ({}) as ApiAgentRequestsResponse);

        if (!response.ok || data?.success === false) {
          throw new Error(
            data?.message ||
              "We couldn't load renter requests right now. Please try again.",
          );
        }

        const normalized = (data.data ?? []).map(normalizeAgentRequest);
        setRequests(normalized);
        setPagination(data.pagination);
        setSelectedRequestIds([]);
        setQuickSelect("none");
        cacheAgentRequests(normalized);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error
            ? err.message
            : "We couldn't load renter requests right now. Please try again.";
        setError(message);
        setRequests([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        });
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchRequests();

    return () => controller.abort();
  }, [
    accessToken,
    filters,
    isMatchResultsMode,
    isMatchDemoMode,
    isStateRestored,
    matchSearchFilters,
    page,
  ]);

  const filteredRequests = useMemo(() => {
    if (isMatchResultsMode) return requests;

    return requests.filter((req) =>
      matchesAgentFilters(
        req.raw,
        filters,
        showOwnReferrals,
        currentAgentId,
        showAllMarketReferrals,
      ),
    );
  }, [
    currentAgentId,
    filters,
    isMatchResultsMode,
    requests,
    showAllMarketReferrals,
    showOwnReferrals,
  ]);

  useEffect(() => {
    if (typeof window === "undefined" || !isStateRestored) return;

    writeStoredAgentListState(NAVIGATION_STORAGE_KEY, {
      page,
      limit,
      totalPages: Math.max(1, pagination?.totalPages ?? 1),
      itemIds: filteredRequests.map((request) => request.id),
      filters,
      matchSearchFilters,
      isMatchResultsMode,
      isFilterOpen,
      showOwnReferrals,
      showAllMarketReferrals,
    });
  }, [
    filteredRequests,
    filters,
    isFilterOpen,
    isMatchResultsMode,
    isStateRestored,
    limit,
    matchSearchFilters,
    page,
    pagination?.totalPages,
    showAllMarketReferrals,
    showOwnReferrals,
  ]);

  const handleView = (req: NormalizedAgentRequest) => {
    cacheSingleAgentRequest(req);
    router.push(
      `/agent/dashboard/${req.id}${isMatchResultsMode ? "?from=matches" : ""}`,
    );
  };

  const handleToggleShare = async (request: NormalizedAgentRequest) => {
    const localId = request.id;
    const apiRequestId = request.raw?._id;

    setError(null);
    setMutatingShareId(localId);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(
        `${API_BASE_URL}/pre-market/${apiRequestId}/toggle-share`,
        {
          method: "PATCH",
          headers,
        },
      );

      const data = await response
        .json()
        .catch(() => ({}) as { success?: boolean; message?: string });

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            "We couldn't update request visibility right now. Please try again.",
        );
      }

      setRequests((prev) => {
        const next = prev.map((req) => {
          if (req.id !== localId) return req;

          const isPrivateVisibility = !req.isPrivateVisibility;
          return {
            ...req,
            isPrivateVisibility,
            visibilityLabel: isPrivateVisibility ? "Private" : "Shared",
            raw: {
              ...req.raw,
              visibility: isPrivateVisibility ? "private" : "shared",
            },
          };
        });
        cacheAgentRequests(next);
        return next;
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't update request visibility right now. Please try again.";
      setError(message);
    } finally {
      setMutatingShareId(null);
    }
  };

  const handleConfirmRegistrationDisclosure = async (
    request: NormalizedAgentRequest,
  ) => {
    if (request.registrationDisclosureConfirmed) return;

    const localId = request.id;
    const apiRequestId = request.raw?._id;

    if (!apiRequestId) {
      setError("We couldn't save the document confirmation for this request.");
      return;
    }

    setError(null);
    setMutatingRegistrationDisclosureId(localId);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(
        `${API_BASE_URL}/pre-market/${apiRequestId}/registration-disclosure/confirm`,
        {
          method: "PATCH",
          headers,
        },
      );

      const data = await response.json().catch(
        () =>
          ({}) as {
            success?: boolean;
            message?: string;
            data?: {
              registrationDisclosureConfirmedAt?: string | null;
            };
          },
      );

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            "We couldn't save the document confirmation right now.",
        );
      }

      const confirmedAt =
        data?.data?.registrationDisclosureConfirmedAt ??
        new Date().toISOString();

      setRequests((prev) => {
        const next = prev.map((req) => {
          if (req.id !== localId) return req;

          return {
            ...req,
            registrationDisclosureConfirmed: true,
            registrationDisclosureConfirmedAt: confirmedAt,
            raw: {
              ...req.raw,
              registrationDisclosureConfirmed: true,
              registrationDisclosureConfirmedAt: confirmedAt,
            },
          };
        });
        cacheAgentRequests(next);
        return next;
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't save the document confirmation right now.";
      setError(message);
    } finally {
      setMutatingRegistrationDisclosureId(null);
    }
  };

  const openArchiveDialog = (request: NormalizedAgentRequest) => {
    setArchiveTarget(request);
    setArchiveReason("");
    setError(null);
  };

  const openRequestUpdateDialog = (request: NormalizedAgentRequest) => {
    setRequestUpdateTarget(request);
    setError(null);
  };

  const closeRequestUpdateDialog = () => {
    if (isRequestUpdating) return;
    setRequestUpdateTarget(null);
  };

  const openUnmatchDialog = (request: NormalizedAgentRequest) => {
    setUnmatchTarget(request);
    setError(null);
  };

  const closeUnmatchDialog = () => {
    if (isUnmatching) return;
    setUnmatchTarget(null);
  };

  const closeArchiveDialog = () => {
    if (isArchiving) return;
    setArchiveTarget(null);
    setArchiveReason("");
  };

  const handleArchiveRequest = async () => {
    if (!archiveTarget || !archiveReason) return;

    const apiRequestId = archiveTarget.raw?._id;
    if (!apiRequestId) {
      setError("We couldn't archive this request.");
      return;
    }

    setIsArchiving(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(
        `${API_BASE_URL}/pre-market/${apiRequestId}/archive`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ reason: archiveReason }),
        },
      );
      const data = await response
        .json()
        .catch(() => ({}) as { success?: boolean; message?: string });

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "We couldn't archive this request.");
      }

      setRequests((prev) => {
        const next = prev.filter((req) => req.id !== archiveTarget.id);
        cacheAgentRequests(next);
        return next;
      });
      setArchiveTarget(null);
      setArchiveReason("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't archive this request.";
      setError(message);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleRequestUpdateConfirm = async (
    personalMessage: string | undefined,
  ) => {
    if (!requestUpdateTarget) return;

    const apiRequestId = requestUpdateTarget.raw?._id;
    if (!apiRequestId) {
      setError("We couldn't send the update request.");
      return;
    }

    setIsRequestUpdating(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(
        `${API_BASE_URL}/pre-market/${apiRequestId}/request-update`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ personalMessage }),
        },
      );
      const data = await response
        .json()
        .catch(() => ({}) as { success?: boolean; message?: string });

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "We couldn't send the update request.",
        );
      }

      setRequestUpdateTarget(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't send the update request.";
      setError(message);
    } finally {
      setIsRequestUpdating(false);
    }
  };

  const handleUnmatchConfirm = async (options: {
    sendEmailNotice: boolean;
    personalMessage: string | undefined;
  }) => {
    if (!unmatchTarget) return;

    const apiRequestId = unmatchTarget.raw?._id;
    if (!apiRequestId) {
      setError("We couldn't unmatch this request.");
      return;
    }

    setIsUnmatching(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(
        `${API_BASE_URL}/pre-market/${apiRequestId}/unmatch`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(options),
        },
      );
      const data = await response
        .json()
        .catch(() => ({}) as { success?: boolean; message?: string });

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "We couldn't unmatch this request.");
      }

      setRequests((prev) => {
        const next = prev.filter((req) => req.id !== unmatchTarget.id);
        cacheAgentRequests(next);
        return next;
      });
      setUnmatchTarget(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't unmatch this request.";
      setError(message);
    } finally {
      setIsUnmatching(false);
    }
  };

  const handlePreviousPage = () => {
    if (pagination?.hasPrev) setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (pagination?.hasNext) setPage((prev) => prev + 1);
  };

  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const currentPage = pagination?.currentPage ?? page;
  const totalItems = pagination?.totalItems ?? filteredRequests.length;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const hasServerResults = requests.length > 0;
  const hasFilteredResults = filteredRequests.length > 0;
  const selectedRequestCount = selectedRequestIds.length;
  const selectedRequests = useMemo(() => {
    const selectedIds = new Set(selectedRequestIds);
    return requests.filter((request) => selectedIds.has(request.id));
  }, [requests, selectedRequestIds]);
  const selectedHasAlreadyMatchedRequests = selectedRequests.some(
    (request) => request.alreadyMatchedByAgent,
  );
  const selectedAllRequestsAlreadyMatched =
    selectedRequestCount > 0 &&
    selectedRequests.length === selectedRequestCount &&
    selectedRequests.every((request) => request.alreadyMatchedByAgent);
  const bulkActionIdleLabel = selectedHasAlreadyMatchedRequests
    ? selectedAllRequestsAlreadyMatched
      ? "Add Opportunity"
      : "Match / Add Opportunity"
    : "Match Checked";
  const bulkActionLoadingLabel = selectedHasAlreadyMatchedRequests
    ? "Sending..."
    : "Matching...";
  const bulkConfirmScopeType = useMemo<ConfirmScopeType>(() => {
    const scopeTypes = selectedRequests
      .map((request) =>
        getConfirmScopeType(request.raw?.scope || request.scopeLabel),
      )
      .filter((scopeType) => scopeType !== "request");
    const uniqueScopeTypes = new Set(scopeTypes);

    if (
      uniqueScopeTypes.has("all-market") &&
      uniqueScopeTypes.has("upcoming")
    ) {
      return "mixed";
    }
    if (uniqueScopeTypes.has("all-market")) return "all-market";
    if (uniqueScopeTypes.has("upcoming")) return "upcoming";
    return "request";
  }, [selectedRequests]);
  const bulkConfirmScopeLabel =
    bulkConfirmScopeType === "all-market"
      ? "All Market"
      : bulkConfirmScopeType === "upcoming"
        ? "Upcoming"
        : bulkConfirmScopeType === "mixed"
          ? "Multiple Scopes"
          : "Request";
  const bulkOpportunityDetailsCount = bulkOpportunityDetails.length;
  const bulkOpportunityDetailsCounterClass =
    bulkOpportunityDetailsCount >= OPPORTUNITY_DETAILS_MAX_LENGTH
      ? "text-red-600"
      : bulkOpportunityDetailsCount >= 280
        ? "text-amber-600"
        : "text-gray-400";
  const hasRiskyBulkOpportunityDetails = hasRiskyOpportunityDetailsWording(
    bulkOpportunityDetails,
  );
  const handlePageSelect = (value: number) => {
    if (value === currentPage) return;
    setPage(value);
  };

  const handleApplyFilters = (nextFilters: FilterType) => {
    const missingFields: string[] = [];

    if (!nextFilters.borough) missingFields.push("borough");
    if (!nextFilters.neighborhoods[0]) missingFields.push("neighborhood");
    if (nextFilters.bedrooms[0] == null) missingFields.push("bedrooms");
    if (nextFilters.bathrooms[0] == null) missingFields.push("bathrooms");
    if (nextFilters.maxPrice == null) missingFields.push("rent");
    if (!nextFilters.movingDate.earliest || !nextFilters.movingDate.latest) {
      missingFields.push("move-in dates");
    }

    if (missingFields.length) {
      setError(formatMissingMatchFieldsMessage(missingFields));
      return;
    }

    setPage(1);
    setMatchSearchFilters(nextFilters);
    setIsMatchResultsMode(true);
    setIsFilterOpen(false);
  };

  const handleResetMatchFilters = (nextFilters: FilterType) => {
    setError(null);
    setPage(1);
    setFilters(nextFilters);
    setMatchSearchFilters(null);
    setIsMatchResultsMode(false);
    setSelectedRequestIds([]);
    setQuickSelect("none");
    setIsFilterOpen(true);
  };

  const handleQuickSelect = (option: (typeof quickSelectOptions)[number]) => {
    setQuickSelect(option.key);
    if (option.key === "none") {
      setSelectedRequestIds([]);
      return;
    }

    setSelectedRequestIds(
      filteredRequests
        .filter((request) => (request.matchStarRating ?? 0) >= option.threshold)
        .map((request) => request.id),
    );
  };

  const handleToggleRequestSelection = (requestId: string) => {
    setQuickSelect("none");
    setSelectedRequestIds((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId],
    );
  };

  const handleToggleSelectAll = () => {
    setQuickSelect("none");
    const visibleIds = filteredRequests.map((request) => request.id);
    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((requestId) => selectedRequestIds.includes(requestId));

    setSelectedRequestIds(allSelected ? [] : visibleIds);
  };

  const resetBulkMatchFlow = () => {
    setIsBulkRepresentationOpen(false);
    setIsBulkConfirmOpen(false);
    setBulkRepresentationType("");
    setBulkOpportunityDetails("");
    setIsBulkConfirmChecked(false);
  };

  const applyBulkMatchResult = (
    matchedIds: Set<string>,
    representationType: RepresentationType,
  ) => {
    const representationSelectedAt = new Date().toISOString();

    setRequests((prev) => {
      const next = prev.map((request) => {
        if (!matchedIds.has(request.id)) return request;

        if (representationType === "owner_representation") {
          return {
            ...request,
            ownerRepresentationSelected: true,
            representation_type: "owner_representation" as const,
            representationSelectedAt,
            raw: {
              ...request.raw,
              ownerRepresentationSelected: true,
              representation_type: "owner_representation" as const,
              representationSelectedAt,
            },
          };
        }

        return {
          ...request,
          alreadyMatchedByAgent: true,
          status: "matched",
          representation_type: "renter_representation" as const,
          representationSelectedAt,
          raw: {
            ...request.raw,
            alreadyMatchedByAgent: true,
            status: "matched",
            listingStatus: "matched",
            representation_type: "renter_representation" as const,
            representationSelectedAt,
          },
        };
      });
      cacheAgentRequests(next);
      return next;
    });
  };

  const handleMatchChecked = () => {
    if (!selectedRequestIds.length) return;
    setError(null);
    setBulkRepresentationType("");
    setBulkOpportunityDetails("");
    setIsBulkConfirmChecked(false);
    setIsBulkRepresentationOpen(true);
  };

  const handleSubmitBulkMatch = async (
    representationType: RepresentationType,
  ) => {
    if (!selectedRequestIds.length || isMatchingChecked) return;

    const normalizedOpportunityDetails = bulkOpportunityDetails
      .trim()
      .slice(0, OPPORTUNITY_DETAILS_MAX_LENGTH);

    if (hasRiskyOpportunityDetailsWording(normalizedOpportunityDetails)) {
      setError(OPPORTUNITY_DETAILS_RISKY_WORDING_MESSAGE);
      return;
    }

    setIsMatchingChecked(true);
    setError(null);

    try {
      if (isMatchDemoMode) {
        const matchedIds = new Set(selectedRequestIds);
        applyBulkMatchResult(matchedIds, representationType);
        setSelectedRequestIds([]);
        setQuickSelect("none");
        resetBulkMatchFlow();
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      const shouldSendAdditionalOpportunity =
        representationType === "renter_representation" &&
        selectedHasAlreadyMatchedRequests;

      const response = await fetch(
        `${API_BASE_URL}/pre-market/agent/match-checked`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            requestIds: selectedRequestIds,
            representation_type: representationType,
            ...(shouldSendAdditionalOpportunity
              ? { additionalOpportunity: true }
              : {}),
            ...(matchSearchFilters
              ? { matchContext: buildMatchSearchPayload(matchSearchFilters) }
              : {}),
            ...(normalizedOpportunityDetails
              ? { opportunityDetails: normalizedOpportunityDetails }
              : {}),
          }),
        },
      );
      const data: {
        success?: boolean;
        message?: string;
        data?: {
          matched?: Array<{ requestId: string }>;
          failed?: Array<{ requestId: string; message: string }>;
        };
      } = await response.json().catch(
        () =>
          ({}) as {
            success?: boolean;
            message?: string;
            data?: {
              matched?: Array<{ requestId: string }>;
              failed?: Array<{ requestId: string; message: string }>;
            };
          },
      );

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "We couldn't match selected requests.",
        );
      }

      const matchedIds = new Set(
        (data.data?.matched ?? []).map((item) => item.requestId),
      );

      applyBulkMatchResult(matchedIds, representationType);
      setSelectedRequestIds([]);
      setQuickSelect("none");
      resetBulkMatchFlow();

      if (data.data?.failed?.length) {
        setError(
          data.data.failed
            .map((failure) => {
              const request = requests.find(
                (item) => item.id === failure.requestId,
              );
              return `${request?.requestName || failure.requestId}: ${failure.message}`;
            })
            .join(" "),
        );
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't match selected requests.";
      setError(message);
    } finally {
      setIsMatchingChecked(false);
    }
  };

  if (isLoading && !isFilterOpen) {
    return <CenteredPageSpinner />;
  }

  return (
    <section className="bg-gray-50 min-h-screen px-4 lg:px-6 py-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-5 rounded-xl shadow-sm gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {isMatchResultsMode ? "Renter Matches" : "Renter Requests"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View all available pre-market requests from renters.
          </p>
          {isMatchResultsMode ? (
            <div className="mt-3">
              <p className="mb-1 text-[11px] font-medium text-gray-500">
                Quick select:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {quickSelectOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleQuickSelect(option)}
                    aria-label={option.label}
                    className={`rounded-md border px-3 py-1 text-xs transition ${
                      quickSelect === option.key
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {renderQuickSelectLabel(option)}
                  </button>
                ))}
                {selectedRequestIds.length ? (
                  <span className="text-xs text-gray-500">
                    {selectedRequestIds.length} selected on this page
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAllMarketReferrals((prev) => !prev)}
              className={`flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 ${
                showAllMarketReferrals
                  ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-sm"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:shadow-sm"
              }`}
              title={
                showAllMarketReferrals
                  ? "Show all requests"
                  : "Show only All-Market referrals"
              }
            >
              <img
                src={
                  showAllMarketReferrals
                    ? "/icons/all_market_icon_white.svg"
                    : "/icons/all_market_icon_black.svg"
                }
                alt=""
                aria-hidden="true"
                width={24}
                height={56}
                className="h-[24px] w-[56px] object-contain"
              />
              All-Market Referrals
            </button>
            <button
              onClick={() => setShowOwnReferrals((prev) => !prev)}
              className={`flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 ${
                showOwnReferrals
                  ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-sm"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:shadow-sm"
              }`}
            >
              <Image
                src={
                  showOwnReferrals
                    ? "/icons/direct_renter_white.png"
                    : "/icons/direct_renter_black.png"
                }
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
                className="h-[24px] w-[24px] object-contain"
              />
              Direct Renters
            </button>
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full bg-blue-600 px-4 py-2 font-medium text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-sm sm:w-auto sm:justify-start"
          >
            <Image
              src="/icons/house.png"
              alt=""
              aria-hidden="true"
              width={18}
              height={16}
              className="h-4 w-[18px] object-contain"
            />
            Find Matches
          </button>
        </div>
      </div>
      {error ? (
        <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-4 text-sm">
          {error}
        </div>
      ) : !hasServerResults ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-gray-600">
          No renter requests available right now.
        </div>
      ) : (
        <>
          {hasFilteredResults ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-hidden">
              <div className="overflow-x-auto">
                <table
                  className={`w-full text-sm ${
                    isMatchResultsMode ? "min-w-[1880px]" : "min-w-[1240px]"
                  }`}
                >
                  <thead className="bg-blue-100 text-gray-800">
                    {isMatchResultsMode ? (
                      <tr>
                        <th className="py-3 px-5 text-left">Date</th>
                        <th className="py-3 px-5 text-left">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={
                                filteredRequests.length > 0 &&
                                filteredRequests.every((req) =>
                                  selectedRequestIds.includes(req.id),
                                )
                              }
                              onChange={handleToggleSelectAll}
                              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label="Select all visible match results"
                            />
                          </label>
                        </th>
                        <th className="py-3 px-5 text-left">Request</th>
                        <th className="py-3 px-5 text-left">Match Rating</th>
                        <th
                          className={`py-3 px-5 text-left ${matchMissingColumnClass}`}
                        >
                          What&apos;s Missing
                        </th>
                        <th
                          className={`py-3 px-5 text-left ${matchPreferenceColumnClass}`}
                        >
                          Preference Match
                        </th>
                        <th className="py-3 px-5 text-left">Renter</th>
                        <th className="py-3 px-5 text-left">Scope</th>
                        <th className="py-3 px-5 text-left">Visibility</th>
                        <th className="py-3 px-5 text-left">Borough</th>
                        <th className="py-3 px-5 text-left">Price (Max)</th>
                        <th className="py-3 px-5 text-left">Beds / Baths</th>
                        <th className="py-3 px-5 text-left">Status</th>
                        <th className="py-3 px-5 text-center">
                          Registration / Disclosure
                        </th>
                        <th className="py-3 px-5 text-right">Actions</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="py-3 px-5 text-left">Date</th>
                        <th className="py-3 px-5 text-left">Request</th>
                        <th className="py-3 px-5 text-left">Renter</th>
                        <th className="py-3 px-5 text-left">Scope</th>
                        <th className="py-3 px-5 text-left">Visibility</th>
                        <th className="py-3 px-5 text-left">Borough</th>
                        <th className="py-3 px-5 text-left">Price (Max)</th>
                        <th className="py-3 px-5 text-left">Beds / Baths</th>
                        <th className="py-3 px-5 text-left">Status</th>
                        <th className="py-3 px-5 text-center">
                          Registration / Disclosure
                        </th>
                        <th className="py-3 px-5 text-right">Actions</th>
                      </tr>
                    )}
                  </thead>

                  <tbody>
                    {filteredRequests.map((req) => {
                      const isCurrentAgentsRequest =
                        isCurrentAgentRegisteredForRequest(req, currentAgentId);
                      const shareConsent = req.raw?.shareConsent;
                      const visibility = req.raw?.visibility;
                      const shouldShowRegistrationDisclosure =
                        isCurrentAgentsRequest ||
                        req.alreadyMatchedByAgent ||
                        !isSharedVisibility(visibility);
                      const isArchivedForAgent = Boolean(
                        req.isArchivedForAgent,
                      );
                      const isLockedByRenterConsent = shareConsent === false;
                      const isVisibilityLocked =
                        isLockedByRenterConsent || isArchivedForAgent;
                      const isRegistrationDisclosureLocked =
                        !req.registrationDisclosureConfirmed;
                      const isShareDisabledByDocuments =
                        req.isPrivateVisibility &&
                        isRegistrationDisclosureLocked;
                      const visibilityToggleTitle = isArchivedForAgent
                        ? "Visibility is locked while this request is archived"
                        : isLockedByRenterConsent
                          ? "Renter did not consent to share this request"
                          : isShareDisabledByDocuments
                            ? "Registration / Disclosure confirmation is required before sharing this request"
                            : "Toggle request visibility";

                      return (
                        <tr
                          key={req.id}
                          className="border-t border-gray-200 hover:bg-gray-50 text-gray-700"
                        >
                          <td className="py-3 px-5">
                            <div className="font-semibold text-gray-900">
                              {req.dateLabel}
                            </div>
                          </td>
                          {isMatchResultsMode ? (
                            <>
                              <td className="py-3 px-5">
                                <input
                                  type="checkbox"
                                  checked={selectedRequestIds.includes(req.id)}
                                  onChange={() =>
                                    handleToggleRequestSelection(req.id)
                                  }
                                  aria-label={`Select ${req.requestName}`}
                                  className={`h-5 w-5 rounded text-blue-600 focus:ring-blue-500 ${
                                    req.alreadyMatchedByAgent
                                      ? "border-2 border-blue-600"
                                      : "border border-gray-300"
                                  }`}
                                  style={
                                    req.alreadyMatchedByAgent
                                      ? {
                                          borderColor: "#2563eb",
                                          boxShadow: "0 0 0 2px #2563eb",
                                        }
                                      : undefined
                                  }
                                />
                              </td>
                              <td className="py-3 px-5">
                                <div className="text-gray-900">
                                  {req.requestName}
                                </div>
                              </td>
                              <td className="py-3 px-5">
                                {renderStars(req.matchStarRating)}
                              </td>
                              <td
                                className={`py-3 px-5 ${matchMissingColumnClass}`}
                              >
                                {req.matchMissingFeatures?.length ? (
                                  <div className="inline-flex min-w-[112px] shrink-0 flex-nowrap items-center gap-2">
                                    {req.matchMissingFeatures
                                      .slice(0, 3)
                                      .map((feature) => {
                                        const iconSrc =
                                          missingFeatureIcons[feature.code];

                                        if (!iconSrc) return null;

                                        return (
                                          <Image
                                            key={feature.code}
                                            src={iconSrc}
                                            alt={feature.label}
                                            width={34}
                                            height={34}
                                            title={feature.description}
                                            unoptimized
                                            style={
                                              missingFeatureIconVisibilityStyle
                                            }
                                            className="h-8 w-8 shrink-0 object-contain"
                                          />
                                        );
                                      })}
                                  </div>
                                ) : (
                                  <span className="whitespace-nowrap text-xs font-semibold text-amber-500">
                                    PERFECT MATCH
                                  </span>
                                )}
                              </td>
                              <td
                                className={`py-3 px-5 ${matchPreferenceColumnClass}`}
                              >
                                {req.matchPreferenceMatches ? (
                                  <div className="inline-flex min-w-[106px] shrink-0 flex-nowrap items-center gap-1.5">
                                    {req.matchPreferenceMatches.map(
                                      (matched, index) => (
                                        <Image
                                          key={index}
                                          src={
                                            matched
                                              ? preferenceFilledIconSrc
                                              : preferenceEmptyIconSrc
                                          }
                                          alt=""
                                          aria-hidden="true"
                                          width={20}
                                          height={20}
                                          title={formatPriorityTitle(
                                            index,
                                            req.preferences[index],
                                          )}
                                          className="h-5 w-5 shrink-0"
                                        />
                                      ),
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="py-3 px-5">
                                <div className="font-medium text-gray-900">
                                  {formatRenterDisplayName(req.renterName)}
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-3 px-5">
                                <div className="text-gray-900">
                                  {req.requestName}
                                </div>
                              </td>
                              <td className="py-3 px-5">
                                <div className="font-medium text-gray-900">
                                  {formatRenterDisplayName(req.renterName)}
                                </div>
                              </td>
                            </>
                          )}
                          <td className="py-3 px-5">
                            <div className="inline-flex flex-col items-start gap-1">
                              <span className="inline-flex w-fit items-center whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                                {req.scopeLabel}
                              </span>
                              {req.scopeLabel === "Upcoming (M)" &&
                              req.registeredAgentForView?.fullName ? (
                                <span className="self-stretch text-center text-xs font-medium text-blue-600 whitespace-nowrap">
                                  {formatRenterDisplayName(
                                    req.registeredAgentForView.fullName,
                                  )}
                                </span>
                              ) : null}
                              {req.scopeLabel === "Upcoming (M)" &&
                              req.matchedByAgent?.fullName &&
                              isCurrentAgentsRequest ? (
                                <span className="self-stretch text-center text-xs font-medium text-blue-600 whitespace-nowrap">
                                  {formatRenterDisplayName(
                                    req.matchedByAgent.fullName,
                                  )}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="py-3 px-5">
                            {isCurrentAgentsRequest ? (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleShare(req)}
                                  disabled={
                                    mutatingShareId === req.id ||
                                    isVisibilityLocked ||
                                    isShareDisabledByDocuments
                                  }
                                  className="inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                  aria-label={`Toggle visibility for ${req.requestName}`}
                                  title={visibilityToggleTitle}
                                >
                                  <span
                                    className={`text-xs font-medium ${
                                      req.isPrivateVisibility
                                        ? "text-gray-700"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    Private
                                  </span>
                                  <span
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                                      req.isPrivateVisibility
                                        ? "bg-gray-300"
                                        : "bg-blue-400"
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                                        req.isPrivateVisibility
                                          ? "translate-x-1"
                                          : "translate-x-5"
                                      }`}
                                    />
                                  </span>
                                  <span
                                    className={`text-xs font-medium ${
                                      req.isPrivateVisibility
                                        ? "text-gray-400"
                                        : "text-emerald-700"
                                    }`}
                                  >
                                    Shared
                                  </span>
                                </button>
                                {isVisibilityLocked ? (
                                  <Lock
                                    className="h-4 w-4 text-gray-500"
                                    aria-hidden="true"
                                  />
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-gray-700">
                                {visibility || "Not specified"}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-5">
                            <div className="text-gray-900">
                              {req.boroughsLabel}
                            </div>
                          </td>
                          <td className="py-3 px-5">{req.priceMaxLabel}</td>
                          <td className="py-3 px-5">{req.bedsBathsLabel}</td>
                          <td className="py-3 px-5">
                            {(() => {
                              const rawStatus = isMatchResultsMode
                                ? req.alreadyMatchedByAgent
                                  ? "matched"
                                  : req.raw?.listingStatus ||
                                    req.raw?.status ||
                                    "Available"
                                : req.raw?.status || req.status || "unknown";
                              const statusText =
                                typeof rawStatus === "string"
                                  ? rawStatus
                                      .split(/[\s-_]+/)
                                      .filter(Boolean)
                                      .map(
                                        (segment) =>
                                          segment[0]?.toUpperCase() +
                                          segment.slice(1),
                                      )
                                      .join(" ")
                                  : String(rawStatus);
                              const isActiveStatus = /active|available/i.test(
                                statusText,
                              );
                              const isMatchedStatus = /matched/i.test(
                                statusText,
                              );
                              return (
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    isMatchedStatus
                                      ? "bg-green-100 text-green-700"
                                      : isActiveStatus
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {statusText}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="py-3 px-5">
                            {shouldShowRegistrationDisclosure ? (
                              <div className="flex items-center justify-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={req.registrationDisclosureConfirmed}
                                  disabled={
                                    req.registrationDisclosureConfirmed ||
                                    mutatingRegistrationDisclosureId === req.id
                                  }
                                  onChange={(event) => {
                                    if (event.target.checked) {
                                      handleConfirmRegistrationDisclosure(req);
                                    }
                                  }}
                                  aria-label={`Confirm Registration / Disclosure for ${req.requestName}`}
                                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                                />
                                {isRegistrationDisclosureLocked ? (
                                  <Lock
                                    className="h-4 w-4 text-gray-500"
                                    aria-hidden="true"
                                  />
                                ) : null}
                              </div>
                            ) : null}
                          </td>
                          <td className="py-3 px-5 flex justify-end gap-2">
                            {isCurrentAgentsRequest &&
                            req.hasOwnerRepresentationMatches ? (
                              <span
                                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-emerald-900 px-2 text-xs font-bold text-white ${
                                  req.hasNewOwnerRepresentationMatches
                                    ? "opacity-100"
                                    : "opacity-20"
                                }`}
                                title={
                                  req.hasNewOwnerRepresentationMatches
                                    ? "New landlord-agent match"
                                    : "Viewed landlord-agent match"
                                }
                              >
                                L!
                              </span>
                            ) : null}
                            {isCurrentAgentsRequest ? (
                              <button
                                onClick={() => openArchiveDialog(req)}
                                title="Archive request"
                                disabled={isArchivedForAgent}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Image
                                  src="/archive-icon.png"
                                  alt=""
                                  aria-hidden="true"
                                  width={20}
                                  height={20}
                                  className="h-5 w-5 shrink-0 object-contain"
                                />
                              </button>
                            ) : null}
                            {isCurrentAgentsRequest &&
                            req.scopeLabel === "Upcoming (M)" &&
                            req.matchedByAgent?.fullName ? (
                              <>
                                <button
                                  onClick={() => openUnmatchDialog(req)}
                                  title="Unmatch request"
                                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-100 transition hover:bg-red-50"
                                >
                                  <Image
                                    src="/icons/Unmatch.png"
                                    alt=""
                                    aria-hidden="true"
                                    width={20}
                                    height={20}
                                    className="h-5 w-5 shrink-0 object-contain"
                                  />
                                </button>
                                <button
                                  onClick={() => openRequestUpdateDialog(req)}
                                  title="Request update"
                                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-100 transition hover:bg-blue-50"
                                >
                                  <Image
                                    src="/icons/Ask-for-update.png"
                                    alt=""
                                    aria-hidden="true"
                                    className="h-5 w-5 shrink-0 object-contain"
                                  />
                                </button>
                              </>
                            ) : null}
                            <button
                              onClick={() => handleView(req)}
                              title="View request"
                              className="cursor-pointer rounded-full bg-gray-100 p-2 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-gray-200 hover:shadow-sm"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 text-gray-600">
              {isMatchResultsMode
                ? "No renter requests matched this apartment."
                : showAllMarketReferrals
                  ? "No All-Market referrals available right now."
                  : "No renter requests match the current filters on this page."}
            </div>
          )}

          {isMatchResultsMode ? (
            <div className="mt-5 space-y-4">
              <button
                type="button"
                onClick={handleMatchChecked}
                disabled={!selectedRequestIds.length || isMatchingChecked}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-blue-600 disabled:hover:shadow-none"
              >
                {isMatchingChecked
                  ? bulkActionLoadingLabel
                  : bulkActionIdleLabel}
              </button>

              <div>
                <button
                  type="button"
                  onClick={() => setIsLegendOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700"
                >
                  ICONS LEGEND
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition ${
                      isLegendOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isLegendOpen ? (
                  <div className="mt-4 grid grid-cols-1 gap-x-12 gap-y-4 text-xs text-gray-500 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {missingFeatureLegend.map(([code, label, description]) => (
                      <div key={code} className="flex items-start gap-3">
                        <Image
                          src={missingFeatureIcons[code]}
                          alt=""
                          aria-hidden="true"
                          width={44}
                          height={44}
                          unoptimized
                          style={missingFeatureIconVisibilityStyle}
                          className="h-10 w-10 shrink-0 object-contain"
                        />
                        <div>
                          <p className="font-semibold text-gray-700">{label}</p>
                          <p>{description}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-1">
                        {[true, false, false, false].map((matched, index) => (
                          <Image
                            key={index}
                            src={
                              matched
                                ? preferenceFilledIconSrc
                                : preferenceEmptyIconSrc
                            }
                            alt=""
                            aria-hidden="true"
                            width={20}
                            height={20}
                            className="h-5 w-5"
                          />
                        ))}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">
                          Request 4 Top Preferences
                        </p>
                        <p>Gold is present; Grey is not present.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          aria-hidden="true"
                          className="h-5 w-5 border-2 border-blue-600 bg-white"
                        />
                        <span
                          aria-hidden="true"
                          className="h-5 w-5 border border-gray-300 bg-white"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">
                          Previously Matched / Not Yet Matched
                        </p>
                        <p>Blue frame - Previously matched request</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {pagination && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span>
                  Showing {filteredRequests.length} item
                  {filteredRequests.length === 1 ? "" : "s"}
                </span>
                <span className="text-gray-300">•</span>
                <span>Total items {totalItems}</span>
                <span className="text-gray-300">•</span>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPrev}
                  className="p-2 rounded-full border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {pages.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageSelect(pageNumber)}
                    className={`min-w-[32px] px-2 py-1 rounded-full border text-sm font-medium transition ${
                      pageNumber === currentPage
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  onClick={handleNextPage}
                  disabled={!pagination.hasNext}
                  className="p-2 rounded-full border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {isFilterOpen ? (
        <FilterModal
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onApply={handleApplyFilters}
          onReset={handleResetMatchFilters}
          initialFilters={matchSearchFilters ?? filters}
          resultCount={filteredRequests.length}
          variant="matchRequests"
          isApplying={isLoading}
        />
      ) : null}
      {isBulkRepresentationOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center gap-3">
              <Image
                src="/Logo_1.svg"
                alt="BeforeListed"
                width={180}
                height={52}
                className="h-auto w-[160px] sm:w-[180px]"
                priority
              />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Which side would you like to represent?
            </h2>
            <p className="mb-5 text-sm text-gray-600">
              This will apply to {selectedRequestCount} selected request
              {selectedRequestCount === 1 ? "" : "s"}.
            </p>
            <div className="space-y-4">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 text-sm text-gray-800">
                <input
                  type="radio"
                  name="bulk-representation-type"
                  value="owner_representation"
                  checked={bulkRepresentationType === "owner_representation"}
                  onChange={() =>
                    setBulkRepresentationType("owner_representation")
                  }
                  className="h-4 w-4 text-blue-600"
                />
                <span>I intend to represent the owner</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 text-sm text-gray-800">
                <input
                  type="radio"
                  name="bulk-representation-type"
                  value="renter_representation"
                  checked={bulkRepresentationType === "renter_representation"}
                  onChange={() =>
                    setBulkRepresentationType("renter_representation")
                  }
                  className="h-4 w-4 text-blue-600"
                />
                <span>I intend to represent the renter</span>
              </label>
            </div>
            {bulkRepresentationType ? (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  Add Opportunity Details
                </h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {opportunityDetailsHelperText[bulkRepresentationType]}
                </p>
                <div className="relative mt-3 rounded-lg bg-white">
                  {hasRiskyBulkOpportunityDetails ? (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 whitespace-pre-wrap break-words rounded-lg px-3 py-2 pb-7 text-sm leading-5 text-gray-800"
                    >
                      {renderHighlightedOpportunityDetails(
                        bulkOpportunityDetails,
                      )}
                    </div>
                  ) : null}
                  <textarea
                    rows={3}
                    maxLength={OPPORTUNITY_DETAILS_MAX_LENGTH}
                    value={bulkOpportunityDetails}
                    onChange={(event) =>
                      setBulkOpportunityDetails(
                        event.target.value.slice(
                          0,
                          OPPORTUNITY_DETAILS_MAX_LENGTH,
                        ),
                      )
                    }
                    placeholder="e.g., 123 W 85th St - Available Thursday at 3pm."
                    aria-invalid={hasRiskyBulkOpportunityDetails}
                    className={`relative z-10 w-full resize-none rounded-lg border px-3 py-2 pb-7 text-sm leading-5 outline-none transition focus:ring-2 ${
                      hasRiskyBulkOpportunityDetails
                        ? "border-red-300 bg-transparent text-transparent caret-gray-800 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 text-gray-800 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                  />
                  <span
                    className={`absolute bottom-2 right-3 z-20 text-xs ${bulkOpportunityDetailsCounterClass}`}
                  >
                    {bulkOpportunityDetailsCount} /{" "}
                    {OPPORTUNITY_DETAILS_MAX_LENGTH}
                  </span>
                </div>
                {hasRiskyBulkOpportunityDetails ? (
                  <p className="mt-2 text-xs leading-5 text-red-600">
                    {OPPORTUNITY_DETAILS_RISKY_WORDING_MESSAGE}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetBulkMatchFlow}
                disabled={isMatchingChecked}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (
                    !bulkRepresentationType ||
                    hasRiskyBulkOpportunityDetails
                  ) {
                    return;
                  }

                  if (bulkRepresentationType === "owner_representation") {
                    handleSubmitBulkMatch("owner_representation");
                    return;
                  }

                  setIsBulkRepresentationOpen(false);
                  setIsBulkConfirmChecked(false);
                  setIsBulkConfirmOpen(true);
                }}
                disabled={
                  !bulkRepresentationType ||
                  hasRiskyBulkOpportunityDetails ||
                  isMatchingChecked
                }
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isMatchingChecked ? "Matching..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isBulkConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Confirm Match Request &ndash; {bulkConfirmScopeLabel}
            </h2>
            {bulkConfirmScopeType === "all-market" ? (
              <div className="space-y-3 text-sm text-gray-700 mb-4">
                <p>
                  By proceeding, you confirm that you intend to represent the
                  selected renter{selectedRequestCount === 1 ? "" : "s"} with
                  full-service, full-market representation, including agent
                  guidance, landlord and building screening, scheduling,
                  coordination, and ongoing support throughout the rental
                  process.
                </p>
                <p>
                  You will verify the renter&apos;s Corcoran agency disclosures
                  and client registration prior to taking any action on the
                  renter&apos;s behalf.
                </p>
              </div>
            ) : bulkConfirmScopeType === "mixed" ? (
              <>
                <p className="text-sm text-gray-700 mb-3">
                  By proceeding, you confirm that:
                </p>
                <ul className="text-sm text-gray-700 space-y-2 mb-4 list-disc pl-5">
                  <li>
                    For All Market requests, you intend to provide full-service,
                    full-market representation, including agent guidance,
                    landlord and building screening, scheduling, coordination,
                    and ongoing support throughout the rental process.
                  </li>
                  <li>
                    You will verify each renter&apos;s Corcoran agency
                    disclosures and client registration prior to taking any
                    action on the renter&apos;s behalf.
                  </li>
                  <li>
                    For Upcoming requests, any information about the apartment
                    being presented to the renter arose from tenant-initiated
                    outreach or follow-up inquiries made in response to renter
                    requests.
                  </li>
                  <li>
                    For Upcoming requests, you have not been retained by the
                    owner to procure a tenant or market this apartment.
                  </li>
                  <li>
                    For Upcoming requests, to the best of your knowledge, this
                    apartment was not publicly advertised on StreetEasy, Zillow,
                    or the REBNY Listing Service (RLS) at the time of this
                    match.
                  </li>
                  <li>
                    If you are the agent identified in the renter&apos;s
                    disclosure, you may pursue this opportunity on the
                    renter&apos;s behalf.
                  </li>
                  <li>
                    If you are not identified in the renter&apos;s disclosure,
                    you will not take steps on the renter&apos;s behalf until
                    you are properly identified through an additional agency
                    disclosure signed by the renter.
                  </li>
                </ul>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-700 mb-3">
                  By proceeding, you confirm that:
                </p>
                <ul className="text-sm text-gray-700 space-y-2 mb-4 list-disc pl-5">
                  <li>
                    You will verify the renter&apos;s Corcoran agency
                    disclosures and client registration prior to taking any
                    action on the renter&apos;s behalf.
                  </li>
                  <li>
                    Any information about the apartment being presented to this
                    renter arose from tenant-initiated outreach or follow-up
                    inquiries made in response to renter requests.
                  </li>
                  <li>
                    You have not been retained by the owner to procure a tenant
                    or market this apartment.
                  </li>
                  <li>
                    To the best of your knowledge, this apartment was not
                    publicly advertised on StreetEasy, Zillow, or the REBNY
                    Listing Service (RLS) at the time of this match.
                  </li>
                  <li>
                    If you are the agent identified in the renter&apos;s
                    disclosure, you may pursue this opportunity on the
                    renter&apos;s behalf.
                  </li>
                  <li>
                    If you are not identified in the renter&apos;s disclosure,
                    you will not take steps on the renter&apos;s behalf until
                    you are properly identified through an additional agency
                    disclosure signed by the renter.
                  </li>
                </ul>
              </>
            )}
            <label className="flex items-start gap-2 text-sm text-gray-700 mb-6">
              <input
                type="checkbox"
                checked={isBulkConfirmChecked}
                onChange={(event) =>
                  setIsBulkConfirmChecked(event.target.checked)
                }
                className="mt-1 h-4 w-4 text-blue-600"
              />
              <span className="font-semibold">
                {bulkConfirmScopeType === "all-market"
                  ? "Confirm Full-Service Full-Market Representation"
                  : "I confirm the above and approve proceeding with this match."}
              </span>
            </label>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsBulkConfirmOpen(false);
                  setIsBulkRepresentationOpen(true);
                }}
                disabled={isMatchingChecked}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isBulkConfirmChecked || hasRiskyBulkOpportunityDetails) {
                    return;
                  }
                  handleSubmitBulkMatch("renter_representation");
                }}
                disabled={
                  !isBulkConfirmChecked ||
                  hasRiskyBulkOpportunityDetails ||
                  isMatchingChecked
                }
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isMatchingChecked ? "Matching..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {archiveTarget ? (
        <ArchiveRequestDialog
          mode="registered"
          renterName={archiveTarget.renterName}
          selectedReason={archiveReason}
          isSubmitting={isArchiving}
          onReasonChange={setArchiveReason}
          onCancel={closeArchiveDialog}
          onConfirm={handleArchiveRequest}
        />
      ) : null}
      {requestUpdateTarget ? (
        <RequestUpdateDialog
          matchedAgentFullName={requestUpdateTarget.matchedByAgent?.fullName}
          renterFullName={requestUpdateTarget.renterName}
          isSubmitting={isRequestUpdating}
          onCancel={closeRequestUpdateDialog}
          onConfirm={handleRequestUpdateConfirm}
        />
      ) : null}
      {unmatchTarget ? (
        <UnmatchRequestDialog
          matchedAgentFullName={unmatchTarget.matchedByAgent?.fullName}
          renterFullName={unmatchTarget.renterName}
          isSubmitting={isUnmatching}
          onCancel={closeUnmatchDialog}
          onConfirm={handleUnmatchConfirm}
        />
      ) : null}
    </section>
  );
}
