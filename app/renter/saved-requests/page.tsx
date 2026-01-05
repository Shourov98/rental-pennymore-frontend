"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import RequestCard from "@/components/RequestCard";
import { RootState } from "@/store/store";
import Link from "next/link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pos-exterior-researchers-vegetarian.trycloudflare.com/api/v1";

type RequestStatus = "active" | "deactive";

interface ApiRequest {
  _id?: string;
  id?: string;
  requestId?: string;
  requestName?: string;
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
  status?: string;
  isActive?: boolean;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  data?: ApiRequest[];
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

interface Request {
  id: string;
  requestName: string;
  locationEntries: { borough: string; neighborhoods: string }[];
  dateRange: string;
  priceRange: string;
  bedsLabel: string;
  bathsLabel: string;
  status: RequestStatus;
  disableActivate: boolean;
  isMutating?: boolean;
}

const formatCurrencyRange = (min?: number, max?: number) => {
  if (min == null && max == null) return "Not specified";

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  if (min != null && max != null) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }

  if (min != null) return formatter.format(min);
  return formatter.format(max as number);
};

const formatDateRange = (range?: ApiRequest["movingDateRange"]) => {
  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

  const earliest = formatDate(range?.earliest);
  const latest = formatDate(range?.latest);

  if (earliest && latest) return `${earliest} - ${latest}`;
  if (earliest) return earliest;
  if (latest) return latest;
  return "Not specified";
};

const formatLocationEntries = (locations?: ApiRequest["locations"]) => {
  if (!locations?.length) return [];

  const entries: { borough: string; neighborhoods: string[] }[] = [];
  const indexByBorough = new Map<string, number>();

  locations.forEach((loc) => {
    const borough = loc?.borough || "";
    if (!borough) return;

    let entryIndex = indexByBorough.get(borough);
    if (entryIndex == null) {
      entryIndex = entries.length;
      indexByBorough.set(borough, entryIndex);
      entries.push({ borough, neighborhoods: [] });
    }

    (loc?.neighborhoods ?? []).forEach((neighborhood) => {
      if (neighborhood) {
        entries[entryIndex].neighborhoods.push(neighborhood);
      }
    });
  });

  return entries
    .map((entry) => {
      const uniqueNeighborhoods = Array.from(new Set(entry.neighborhoods));
      return {
        borough: entry.borough,
        neighborhoods: uniqueNeighborhoods.join(" • "),
      };
    })
    .filter((entry) => entry.neighborhoods);
};

const formatBedrooms = (bedrooms?: string[]) =>
  bedrooms?.length ? bedrooms.join(", ") : "Not specified";

const formatBathrooms = (bathrooms?: string[]) =>
  bathrooms?.length ? bathrooms.join(", ") : "Not specified";

const isExpired = (latestDate?: string) => {
  if (!latestDate) return false;

  const endDate = new Date(latestDate);
  const today = new Date();

  endDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return today > endDate;
};

export default function RenterDetails() {
  const router = useRouter();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<ApiResponse["pagination"]>({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [mutatingId, setMutatingId] = useState<string | null>(null);
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
          sort: "-createdAt",
        });

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch(
          `${API_BASE_URL}/pre-market/my-requests?${params.toString()}`,
          {
            method: "GET",
            headers,
            signal: controller.signal,
          }
        );

        const data: ApiResponse = await response.json().catch(() => ({}));

        if (!response.ok || data?.success === false) {
          throw new Error(
            data?.message ||
              "We couldn't load your saved requests right now. Please try again."
          );
        }

        const normalizedRequests: Request[] = (data.data ?? []).map(
          (req: ApiRequest) => {
            const locationEntries = formatLocationEntries(req.locations);
            const expired = isExpired(req.movingDateRange?.latest);
            const resolvedActive =
              typeof req.isActive === "boolean"
                ? req.isActive
                : req.status?.toLowerCase() === "active";

            return {
              id:
                req._id ||
                req.id ||
                req.requestId ||
                Math.random().toString(36).slice(2),
              requestName:
                req.requestName ||
                req.requestId ||
                "Pre-Market Listing Request",
              locationEntries,
              dateRange: formatDateRange(req.movingDateRange),
              priceRange: formatCurrencyRange(
                req.priceRange?.min,
                req.priceRange?.max
              ),
              bedsLabel: formatBedrooms(req.bedrooms),
              bathsLabel: formatBathrooms(req.bathrooms),
              status: expired || !resolvedActive ? "deactive" : "active",
              disableActivate: expired,
            };
          }
        );

        setRequests(normalizedRequests);
        setPagination(data.pagination);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error
            ? err.message
            : "We couldn't load your saved requests right now. Please try again.";
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

    fetchRequests();

    return () => controller.abort();
  }, [accessToken, page]);

  const toggleRequestStatus = async (id: string) => {
    setError(null);
    try {
      const current = requests.find((r) => r.id === id);
      if (!current) throw new Error("Request not found");
      if (current.disableActivate && current.status === "deactive") return;

      setMutatingId(id);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const nextActive = current.status !== "active";
      const response = await fetch(
        `${API_BASE_URL}/pre-market/${id}/toggle-status`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ isActive: nextActive }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            "We couldn't update the status right now. Please try again."
        );
      }

      setRequests((prev) =>
        prev.map((req) => {
          if (req.id !== id) return req;
          return {
            ...req,
            status: nextActive ? "active" : "deactive",
          };
        })
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't update the status right now. Please try again.";
      setError(message);
    } finally {
      setMutatingId(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/renter/saved-requests/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    setError(null);
    setMutatingId(id);

    try {
      const headers: Record<string, string> = {};
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(`${API_BASE_URL}/pre-market/${id}`, {
        method: "DELETE",
        headers,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            "We couldn't delete this request right now. Please try again."
        );
      }

      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't delete this request right now. Please try again.";
      setError(message);
    } finally {
      setMutatingId(null);
    }
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

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-3xl font-bold text-[#0B0B2C]">Saved Requests</h1>
      </div>

      {/* REQUEST CARDS */}
      {isLoading ? (
        <div className="text-center text-gray-500 py-8">Loading requests…</div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-4 text-sm">
          {error}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center text-gray-500">
          To get started, submit your first request from the{" "}
          <Link href="/pre-market-listing/">form page</Link>.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <RequestCard
                key={req.id}
                requestName={req.requestName}
                locationEntries={req.locationEntries}
                dateRange={req.dateRange}
                priceRange={req.priceRange}
                bedsLabel={req.bedsLabel}
                bathsLabel={req.bathsLabel}
                status={req.status}
                disableActivate={req.disableActivate}
                isMutating={mutatingId === req.id}
                onToggleStatus={() => toggleRequestStatus(req.id)}
                onEdit={() => handleEdit(req.id)}
                onDelete={() => handleDelete(req.id)}
              />
            ))}
          </div>

          {pagination && (
            <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm p-4 text-sm text-gray-600">
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
    </div>
  );
}
