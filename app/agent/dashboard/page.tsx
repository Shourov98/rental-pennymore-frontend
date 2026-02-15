"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Filter, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { selectAgentReferral } from "@/store/slices/agentProfileSlice";
import { fetchAgentProfile } from "@/store/slices/agentProfileSlice";
import FilterModal from "@/components/modals/FilterModals";
import {
  API_BASE_URL,
  ApiAgentRequestsResponse,
  NormalizedAgentRequest,
  cacheAgentRequests,
  cacheSingleAgentRequest,
  normalizeAgentRequest,
} from "./utils";

export default function AgentRenterRequestsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const { referralCode } = useSelector(selectAgentReferral);
  const formatReferralName = (name: string) => {
    const trimmed = name.trim();
    const parts = trimmed.trim().split(/\s+/);
    if (parts.length === 0) return name;
    const firstInitial = parts[0][0]?.toUpperCase() ?? "";
    const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    return `${firstInitial}.${lastName}`;
  };

  const [requests, setRequests] = useState<NormalizedAgentRequest[]>([]);
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
    if (!accessToken) return;
    dispatch(fetchAgentProfile());
  }, [accessToken, dispatch]);

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
          `${API_BASE_URL}/pre-market/all?${params.toString()}`,
          {
            method: "GET",
            headers,
            signal: controller.signal,
          }
        );

        const data: ApiAgentRequestsResponse = await response
          .json()
          .catch(() => ({} as ApiAgentRequestsResponse));

        if (!response.ok || data?.success === false) {
          throw new Error(
            data?.message ||
              "We couldn't load renter requests right now. Please try again."
          );
        }

        const normalized = (data.data ?? []).map(normalizeAgentRequest);
        setRequests(normalized);
        setPagination(data.pagination);
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
        if (max != null && max > filters.maxPrice) return false;
      }

      if (showOwnReferrals) {
        if (!referralCode) return false;
        const referrerCode = raw.referralInfo?.referrer?.referralCode ?? null;
        if (!referrerCode || referrerCode !== referralCode) return false;
      }

      return true;
    });
  }, [filters, referralCode, requests, showOwnReferrals]);

  const handleView = (req: NormalizedAgentRequest) => {
    cacheSingleAgentRequest(req);
    router.push(`/agent/dashboard/${req.id}`);
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
    <section className="bg-gray-50 min-h-screen px-4 lg:px-6 py-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-5 rounded-xl shadow-sm gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Renter Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View all available pre-market requests from renters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowOwnReferrals((prev) => !prev)}
            className={`px-4 py-2 rounded-full font-medium border transition ${
              showOwnReferrals
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            My Referrals
          </button>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 transition"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-gray-600">
          Loading renter requests…
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-4 text-sm">
          {error}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-gray-600">
          No renter requests available right now.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-hidden">
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
                  {filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="border-t border-gray-200 hover:bg-gray-50 text-gray-700"
                    >
                      <td className="py-3 px-5">
                        <div className="font-semibold text-gray-900">
                          {req.dateLabel}
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <div className="text-gray-900">{req.requestName}</div>
                      </td>
                      <td className="py-3 px-5">
                        {(() => {
                          const fallbackReferrerName = "Tuval Mor";
                          const referralName =
                            req.raw?.referralInfo?.referrer?.referrerName ||
                            req.raw?.referralInfo?.referrer?.fullName ||
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
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            req.isPrivateVisibility
                              ? "bg-gray-100 text-gray-700 border border-gray-300"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {req.visibilityLabel}
                          {req.isPrivateVisibility && (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <div className="text-gray-900">{req.boroughsLabel}</div>
                      </td>
                      <td className="py-3 px-5">{req.priceMaxLabel}</td>
                      <td className="py-3 px-5">{req.bedroomsLabel}</td>
                      <td className="py-3 px-5">{req.bathroomsLabel}</td>
                      <td className="py-3 px-5">
                        {(() => {
                          const rawStatus =
                            req.raw?.status || req.status || "unknown";
                          const statusText =
                            typeof rawStatus === "string"
                              ? rawStatus
                                  .split(/[\s-_]+/)
                                  .filter(Boolean)
                                  .map(
                                    (segment) =>
                                      segment[0]?.toUpperCase() +
                                      segment.slice(1)
                                  )
                                  .join(" ")
                              : String(rawStatus);
                          const isActiveStatus = /active|available/i.test(
                            statusText
                          );
                          return (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                isActiveStatus
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {statusText}
                            </span>
                          );
                        })()}
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
                  ))}
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
