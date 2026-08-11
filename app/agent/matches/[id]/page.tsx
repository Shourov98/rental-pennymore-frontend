"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
} from "lucide-react";
import RenterPreferenceView from "@/components/RenterPreferenceView";
import { RootState } from "@/store/store";
import { isUpcomingScope } from "@/lib/scope";
import {
  API_BASE_URL,
  ApiAgentMatchesResponse,
  NormalizedAgentMatch,
  cacheAgentMatches,
  normalizeAgentMatch,
  readCachedAgentMatches,
} from "../utils";
import {
  getAgentRequestHref,
  matchesAgentFilters,
  readStoredAgentListState,
} from "../../requestNavigation";

const NAVIGATION_STORAGE_KEY = "agent-matches-navigation";
const ARCHIVE_NAVIGATION_STORAGE_KEY = "agent-archived-navigation";
const NAVIGATION_LIMIT_FALLBACK = 10;
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

const unitFeatureLabels: Record<string, string> = {
  laundryInUnit: "Laundry in unit",
  privateOutdoorSpace: "Private outdoor space",
  dishwasher: "Dishwasher",
};

const buildingFeatureLabels: Record<string, string> = {
  doorman: "Doorman",
  elevator: "Elevator",
  laundryInBuilding: "Laundry in Building",
};

const petPolicyLabels: Record<string, string> = {
  catsAllowed: "Cats allowed",
  dogsAllowed: "Dogs allowed",
};

const guarantorLabels: Record<string, string> = {
  personalGuarantor: "Personal guarantor",
  thirdPartyGuarantor: "Third party guarantor",
};

const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not specified";

const formatFeatureGroup = (
  values: Record<string, boolean> | undefined,
  labels: Record<string, string>,
) =>
  Object.entries(values || {})
    .filter(([, value]) => value)
    .map(([key]) => labels[key] || key);

export default function AgentMatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const currentAgentId = useSelector(
    (state: RootState) => state.auth.user?._id ?? null,
  );

  const requestId = params?.id as string | undefined;
  const isArchiveContext = searchParams.get("from") === "archive";

  const [request, setRequest] = useState<NormalizedAgentMatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingOpportunity, setIsSubmittingOpportunity] =
    useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isOpportunityOpen, setIsOpportunityOpen] = useState(false);
  const [opportunityDetails, setOpportunityDetails] = useState("");
  const opportunityDetailsTextareaRef = useRef<HTMLTextAreaElement | null>(
    null,
  );
  const [navigationTargets, setNavigationTargets] = useState<{
    previousHref: string | null;
    nextHref: string | null;
  }>({
    previousHref: null,
    nextHref: null,
  });
  const [isResolvingNavigation, setIsResolvingNavigation] = useState(false);

  useEffect(() => {
    if (!requestId) return;
    const controller = new AbortController();

    const fetchRequest = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const cached = readCachedAgentMatches().find(
          (item) => item.id === requestId,
        );
        if (cached) {
          setRequest(cached);
          setIsLoading(false);
          return;
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

        const params = new URLSearchParams({
          page: "1",
          limit: "50",
        });

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
              "We couldn't load this request right now. Please try again.",
          );
        }

        const normalizedList = (data.data ?? []).map(normalizeAgentMatch);
        cacheAgentMatches(normalizedList);

        const found = normalizedList.find((item) => item.id === requestId);
        if (!found) {
          throw new Error("We couldn't find this request.");
        }

        setRequest(found);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error
            ? err.message
            : "We couldn't load this request right now. Please try again.";
        setError(message);
        setRequest(null);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchRequest();

    return () => controller.abort();
  }, [accessToken, requestId]);

  useEffect(() => {
    const textarea = opportunityDetailsTextareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [opportunityDetails, isOpportunityOpen]);

  useEffect(() => {
    if (!requestId) return;

    const controller = new AbortController();

    const resolveNavigation = async () => {
      const storedState = readStoredAgentListState(
        isArchiveContext
          ? ARCHIVE_NAVIGATION_STORAGE_KEY
          : NAVIGATION_STORAGE_KEY,
      );
      if (!storedState) {
        setNavigationTargets({ previousHref: null, nextHref: null });
        return;
      }

      const currentIndex = storedState.itemIds.indexOf(requestId);
      const localPreviousId =
        currentIndex >= 0 ? storedState.itemIds[currentIndex - 1] ?? null : null;
      const localNextId =
        currentIndex >= 0 ? storedState.itemIds[currentIndex + 1] ?? null : null;

      if (localPreviousId && localNextId) {
        setNavigationTargets({
          previousHref: isArchiveContext
            ? storedState.itemHrefs?.[localPreviousId] ?? null
            : `/agent/matches/${localPreviousId}`,
          nextHref: isArchiveContext
            ? storedState.itemHrefs?.[localNextId] ?? null
            : `/agent/matches/${localNextId}`,
        });
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const findAdjacentHref = async (direction: "previous" | "next") => {
        let targetPage =
          direction === "previous" ? storedState.page - 1 : storedState.page + 1;

        while (
          targetPage >= 1 &&
          targetPage <= Math.max(1, storedState.totalPages)
        ) {
          const params = new URLSearchParams({
            page: String(targetPage),
            limit: String(storedState.limit || NAVIGATION_LIMIT_FALLBACK),
          });

          const response = await fetch(
            `${API_BASE_URL}${
              isArchiveContext
                ? "/pre-market/agent/archived-requests"
                : "/pre-market/agent/all-requests"
            }?${params.toString()}`,
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
                "We couldn't load nearby matches right now. Please try again.",
            );
          }

          const normalized = (data.data ?? []).map(normalizeAgentMatch);
          cacheAgentMatches(normalized);
          const filtered = isArchiveContext
            ? normalized
            : normalized.filter((item) =>
                matchesAgentFilters(
                  item.raw,
                  storedState.filters,
                  storedState.showOwnReferrals,
                  currentAgentId,
                ),
              );

          if (filtered.length > 0) {
            const target =
              direction === "previous"
                ? filtered[filtered.length - 1]
                : filtered[0];
            if (!target) return null;
            return isArchiveContext
              ? getAgentRequestHref(target.raw, target.id, currentAgentId)
              : `/agent/matches/${target.id}`;
          }

          targetPage += direction === "previous" ? -1 : 1;
        }

        return null;
      };

      try {
        setIsResolvingNavigation(true);
        const [previousHref, nextHref] = await Promise.all([
          localPreviousId
            ? Promise.resolve(
                isArchiveContext
                  ? storedState.itemHrefs?.[localPreviousId] ?? null
                  : `/agent/matches/${localPreviousId}`,
              )
            : findAdjacentHref("previous"),
          localNextId
            ? Promise.resolve(
                isArchiveContext
                  ? storedState.itemHrefs?.[localNextId] ?? null
                  : `/agent/matches/${localNextId}`,
              )
            : findAdjacentHref("next"),
        ]);

        if (!controller.signal.aborted) {
          setNavigationTargets({ previousHref, nextHref });
        }
      } catch {
        if (!controller.signal.aborted) {
          setNavigationTargets({
            previousHref: localPreviousId
              ? isArchiveContext
                ? storedState.itemHrefs?.[localPreviousId] ?? null
                : `/agent/matches/${localPreviousId}`
              : null,
            nextHref: localNextId
              ? isArchiveContext
                ? storedState.itemHrefs?.[localNextId] ?? null
                : `/agent/matches/${localNextId}`
              : null,
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsResolvingNavigation(false);
        }
      }
    };

    resolveNavigation();

    return () => controller.abort();
  }, [accessToken, currentAgentId, isArchiveContext, requestId]);

  const {
    movingDateRange,
    priceRange,
    locations,
    bedrooms,
    bathrooms,
    unitFeatures,
    buildingFeatures,
    petPolicy,
    guarantorRequired,
    preferences,
    renterInfo,
  } = request?.raw || {};

  const unitFeaturesList = useMemo(
    () => formatFeatureGroup(unitFeatures, unitFeatureLabels),
    [unitFeatures],
  );
  const buildingFeaturesList = useMemo(
    () => formatFeatureGroup(buildingFeatures, buildingFeatureLabels),
    [buildingFeatures],
  );
  const petPolicyList = useMemo(
    () => formatFeatureGroup(petPolicy, petPolicyLabels),
    [petPolicy],
  );
  const guarantorList = useMemo(
    () => formatFeatureGroup(guarantorRequired, guarantorLabels),
    [guarantorRequired],
  );

  const renterPreferenceData = useMemo(() => {
    const boroughValue = locations?.[0]?.borough || "Not specified";
    const neighborhoodsList =
      locations
        ?.flatMap((loc) => loc.neighborhoods || [])
        ?.filter((n): n is string => Boolean(n)) || [];

    const minPrice =
      priceRange?.min != null
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(priceRange.min)
        : "Not specified";

    const maxPrice =
      priceRange?.max != null
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(priceRange.max)
        : "Not specified";

    const normalizeBedroom = (value: string) => {
      if (!value) return "";
      if (value.toLowerCase() === "studio") return "Studio";
      if (/br/i.test(value)) return value.toUpperCase();
      const asNumber = parseInt(value, 10);
      return Number.isNaN(asNumber) ? value : `${asNumber}BR`;
    };

    const normalizeBathroom = (value: string) => {
      if (!value) return "";
      if (value.includes("+")) return value;
      const asNumber = parseInt(value, 10);
      if (!Number.isNaN(asNumber)) {
        return asNumber >= 4 ? "4+" : String(asNumber);
      }
      return value;
    };

    const bedroomValues =
      bedrooms
        ?.map((value) => normalizeBedroom(value))
        .filter((value): value is string => Boolean(value)) || [];

    const bathroomValues =
      bathrooms
        ?.map((value) => normalizeBathroom(value))
        .filter((value): value is string => Boolean(value)) || [];

    return {
      borough: boroughValue,
      neighborhoods:
        neighborhoodsList.length > 0 ? neighborhoodsList : ["Not specified"],
      minPrice,
      maxPrice,
      earliestDate: formatDate(movingDateRange?.earliest),
      latestDate: formatDate(movingDateRange?.latest),
      bedrooms: bedroomValues,
      bathrooms: bathroomValues,
      unitFeatures: unitFeaturesList,
      buildingFeatures: buildingFeaturesList,
      petPolicy: petPolicyList,
      guarantor: guarantorList,
      preferences: preferences ?? [],
    };
  }, [
    buildingFeaturesList,
    bedrooms,
    guarantorList,
    locations,
    movingDateRange?.earliest,
    movingDateRange?.latest,
    petPolicyList,
    preferences,
    priceRange?.max,
    priceRange?.min,
    unitFeaturesList,
    bathrooms,
  ]);

  const renterContact = useMemo(() => {
    if (!renterInfo) return null;
    const referralInfo = renterInfo.referralInfo;
    const isAdminReferral = referralInfo?.registrationType === "admin_referral";
    const adminReferrerName = referralInfo?.referredByAdmin?.referrerName;
    const formatReferralName = (name: string) => {
      const trimmed = name.trim();
      const parts = trimmed.split(/\s+/);
      if (parts.length === 0) return name;
      const firstInitial = parts[0][0]?.toUpperCase() ?? "";
      const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
      return `${firstInitial}.${lastName}`;
    };
    const formatShortName = (name: string) => {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      if (parts.length < 2) return name.trim();
      const firstInitial = parts[0][0]?.toUpperCase() || "";
      const lastName = parts[parts.length - 1];
      return `${firstInitial}.${lastName}`;
    };
    const referralName = isAdminReferral
      ? adminReferrerName
        ? formatShortName(adminReferrerName)
        : null
      : (typeof renterInfo.referrer === "string"
          ? renterInfo.referrer
          : null) ||
        referralInfo?.referrerName ||
        referralInfo?.fullName ||
        null;
    const fullName =
      renterInfo.renterName || renterInfo.fullName || "Unknown renter";
    const firstLetter = fullName.trim()[0]?.toUpperCase() || "R";
    const fallbackReferrerName = "Tuval Mor";
    const referrerDisplayName = referralName?.trim()
      ? formatReferralName(referralName)
      : formatReferralName(fallbackReferrerName);
    return {
      name: fullName,
      email: renterInfo.renterEmail || renterInfo.email || "Not provided",
      phone: renterInfo.renterPhone || renterInfo.phoneNumber || "Not provided",
      avatar: renterInfo.profileImage || null,
      referrerName: referrerDisplayName,
      firstLetter,
    };
  }, [renterInfo]);

  const navigateToAdjacentRequest = (targetHref: string | null) => {
    if (!targetHref) return;
    router.push(targetHref);
  };

  const backHref = isArchiveContext ? "/agent/archived-requests" : "/agent/matches";
  const backLabel = isArchiveContext ? "Archived Requests" : "Matched Requests";
  const normalizedGrantStatus = String(
    request?.raw?.grantAccessStatus ?? request?.raw?.status ?? request?.status ?? "",
  )
    .trim()
    .toLowerCase();
  const normalizedListingStatus = String(
    request?.raw?.listingStatus ?? request?.raw?.status ?? request?.status ?? "",
  )
    .trim()
    .toLowerCase();
  const isUpcomingMatch = isUpcomingScope(
    request?.raw?.scope ?? request?.scopeLabel,
  );
  const isRenterRepresentationMatch =
    request?.representation_type !== "owner_representation" &&
    request?.raw?.representation_type !== "owner_representation";
  // For Upcoming / Upcoming (M) requests, owner-representation matches may
  // also add additional opportunities (the same agent can match several
  // owners against the same upcoming request). All Market keeps the
  // original restriction (renter-rep only).
  const canAddOpportunity =
    Boolean(requestId) &&
    Boolean(request) &&
    !request?.isArchivedForAgent &&
    !request?.raw?.isArchivedForAgent &&
    (isRenterRepresentationMatch || isUpcomingMatch) &&
    (["free", "paid"].includes(normalizedGrantStatus) ||
      normalizedListingStatus === "matched" ||
      request?.raw?.alreadyMatchedByAgent === true);
  const opportunityDetailsCount = opportunityDetails.length;
  const opportunityDetailsCounterClass =
    opportunityDetailsCount >= OPPORTUNITY_DETAILS_MAX_LENGTH
      ? "text-red-600"
      : opportunityDetailsCount >= 280
        ? "text-orange-400"
        : "text-[#999999]";
  const hasRiskyOpportunityDetails =
    hasRiskyOpportunityDetailsWording(opportunityDetails);

  const handleSendAdditionalOpportunity = async () => {
    if (!requestId || !canAddOpportunity || isSubmittingOpportunity) return;

    const normalizedOpportunityDetails = opportunityDetails
      .trim()
      .slice(0, OPPORTUNITY_DETAILS_MAX_LENGTH);

    if (hasRiskyOpportunityDetailsWording(normalizedOpportunityDetails)) {
      setStatusMessage({
        type: "error",
        message: OPPORTUNITY_DETAILS_RISKY_WORDING_MESSAGE,
      });
      return;
    }

    setIsSubmittingOpportunity(true);
    setStatusMessage(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(
        `${API_BASE_URL}/pre-market/agent/${requestId}/match`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            representation_type: "renter_representation",
            additionalOpportunity: true,
            ...(normalizedOpportunityDetails
              ? { opportunityDetails: normalizedOpportunityDetails }
              : {}),
          }),
        },
      );
      const data = await response
        .json()
        .catch(() => ({}) as { success?: boolean; message?: string });

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            "We couldn't send this opportunity right now. Please try again.",
        );
      }

      setIsOpportunityOpen(false);
      setOpportunityDetails("");
      setStatusMessage({
        type: "success",
        message: data?.message || "Additional opportunity sent.",
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "We couldn't send this opportunity right now. Please try again.",
      });
    } finally {
      setIsSubmittingOpportunity(false);
    }
  };

  return (
    <section className="flex-1 bg-gray-50 min-h-screen px-4 md:px-8 py-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-sm p-5 flex flex-wrap justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ArrowLeft
            onClick={() => router.push(backHref)}
            className="w-4 h-4 text-gray-600 cursor-pointer"
          />
          <span
            onClick={() => router.push(backHref)}
            className="cursor-pointer"
          >
            {backLabel}
          </span>
          <span>›</span>
          <span className="font-medium text-gray-800">
            {request?.requestName || "Request Details"}
          </span>
        </div>

        {request?.isArchivedForAgent || request?.raw?.isArchivedForAgent ? (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
            {request.archiveReasonLabel ||
              request.raw?.archiveReasonLabel ||
              "Archived"}
          </span>
        ) : (
          (() => {
            const rawStatus = request?.raw?.status || request?.status || "";
            const normalizedBackendStatus = rawStatus.trim().toLowerCase();
            const backendStatusText =
              normalizedBackendStatus === "matched"
                ? "Matched"
                : normalizedBackendStatus === "open"
                  ? "Open"
                  : null;
            const normalizedAgentGrantStatus = String(
              request?.raw?.grantAccessStatus ?? request?.raw?.status ?? "",
            )
              .trim()
              .toLowerCase();
            const matchedFromGrantStatus =
              request?.raw?.representation_type !== "owner_representation" &&
              ["pending", "approved", "free", "paid"].includes(
                normalizedAgentGrantStatus,
              );
            const statusLabel =
              backendStatusText ??
              (request?.raw?.alreadyMatchedByAgent || matchedFromGrantStatus
                ? "Matched"
                : "Open");
            const isMatchedByAgent = statusLabel === "Matched";

            return (
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isMatchedByAgent
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {statusLabel}
              </span>
            );
          })()
        )}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-gray-600">
          Loading request details…
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-4 text-sm">
          {error}
        </div>
      ) : !request ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-gray-600">
          Request not found.
        </div>
      ) : (
        <>
          {/* Renter Contact */}
          {renterContact && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#0A093D] mb-4">
                Renter Contact Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                  {renterContact.avatar ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                      <Image
                        src={renterContact.avatar}
                        alt="Renter profile"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                      {renterContact.firstLetter}
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-gray-900 font-medium">
                        {renterContact.name}
                      </p>
                      {renterContact.referrerName && (
                        <span className="inline-flex items-center rounded-full border border-blue-500 text-blue-600 px-2.5 py-0.5 text-xs font-semibold">
                          {renterContact.referrerName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">
                      {renterContact.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-gray-900 font-medium">
                      {renterContact.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#0A093D]">
                Renter Preference
              </h2>
              <div className="text-sm text-gray-600">
                {request.boroughsLabel}
              </div>
            </div>

            <RenterPreferenceView
              data={renterPreferenceData}
              preferencesLayout="topFour"
            />

            <div className="mt-6 flex flex-col gap-4">
              {statusMessage && (
                <p
                  className={`text-sm ${
                    statusMessage.type === "error"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {statusMessage.message}
                </p>
              )}
              {canAddOpportunity && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusMessage(null);
                    setOpportunityDetails("");
                    setIsOpportunityOpen(true);
                  }}
                  disabled={isSubmittingOpportunity}
                  className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingOpportunity ? "Sending..." : "Add Opportunity"}
                </button>
              )}
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  navigateToAdjacentRequest(navigationTargets.previousHref)
                }
                disabled={!navigationTargets.previousHref || isResolvingNavigation}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 md:min-w-36"
                aria-label="Previous request"
              >
                <ChevronLeft className="h-5 w-5 text-sky-500" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <button
                type="button"
                onClick={() => navigateToAdjacentRequest(navigationTargets.nextHref)}
                disabled={!navigationTargets.nextHref || isResolvingNavigation}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 md:min-w-36"
                aria-label="Next request"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-5 w-5 text-sky-500" />
              </button>
            </div>
          </div>
        </>
      )}

      {isOpportunityOpen && (
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
            <h2 className="mb-5 text-xl font-semibold text-gray-900">
              Add Opportunity Details
            </h2>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Included in the email to the renter and visible to the registered
              agent. Kindly use neutral, factual details only (apartment
              features, address, cross streets, viewing times, next steps).
            </p>
            <div className="mt-3">
              <textarea
                ref={opportunityDetailsTextareaRef}
                rows={3}
                maxLength={OPPORTUNITY_DETAILS_MAX_LENGTH}
                value={opportunityDetails}
                onChange={(event) =>
                  setOpportunityDetails(
                    event.target.value.slice(
                      0,
                      OPPORTUNITY_DETAILS_MAX_LENGTH,
                    ),
                  )
                }
                placeholder={`e.g. I found an upcoming rental that may work for you: E 87th St between First
& Second Ave, large beautiful 1BR, $3,600, Sep 1 start, great light, elevator,
laundry in building. Video available. Reply all if interested.`}
                aria-invalid={hasRiskyOpportunityDetails}
                style={{ minHeight: "5.75rem" }}
                className={`w-full resize-none rounded-lg border px-3 py-2 text-sm leading-5 text-gray-800 outline-none transition focus:ring-2 ${
                  hasRiskyOpportunityDetails
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 text-gray-800 focus:border-blue-500 focus:ring-blue-100"
                }`}
              />
              <div className="mt-1 flex justify-end">
                <span className={`text-xs ${opportunityDetailsCounterClass}`}>
                  {opportunityDetailsCount} / {OPPORTUNITY_DETAILS_MAX_LENGTH}
                </span>
              </div>
            </div>
            {hasRiskyOpportunityDetails ? (
              <p className="mt-2 text-xs leading-5 text-red-600">
                {OPPORTUNITY_DETAILS_RISKY_WORDING_MESSAGE}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsOpportunityOpen(false);
                  setOpportunityDetails("");
                }}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendAdditionalOpportunity}
                disabled={hasRiskyOpportunityDetails || isSubmittingOpportunity}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingOpportunity ? "Sending..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
