"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import AgentContactCard from "@/components/AgentContactCard";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RootState } from "@/store/store";
import {
  API_BASE_URL,
  ApiMatchesResponse,
  NormalizedMatchRequest,
  cacheMatches,
  cacheSingleMatch,
  normalizeRequest,
} from "./utils";

export default function MatchedAgentsPage() {
  const router = useRouter();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [openRequestId, setOpenRequestId] = useState<string | null>(null);
  const [requests, setRequests] = useState<NormalizedMatchRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<
    ApiMatchesResponse["pagination"]
  >({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const limit = 10;

  useEffect(() => {
    const controller = new AbortController();

    const fetchMatches = async () => {
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

        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch(
          `${API_BASE_URL}/pre-market/renter/requests/with-agents?${params.toString()}`,
          {
            method: "GET",
            headers,
            signal: controller.signal,
          }
        );

        const data: ApiMatchesResponse = await response
          .json()
          .catch(() => ({} as ApiMatchesResponse));

        if (!response.ok || data?.success === false) {
          throw new Error(
            data?.message ||
              "We couldn't load your matched requests right now. Please try again."
          );
        }

        const normalized = (data.data ?? []).map(normalizeRequest);
        setRequests(normalized);
        setPagination(data.pagination);
        cacheMatches(normalized);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error
            ? err.message
            : "We couldn't load your matched requests right now. Please try again.";
        setError(message);
        setRequests([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        });
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchMatches();

    return () => controller.abort();
  }, [accessToken, page]);

  const toggleAccordion = (id: string) => {
    setOpenRequestId((prev) => (prev === id ? null : id));
  };

  const handleView = (req: NormalizedMatchRequest) => {
    cacheSingleMatch(req);
    router.push(`/renter/matches/${req.id}`);
  };

  const handlePreviousPage = () => {
    if (pagination?.hasPrev) {
      setPage((prev) => Math.max(1, prev - 1));
    }
  };

  const handleNextPage = () => {
    if (pagination?.hasNext) {
      setPage((prev) => prev + 1);
    }
  };

  const visibleRequests = requests.filter(
    (req) => (req.agentMatchCount ?? 0) > 0
  );

  return (
    <section className="w-full min-h-screen bg-[#F8F9FB] px-4 md:px-8 py-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-semibold text-[#0A093D]">
          Agents Matched With Requests
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View all pre-market requests with their matched agents.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-gray-600">
          Loading matched requests…
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-4 text-sm">
          {error}
        </div>
      ) : visibleRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-gray-600">
          No matched requests yet.
        </div>
      ) : (
        <>
          {/* Accordion List */}
          <div className="space-y-4">
            {visibleRequests.map((req) => {
              const isOpen = openRequestId === req.id;
              const matchCount = req.agentMatchCount ?? 0;

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Accordion Header */}
                  <div
                    role="button"
                    tabIndex={0}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-blue-100"
                    onClick={() => toggleAccordion(req.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleAccordion(req.id);
                      }
                    }}
                  >
                    <div>
                      <h2 className="text-lg font-semibold text-[#0A093D]">
                        {req.requestName}
                      </h2>

                      {(req.locationEntries ?? []).length > 0 && (
                        <div className="mt-1 flex flex-col gap-2 text-sm text-gray-600">
                          {(req.locationEntries ?? []).map((loc, index) => (
                            <div
                              key={`${loc.borough}-${index}`}
                              className="flex flex-col leading-snug"
                            >
                              <span className="font-semibold text-gray-900">
                                {loc.borough}
                              </span>
                              <span className="text-gray-600">
                                {loc.neighborhoods}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-sm text-gray-400">
                        {req.dateRangeLabel} • {req.priceRangeLabel}
                      </p>

                      {/* Agent Count */}
                      <p className="mt-1 text-sm font-medium text-blue-600">
                        {matchCount === 1
                          ? "Agent found a possible match"
                          : `${matchCount} agents found a possible match`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          req.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {req.isActive ? "Active" : "Inactive"}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(req);
                        }}
                        className="px-3 py-2 text-sm font-semibold text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50"
                      >
                        View
                      </button>

                      <div className="text-gray-500">
                        {isOpen ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Accordion Body */}
                  {isOpen && (
                    <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {req.matchedAgents.length === 0 ? (
                        <div className="text-gray-500 text-sm col-span-full">
                          No agents matched yet.
                        </div>
                      ) : (
                        req.matchedAgents.map((agent) => (
                          <AgentContactCard
                            key={
                              agent._id ||
                              agent.userId ||
                              agent.email ||
                              Math.random()
                            }
                            agent={{
                              image: agent.profileImage,
                              name: agent.fullName,
                              email: agent.email,
                              phone: agent.phoneNumber,
                              license: agent.licenseNumber,
                              brokerage: agent.hasGrantAccess
                                ? "Has grant access"
                                : "Awaiting access",
                              hasGrantAccess: agent.hasGrantAccess,
                            }}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {pagination && (
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 text-sm text-gray-600 mt-4">
              <div>
                Page {pagination.currentPage ?? page} of{" "}
                {pagination.totalPages ?? 1}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPrev}
                  className={`px-4 py-2 rounded-lg border text-sm ${
                    pagination.hasPrev
                      ? "bg-white text-gray-700 hover:bg-gray-50"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!pagination.hasNext}
                  className={`px-4 py-2 rounded-lg border text-sm ${
                    pagination.hasNext
                      ? "bg-white text-gray-700 hover:bg-gray-50"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
