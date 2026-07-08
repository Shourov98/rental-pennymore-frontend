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
  getEmptyFilters,
  matchesAgentFilters,
  sanitizeFilters,
  writeStoredAgentListState,
} from "../requestNavigation";

const FILTERS_STORAGE_KEY = "agent-matches-filters";
const LIST_STATE_STORAGE_KEY = "agent-matches-list-state";
const defaultFilters: FilterType = getEmptyFilters();
const NAVIGATION_STORAGE_KEY = "agent-matches-navigation";

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
    };
  }

  try {
    const stored = sessionStorage.getItem(LIST_STATE_STORAGE_KEY);
    if (!stored) {
      return {
        page: 1,
        showOwnReferrals: false,
      };
    }
    const parsed = JSON.parse(stored) as Partial<{
      page: number;
      showOwnReferrals: boolean;
    }>;
    return {
      page:
        typeof parsed.page === "number" && parsed.page > 0 ? parsed.page : 1,
      showOwnReferrals: Boolean(parsed.showOwnReferrals),
    };
  } catch {
    return {
      page: 1,
      showOwnReferrals: false,
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showOwnReferrals, setShowOwnReferrals] = useState(false);
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
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<
    ApiAgentMatchesResponse["pagination"]
  >({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const limit = 10;

  useEffect(() => {
    setFilters(readStoredFilters());
    const {
      page: storedPage,
      showOwnReferrals: storedShowOwnReferrals,
    } = readStoredListState();
    setPage(storedPage);
    setShowOwnReferrals(storedShowOwnReferrals);
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
      JSON.stringify({ page, showOwnReferrals }),
    );
  }, [isStateRestored, page, showOwnReferrals]);

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

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

        const response = await fetch(
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

        const normalized = (data.data ?? []).map(normalizeAgentMatch);
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
  }, [accessToken, isStateRestored, page]);

  const filteredRequests = useMemo(() => {
    // Renter Matches page: always show only Upcoming (M) requests,
    // regardless of filter/toggle state. Other filters still apply.
    return requests
      .filter((req) => (req.raw?.scope ?? "").trim().toLowerCase() === "upcoming (m)")
      .filter((req) =>
        matchesAgentFilters(req.raw, filters, showOwnReferrals, currentAgentId),
      );
  }, [currentAgentId, filters, requests, showOwnReferrals]);

  useEffect(() => {
    if (typeof window === "undefined" || !isStateRestored) return;

    writeStoredAgentListState(NAVIGATION_STORAGE_KEY, {
      page,
      limit,
      totalPages: Math.max(1, pagination?.totalPages ?? 1),
      itemIds: filteredRequests.map((request) => request.id),
      filters,
      showOwnReferrals,
    });
  }, [
    filteredRequests,
    filters,
    isStateRestored,
    limit,
    page,
    pagination?.totalPages,
    showOwnReferrals,
  ]);

  const handleView = (req: NormalizedAgentMatch) => {
    cacheSingleAgentMatch(req);
    router.push(`/agent/matches/${req.id}`);
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
        cacheAgentMatches(next);
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
  const handlePageSelect = (value: number) => {
    if (value === currentPage) return;
    setPage(value);
  };

  if (isLoading) {
    return <CenteredPageSpinner />;
  }

  return (
    <section className="bg-gray-50 min-h-screen px-4 lg:px-6 py-6">
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
              type="button"
              disabled
              className="flex cursor-not-allowed items-center gap-2 whitespace-nowrap rounded-full border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 opacity-60"
              title="This page always shows all Upcoming (M) requests"
            >
              <img
                src="/icons/all_market_icon_black.svg"
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
                <table className="min-w-[1240px] w-full text-sm">
                  <thead className="bg-blue-100 text-gray-800">
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
                  </thead>

                  <tbody>
                    {filteredRequests.map((req) => {
                      const isCurrentAgentsRequest =
                        isCurrentAgentRegisteredForRequest(req, currentAgentId);
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
                          <td className="py-3 px-5 text-gray-900">
                            {req.requestName}
                          </td>
                          <td className="py-3 px-5">
                            <div className="font-medium text-gray-900">
                              {formatRenterDisplayName(req.renterName)}
                            </div>
                          </td>
                          <td className="py-3 px-5">
                            <div className="inline-flex flex-col items-start gap-1">
                              {req.scopeLabel === "Upcoming (M)" &&
                              req.registeredAgentForView?.fullName ? (
                                <>
                                  <span className="self-stretch text-center text-xs font-medium text-blue-600 whitespace-nowrap">
                                    {formatRenterDisplayName(
                                      req.registeredAgentForView.fullName,
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
                                  {req.scopeLabel === "Upcoming (M)" &&
                                  req.matchedByAgent?.fullName &&
                                  isCurrentAgentsRequest ? (
                                    <span className="self-stretch text-center text-xs font-medium text-blue-600 whitespace-nowrap">
                                      {formatRenterDisplayName(
                                        req.matchedByAgent.fullName,
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
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                req.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {req.isActive ? "Matched" : "Inactive"}
                            </span>
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
              No matched requests match the current filters on this page.
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
        onApply={(f) => setFilters(f)}
        initialFilters={filters}
        resultCount={filteredRequests.length}
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
