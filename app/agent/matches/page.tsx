"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import FilterModal from "@/components/modals/FilterModals";
import { RootState } from "@/store/store";
import {
  API_BASE_URL,
  ApiAgentMatchesResponse,
  NormalizedAgentMatch,
  cacheAgentMatches,
  cacheSingleAgentMatch,
  normalizeAgentMatch,
} from "./utils";

export default function AgentMatchesPage() {
  const router = useRouter();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const currentAgentId = useSelector((state: RootState) => state.auth.user?._id);
  const formatReferralName = (name: string) => {
    const trimmed = name.trim();
    const parts = trimmed.trim().split(/\s+/);
    if (parts.length === 0) return name;
    const firstInitial = parts[0][0]?.toUpperCase() ?? "";
    const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    return `${firstInitial}.${lastName}`;
  };

  const [requests, setRequests] = useState<NormalizedAgentMatch[]>([]);
  const [filters, setFilters] = useState<{
    borough: string | null;
    neighborhoods: string[];
    bedrooms: number[];
    bathrooms: number[];
    maxPrice: number | null;
  }>({
    borough: null,
    neighborhoods: [],
    bedrooms: [],
    bathrooms: [],
    maxPrice: null,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showOwnReferrals, setShowOwnReferrals] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutatingShareId, setMutatingShareId] = useState<string | null>(null);
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
          }
        );

        const data: ApiAgentMatchesResponse = await response
          .json()
          .catch(() => ({} as ApiAgentMatchesResponse));

        if (!response.ok || data?.success === false) {
          throw new Error(
            data?.message ||
              "We couldn't load matched requests right now. Please try again."
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
  }, [accessToken, page]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const { raw } = req;
      if (filters.borough) {
        const hasBorough = raw.locations?.some(
          (loc) => loc?.borough === filters.borough
        );
        if (!hasBorough) return false;
      }

      if (filters.neighborhoods.length) {
        const neighborhoods = raw.locations
          ?.flatMap((loc) => loc?.neighborhoods || [])
          .filter(Boolean) as string[];
        const hasNeighborhood = filters.neighborhoods.some((n) =>
          neighborhoods.includes(n)
        );
        if (!hasNeighborhood) return false;
      }

      if (filters.bedrooms.length) {
        const bedroomValues =
          raw.bedrooms?.map((b) => (b === "Studio" ? 0 : parseInt(b, 10))) ||
          [];
        const hasBedroom = filters.bedrooms.some((b) =>
          bedroomValues.includes(b)
        );
        if (!hasBedroom) return false;
      }

      if (filters.bathrooms.length) {
        const bathroomValues = raw.bathrooms?.map((b) => parseInt(b, 10)) || [];
        const hasBathroom = filters.bathrooms.some((b) =>
          bathroomValues.includes(b)
        );
        if (!hasBathroom) return false;
      }

      if (filters.maxPrice != null) {
        const max = raw.priceRange?.max ?? raw.priceRange?.min;
        if (max != null && max < filters.maxPrice) return false;
      }

      if (showOwnReferrals) {
        if (!currentAgentId) return false;
        const requestReferralAgentId = raw.referralAgentId ?? null;
        if (!requestReferralAgentId || requestReferralAgentId !== currentAgentId)
          return false;
      }

      return true;
    });
  }, [currentAgentId, filters, requests, showOwnReferrals]);

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
        }
      );

      const data = await response
        .json()
        .catch(() => ({} as { success?: boolean; message?: string }));

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            "We couldn't update request visibility right now. Please try again."
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
              shareConsent: !isPrivateVisibility,
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
  const handlePageSelect = (value: number) => {
    if (value === currentPage) return;
    setPage(value);
  };

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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowOwnReferrals((prev) => !prev)}
            className={`px-4 py-1 rounded-full font-medium border transition ${
              showOwnReferrals
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                : "bg-white text-blue-500 border-gray-200 hover:bg-gray-100"
            }`}
          >
            My Referrals
          </button>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1 rounded-full font-medium hover:bg-blue-700 transition"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-gray-600">
          Loading matched requests…
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-4 text-sm">
          {error}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-gray-600">
          No matched requests available right now.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full text-sm">
                <thead className="bg-blue-100 text-gray-800">
                  <tr>
                    <th className="py-3 px-5 text-left">Date</th>
                    <th className="py-3 px-5 text-left">Request</th>
                    <th className="py-3 px-5 text-left">Referral</th>
                    <th className="py-3 px-5 text-left">Scope</th>
                    <th className="py-3 px-5 text-left">Visibility</th>
                    <th className="py-3 px-5 text-left">Borough</th>
                    <th className="py-3 px-5 text-left">Price (Max)</th>
                    <th className="py-3 px-5 text-left">Beds</th>
                    <th className="py-3 px-5 text-left">Baths</th>
                    <th className="py-3 px-5 text-left">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((req) => {
                    const requestReferralAgentId =
                      req.raw?.referralAgentId ?? null;
                    const canToggleVisibility =
                      Boolean(currentAgentId) &&
                      Boolean(requestReferralAgentId) &&
                      currentAgentId === requestReferralAgentId;

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
                        {(() => {
                          const fallbackReferrerName = "Tuval Mor";
                          const referralName =
                            req.raw?.renterInfo?.referralInfo?.referrerName ||
                            req.raw?.renterInfo?.referralInfo?.fullName ||
                            "";
                          const displayName = referralName.trim()
                            ? referralName
                            : fallbackReferrerName;
                          return (
                            <span className="inline-flex items-center rounded-full border border-blue-500 text-blue-600 px-2.5 py-0.5 text-xs font-semibold">
                              {formatReferralName(displayName)}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-5">
                        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                          {req.scopeLabel}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        {canToggleVisibility ? (
                          <button
                            type="button"
                            onClick={() => handleToggleShare(req)}
                            disabled={mutatingShareId === req.id}
                            className="inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            aria-label={`Toggle visibility for ${req.requestName}`}
                            title="Toggle request visibility"
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
                        ) : (
                          <span className="text-sm font-medium text-gray-700">
                            {req.isPrivateVisibility ? "Private" : "Shared"}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-gray-900">
                        {req.boroughsLabel}
                      </td>
                      <td className="py-3 px-5">{req.priceMaxLabel}</td>
                      <td className="py-3 px-5">{req.bedroomsLabel}</td>
                      <td className="py-3 px-5">{req.bathroomsLabel}</td>
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
                      <td className="py-3 px-5 flex justify-end gap-2">
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

          {pagination && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span>
                  Showing {filteredRequests.length} item
                  {filteredRequests.length === 1 ? "" : "s"}
                </span>
                <span className="text-gray-300">•</span>
                <span>
                  Total items {totalItems}
                </span>
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
        resultCount={filteredRequests.length}
      />
    </section>
  );
}
