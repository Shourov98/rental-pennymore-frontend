"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Eye, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { CenteredPageSpinner } from "@/components/ui/centered-page-spinner";
import FilterModal, { type FilterType } from "@/components/modals/FilterModals";
import ArchiveRequestDialog, {
  type ArchiveReason,
} from "@/components/agent/ArchiveRequestDialog";
import RequestUpdateDialog from "@/components/agent/RequestUpdateDialog";
import UnmatchRequestDialog from "@/components/agent/UnmatchRequestDialog";
import { RootState } from "@/store/store";
import {
  API_BASE_URL,
  ApiAgentMatchesResponse,
  NormalizedAgentMatch,
  cacheAgentMatches,
  cacheSingleAgentMatch,
  normalizeAgentMatch,
} from "./utils";
import {
  buildMatchSearchPayload,
  getEmptyFilters,
  matchesAgentFilters,
  sanitizeFilters,
  writeStoredAgentListState,
} from "../requestNavigation";
import { isUpcomingScope } from "@/lib/scope";

const FILTERS_STORAGE_KEY = "agent-matches-filters";
const LIST_STATE_STORAGE_KEY = "agent-matches-list-state";
const defaultFilters: FilterType = getEmptyFilters();
const NAVIGATION_STORAGE_KEY = "agent-matches-navigation";

const starIconSrc = "/icons/match/star-filled.svg";
const starEmptyIconSrc = "/icons/match/star-empty.svg";
const preferenceFilledIconSrc = "/icons/match/preference-filled.svg";
const preferenceEmptyIconSrc = "/icons/match/preference-empty.svg";
const matchMissingColumnClass = "min-w-[170px]";
const matchPreferenceColumnClass = "min-w-[175px]";

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

const formatPriorityTitle = (index: number, preference?: string) => {
  const priorityLabel = `Priority ${index + 1}`;
  const preferenceLabel = preference?.trim();

  return preferenceLabel
    ? `${priorityLabel} / ${preferenceLabel}`
    : priorityLabel;
};

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
  request: NormalizedAgentMatch,
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

const formatMissingMatchFieldsMessage = (missingFields: string[]) => {
  const fields = missingFields.map((field, index) =>
    field === "move-in dates" && index > 0 ? `and ${field}` : field,
  );

  return `Please enter ${fields.join(", ")} before matching.`;
};

const formatRenterDisplayName = (fullName?: string | null) => {
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "Not specified";
  if (parts.length === 1) return parts[0];

  return `${parts[0]} ${parts[parts.length - 1][0]}`;
};

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
      };
    }
    const parsed = JSON.parse(stored) as Partial<{
      page: number;
      showOwnReferrals: boolean;
      showAllMarketReferrals: boolean;
      isMatchResultsMode: boolean;
      matchSearchFilters: FilterType | null;
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
    };
  } catch {
    return {
      page: 1,
      showOwnReferrals: false,
      showAllMarketReferrals: false,
      isMatchResultsMode: false,
      matchSearchFilters: null,
    };
  }
};

export default function AgentMatchesPage() {
  const router = useRouter();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const currentAgentId = useSelector(
    (state: RootState) => state.auth.user?._id,
  );

  const [requests, setRequests] = useState<NormalizedAgentMatch[]>([]);
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
    useState<NormalizedAgentMatch | null>(null);
  const [archiveReason, setArchiveReason] = useState<ArchiveReason | "">("");
  const [isArchiving, setIsArchiving] = useState(false);
  const [requestUpdateTarget, setRequestUpdateTarget] =
    useState<NormalizedAgentMatch | null>(null);
  const [unmatchTarget, setUnmatchTarget] =
    useState<NormalizedAgentMatch | null>(null);
  const [isRequestUpdating, setIsRequestUpdating] = useState(false);
  const [isUnmatching, setIsUnmatching] = useState(false);
  // Bumped after mutations like unmatch so the list-fetch effect re-runs
  // and replaces the local cache with the server's fresh state. Without
  // this, an unmatch on an "Upcoming (M)" request would locally filter
  // the request out and the agent would need a hard refresh to see it
  // again as plain "All Market".
  const [refetchKey, setRefetchKey] = useState(0);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<
    ApiAgentMatchesResponse["pagination"]
  >({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);

  const limit = 10;

  useEffect(() => {
    setFilters(readStoredFilters());
    const {
      page: storedPage,
      showOwnReferrals: storedShowOwnReferrals,
      showAllMarketReferrals: storedShowAllMarketReferrals,
      isMatchResultsMode: storedIsMatchResultsMode,
      matchSearchFilters: storedMatchSearchFilters,
    } = readStoredListState();
    setPage(storedPage);
    setShowOwnReferrals(storedShowOwnReferrals);
    setShowAllMarketReferrals(storedShowAllMarketReferrals);
    setIsMatchResultsMode(storedIsMatchResultsMode);
    setMatchSearchFilters(storedMatchSearchFilters);
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
      }),
    );
  }, [
    isStateRestored,
    isMatchResultsMode,
    matchSearchFilters,
    page,
    showAllMarketReferrals,
    showOwnReferrals,
  ]);

  useEffect(() => {
    if (!isStateRestored) return;
    const controller = new AbortController();

    const fetchRequests = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        appendFilterParams(params, filters);
        if (showAllMarketReferrals) {
          params.set("allMarketReferrals", "true");
        }

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
                `${API_BASE_URL}/pre-market/agent/all-requests?${params.toString()}`,
                {
                  method: "GET",
                  headers,
                  signal: controller.signal,
                },
              );

        const data: ApiAgentMatchesResponse = await response
          .json()
          .catch(() => ({}) as ApiAgentMatchesResponse);

        if (!response.ok || data?.success === false) {
          throw new Error(
            data?.message ||
              "We couldn't load matched requests right now. Please try again.",
          );
        }

        const normalized = (data.data ?? []).map((request) =>
          normalizeAgentMatch(request, {
            useCurrentScope: isMatchResultsMode,
          }),
        );
        setRequests(normalized);
        setPagination(data.pagination);
        cacheAgentMatches(normalized);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error
            ? err.message
            : "We couldn't load matched requests right now. Please try again.";
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
    isStateRestored,
    matchSearchFilters,
    page,
    refetchKey,
    showAllMarketReferrals,
  ]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) =>
      matchesAgentFilters(
        req.raw,
        filters,
        showOwnReferrals,
        currentAgentId,
        false,
      ),
    );
  }, [
    currentAgentId,
    filters,
    requests,
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
      showOwnReferrals,
      showAllMarketReferrals,
    });
  }, [
    filteredRequests,
    filters,
    isStateRestored,
    limit,
    page,
    pagination?.totalPages,
    showAllMarketReferrals,
    showOwnReferrals,
  ]);

  const handleView = (req: NormalizedAgentMatch) => {
    cacheSingleAgentMatch(req);
    router.push(`/agent/matches/${req.id}`);
  };

  const handleToggleRequestSelection = (requestId: string) => {
    setSelectedRequestIds((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId],
    );
  };

  const handleToggleSelectAll = () => {
    const visibleIds = filteredRequests.map((req) => req.id);
    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedRequestIds.includes(id));
    setSelectedRequestIds(allSelected ? [] : visibleIds);
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
    setIsFilterOpen(true);
  };

  const handleToggleShare = async (request: NormalizedAgentMatch) => {
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
        cacheAgentMatches(next);
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
    request: NormalizedAgentMatch,
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
        cacheAgentMatches(next);
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

  const openArchiveDialog = (request: NormalizedAgentMatch) => {
    setArchiveTarget(request);
    setArchiveReason("");
    setError(null);
  };

  const closeArchiveDialog = () => {
    if (isArchiving) return;
    setArchiveTarget(null);
    setArchiveReason("");
  };

  const openRequestUpdateDialog = (request: NormalizedAgentMatch) => {
    setRequestUpdateTarget(request);
    setError(null);
  };

  const closeRequestUpdateDialog = () => {
    if (isRequestUpdating) return;
    setRequestUpdateTarget(null);
  };

  const openUnmatchDialog = (request: NormalizedAgentMatch) => {
    setUnmatchTarget(request);
    setError(null);
  };

  const closeUnmatchDialog = () => {
    if (isUnmatching) return;
    setUnmatchTarget(null);
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
        cacheAgentMatches(next);
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

  const handleUnmatchConfirm = async () => {
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
          body: JSON.stringify({ sendEmailNotice: false }),
        },
      );
      const data = await response
        .json()
        .catch(() => ({}) as { success?: boolean; message?: string });

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "We couldn't unmatch this request.");
      }

      // On a successful unmatch, do NOT locally filter the request out of the
      // list. An "Upcoming (M)" request would otherwise disappear from the
      // agent's view (the client's matched-scope filter hides it once the
      // grant is gone) and only come back after a hard refresh. Instead,
      // bump refetchKey so the list-fetch effect re-runs and replaces the
      // local cache with the server's fresh state — the request stays
      // visible, just under its "All Market" label.
      setRefetchKey((key) => key + 1);
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
  const handlePageSelect = (value: number) => {
    if (value === currentPage) return;
    setPage(value);
  };

  if (isLoading) {
    return <CenteredPageSpinner />;
  }

  return (
    <section className="bg-gray-50 px-4 lg:px-6 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-5 rounded-xl shadow-sm gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Matched Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pre-market renter requests matched to you.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setPage(1);
                setShowAllMarketReferrals((prev) => !prev);
              }}
              className={`flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 ${
                showAllMarketReferrals
                  ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-sm"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:shadow-sm"
              }`}
              title={
                showAllMarketReferrals
                  ? "Show all matched requests"
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
          No matched requests available right now.
        </div>
      ) : (
        <>
          {hasFilteredResults ? (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table
                  className={`w-full text-sm ${
                    isMatchResultsMode ? "min-w-[1880px]" : "min-w-[1240px]"
                  }`}
                >
                  <thead className="bg-blue-100 text-gray-800">
                    <tr>
                      <th className="py-3 px-5 text-left">Date</th>
                      {isMatchResultsMode ? (
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
                      ) : null}
                      <th className="py-3 px-5 text-left">Request</th>
                      {isMatchResultsMode ? (
                        <>
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
                        </>
                      ) : null}
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
                  </thead>

                  <tbody>
                    {filteredRequests.map((req) => {
                      const isCurrentAgentsRequest =
                        isCurrentAgentRegisteredForRequest(req, currentAgentId);
                      const currentAgentHasMatchedAccess = [
                        "free",
                        "paid",
                        "approved",
                        "matched",
                      ].includes(
                        String(
                          req.raw?.grantAccessStatus ?? req.raw?.status ?? "",
                        ).toLowerCase(),
                      );
                      const shouldShowRegisteredAgentName =
                        req.scopeLabel === "Upcoming (M)" &&
                        !isCurrentAgentsRequest &&
                        Boolean(req.registeredAgentForView?.fullName);
                      const shouldShowMatchedAgentName =
                        req.scopeLabel === "Upcoming (M)" &&
                        isCurrentAgentsRequest &&
                        Boolean(req.matchedByAgent?.fullName);
                      const canUnmatchRequest =
                        req.scopeLabel === "Upcoming (M)" &&
                        isCurrentAgentsRequest;
                      const shareConsent = req.raw?.shareConsent;
                      const visibility = req.raw?.visibility;
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
                            <td className="py-3 px-5">
                              <input
                                type="checkbox"
                                checked={selectedRequestIds.includes(req.id)}
                                onChange={() =>
                                  handleToggleRequestSelection(req.id)
                                }
                                aria-label={`Select ${req.requestName}`}
                                className={`h-5 w-5 rounded text-blue-600 focus:ring-blue-500 ${
                                  req.raw?.alreadyMatchedByAgent
                                    ? "border-2 border-blue-600"
                                    : "border border-gray-300"
                                }`}
                                style={
                                  req.raw?.alreadyMatchedByAgent
                                    ? {
                                        borderColor: "#2563eb",
                                        boxShadow: "0 0 0 2px #2563eb",
                                      }
                                    : undefined
                                }
                              />
                            </td>
                          ) : null}
                          <td className="py-3 px-5">
                            <div className="text-gray-900">
                              {req.requestName}
                            </div>
                          </td>
                          {isMatchResultsMode ? (
                            <>
                              <td className="py-3 px-5">
                                {renderStars(req.raw?.matchStarRating)}
                              </td>
                              <td
                                className={`py-3 px-5 ${matchMissingColumnClass}`}
                              >
                                {Array.isArray(req.raw?.matchMissingFeatures) &&
                                req.raw?.matchMissingFeatures.length ? (
                                  <div className="inline-flex min-w-[112px] shrink-0 flex-nowrap items-center gap-2">
                                    {req.raw.matchMissingFeatures
                                      .slice(0, 3)
                                      .map(
                                        (feature: {
                                          code: string;
                                          label: string;
                                          description?: string;
                                        }) => {
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
                                        },
                                      )}
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
                                {Array.isArray(
                                  req.raw?.matchPreferenceMatches,
                                ) ? (
                                  <div className="inline-flex min-w-[106px] shrink-0 flex-nowrap items-center gap-1.5">
                                    {(
                                      req.raw
                                        .matchPreferenceMatches as boolean[]
                                    ).map((matched, index: number) => (
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
                                          req.preferences?.[index],
                                        )}
                                        className="h-5 w-5 shrink-0"
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            </>
                          ) : null}
                          <td className="py-3 px-5">
                            <div className="font-medium text-gray-900">
                              {formatRenterDisplayName(req.renterName)}
                            </div>
                          </td>
                          <td className="py-3 px-5">
                            <div className="inline-flex flex-col items-start gap-1">
                              {shouldShowRegisteredAgentName ? (
                                <>
                                  <span className="self-stretch text-center text-xs font-medium text-blue-600 whitespace-nowrap">
                                    {formatRenterDisplayName(
                                      req.registeredAgentForView?.fullName,
                                    )}
                                  </span>
                                  <span className="inline-flex w-fit items-center whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                                    {req.scopeLabel}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="inline-flex w-fit items-center whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                                    {req.scopeLabel}
                                  </span>
                                  {shouldShowMatchedAgentName ? (
                                    <span className="self-stretch text-center text-xs font-medium text-blue-600 whitespace-nowrap">
                                      {formatRenterDisplayName(
                                        req.matchedByAgent?.fullName,
                                      )}
                                    </span>
                                  ) : null}
                                </>
                              )}
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
                          <td className="py-3 px-5 text-gray-900">
                            {req.boroughsLabel}
                          </td>
                          <td className="py-3 px-5">{req.priceMaxLabel}</td>
                          <td className="py-3 px-5">{req.bedsBathsLabel}</td>
                          <td className="py-3 px-5">
                            {(() => {
                              const normalizedBackendStatus = req.status
                                ?.trim()
                                .toLowerCase();
                              const backendStatusText =
                                normalizedBackendStatus === "matched"
                                  ? "Matched"
                                  : normalizedBackendStatus === "open"
                                    ? "Open"
                                    : null;
                              const normalizedAgentGrantStatus = String(
                                req.raw?.grantAccessStatus ??
                                  req.raw?.status ??
                                  "",
                              )
                                .trim()
                                .toLowerCase();
                              // Upcoming / Upcoming (M) requests stay
                              // matchable even after the agent previously
                              // matched. Suppress the "Matched" badge so the
                              // agent doesn't see a stale "Already Matched"
                              // signal.
                              const rowIsUpcomingLike = isUpcomingScope(
                                req.raw?.scope ?? req.scopeLabel,
                              );
                              const matchedFromGrantStatus =
                                !rowIsUpcomingLike &&
                                req.raw?.representation_type !==
                                  "owner_representation" &&
                                [
                                  "pending",
                                  "approved",
                                  "free",
                                  "paid",
                                ].includes(normalizedAgentGrantStatus);
                              const fallbackIsMatchedByAgent =
                                !rowIsUpcomingLike &&
                                (Boolean(req.raw?.alreadyMatchedByAgent) ||
                                  matchedFromGrantStatus ||
                                  Boolean(
                                    currentAgentId &&
                                    req.matchedByAgent?.agentId &&
                                    String(req.matchedByAgent.agentId) ===
                                      String(currentAgentId),
                                  ));
                              const statusText =
                                backendStatusText ??
                                (fallbackIsMatchedByAgent
                                  ? "Matched"
                                  : "Open");
                              const isMatchedByAgent =
                                statusText === "Matched";
                              return (
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    isMatchedByAgent
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
                          </td>
                          <td className="py-3 px-5 flex justify-end gap-2">
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
                            {canUnmatchRequest ? (
                              <button
                                onClick={() => openUnmatchDialog(req)}
                                title="Unmatch request"
                                aria-label={`Unmatch ${req.requestName}`}
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
                            ) : null}
                            {shouldShowMatchedAgentName ? (
                                <button
                                  onClick={() => openRequestUpdateDialog(req)}
                                  title="Request update"
                                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-100 transition hover:bg-blue-50"
                                >
                                  <Image
                                    src="/icons/Ask-for-update.png"
                                    alt=""
                                    aria-hidden="true"
                                    width={20}
                                    height={20}
                                    className="h-5 w-5 shrink-0 object-contain"
                                  />
                                </button>
                            ) : null}
                            <button
                              onClick={() => handleView(req)}
                              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
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
              {showAllMarketReferrals
                ? "No All-Market referrals available right now."
                : "No matched requests match the current filters on this page."}
            </div>
          )}

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
      {archiveTarget ? (
        <ArchiveRequestDialog
          mode="matched"
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
