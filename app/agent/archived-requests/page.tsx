"use client";

import { useEffect, useState } from "react";
import {
  ArchiveRestore,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import UnarchiveRequestDialog from "@/components/agent/UnarchiveRequestDialog";
import type { RootState } from "@/store/store";
import {
  API_BASE_URL,
  type ApiAgentRequestsResponse,
  type NormalizedAgentRequest,
  cacheSingleAgentRequest,
  normalizeAgentRequest,
} from "../dashboard/utils";
import { cacheSingleAgentMatch } from "../matches/utils";

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

export default function AgentArchivedRequestsPage() {
  const router = useRouter();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const currentAgentId = useSelector(
    (state: RootState) => state.auth.user?._id,
  );
  const [requests, setRequests] = useState<NormalizedAgentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [unarchiveTarget, setUnarchiveTarget] =
    useState<NormalizedAgentRequest | null>(null);
  const [isUnarchiving, setIsUnarchiving] = useState(false);
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
    const controller = new AbortController();

    const fetchArchivedRequests = async () => {
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
          `${API_BASE_URL}/pre-market/agent/archived-requests?${params.toString()}`,
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
              "We couldn't load archived requests right now. Please try again.",
          );
        }

        setRequests((data.data ?? []).map(normalizeAgentRequest));
        setPagination(data.pagination);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error
            ? err.message
            : "We couldn't load archived requests right now. Please try again.";
        setError(message);
        setRequests([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchArchivedRequests();

    return () => controller.abort();
  }, [accessToken, page]);

  const handleView = (request: NormalizedAgentRequest) => {
    const isRegistered = isCurrentAgentRegisteredForRequest(
      request,
      currentAgentId,
    );

    if (isRegistered) {
      cacheSingleAgentRequest(request);
      router.push(`/agent/dashboard/${request.id}`);
      return;
    }

    cacheSingleAgentMatch(request as any);
    router.push(`/agent/matches/${request.id}`);
  };

  const handleUnarchive = async () => {
    if (!unarchiveTarget?.raw?._id) return;

    setIsUnarchiving(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(
        `${API_BASE_URL}/pre-market/${unarchiveTarget.raw._id}/unarchive`,
        {
          method: "PATCH",
          headers,
        },
      );
      const data = await response
        .json()
        .catch(() => ({}) as { success?: boolean; message?: string });

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "We couldn't unarchive this request.");
      }

      setRequests((prev) =>
        prev.filter((request) => request.id !== unarchiveTarget.id),
      );
      setUnarchiveTarget(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't unarchive this request.";
      setError(message);
    } finally {
      setIsUnarchiving(false);
    }
  };

  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const currentPage = pagination?.currentPage ?? page;
  const totalItems = pagination?.totalItems ?? requests.length;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <section className="bg-gray-50 min-h-screen px-4 lg:px-6 py-6 overflow-y-auto">
      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Archived Requests
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View archived renter requests.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-gray-600">
          Loading archived requests...
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-4 text-sm">
          {error}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-gray-600">
          No archived requests available right now.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[1320px] w-full text-sm">
                <thead className="bg-blue-100 text-gray-800">
                  <tr>
                    <th className="py-3 px-5 text-left">Date</th>
                    <th className="py-3 px-5 text-left">Request</th>
                    <th className="py-3 px-5 text-left">Renter</th>
                    <th className="py-3 px-5 text-left">Scope</th>
                    <th className="py-3 px-5 text-left">Visibility</th>
                    <th className="py-3 px-5 text-left">Borough</th>
                    <th className="py-3 px-5 text-left">Price (Max)</th>
                    <th className="py-3 px-5 text-left">Beds</th>
                    <th className="py-3 px-5 text-left">Baths</th>
                    <th className="py-3 px-5 text-left">Status</th>
                    <th className="py-3 px-5 text-center">
                      Registration / Disclosure
                    </th>
                    <th className="py-3 px-5 text-left">Archive Reason</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => {
                    const isRegistered = isCurrentAgentRegisteredForRequest(
                      request,
                      currentAgentId,
                    );
                    const isRegistrationDisclosureLocked =
                      !request.registrationDisclosureConfirmed;

                    return (
                      <tr
                        key={request.id}
                        className="border-t border-gray-200 hover:bg-gray-50 text-gray-700"
                      >
                        <td className="py-3 px-5 font-semibold text-gray-900">
                          {request.dateLabel}
                        </td>
                        <td className="py-3 px-5 text-gray-900">
                          {request.requestName}
                        </td>
                        <td className="py-3 px-5 text-gray-900">
                          <div className="font-medium text-gray-900">
                            {formatRenterDisplayName(request.renterName)}
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                            {request.scopeLabel}
                          </span>
                        </td>
                        <td className="py-3 px-5">
                          {isRegistered ? (
                            <div className="inline-flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-700">
                                Private
                              </span>
                              <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                                <span className="inline-block h-5 w-5 translate-x-1 rounded-full bg-white" />
                              </span>
                              <span className="text-xs font-medium text-gray-400">
                                Shared
                              </span>
                              <Lock
                                className="h-4 w-4 text-gray-500"
                                aria-hidden="true"
                              />
                            </div>
                          ) : (
                            <span className="text-sm font-medium text-gray-700">
                              {request.raw?.visibility || "Not specified"}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-5 text-gray-900">
                          {request.boroughsLabel}
                        </td>
                        <td className="py-3 px-5">{request.priceMaxLabel}</td>
                        <td className="py-3 px-5">{request.bedroomsLabel}</td>
                        <td className="py-3 px-5">{request.bathroomsLabel}</td>
                        <td className="py-3 px-5">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                            Archived
                          </span>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="checkbox"
                              checked={request.registrationDisclosureConfirmed}
                              disabled
                              aria-label={`Registration / Disclosure status for ${request.requestName}`}
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
                        <td className="py-3 px-5">
                          {request.archiveReasonLabel || "Archived"}
                        </td>
                        <td className="py-3 px-5 flex justify-end gap-2">
                          <button
                            onClick={() => setUnarchiveTarget(request)}
                            title="Unarchive request"
                            className="p-2 rounded-full transition bg-gray-100 hover:bg-gray-200"
                          >
                            <ArchiveRestore className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleView(request)}
                            title="View request"
                            className="p-2 rounded-full transition bg-gray-100 hover:bg-gray-200"
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
                  Showing {requests.length} item
                  {requests.length === 1 ? "" : "s"}
                </span>
                <span className="text-gray-300">-</span>
                <span>Total items {totalItems}</span>
                <span className="text-gray-300">-</span>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => pagination.hasPrev && setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                  className="p-2 rounded-full border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {pages.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
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
                  onClick={() => pagination.hasNext && setPage(page + 1)}
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

      {unarchiveTarget ? (
        <UnarchiveRequestDialog
          reasonLabel={unarchiveTarget.archiveReasonLabel || "Archived"}
          isSubmitting={isUnarchiving}
          onCancel={() => {
            if (!isUnarchiving) setUnarchiveTarget(null);
          }}
          onConfirm={handleUnarchive}
        />
      ) : null}
    </section>
  );
}
