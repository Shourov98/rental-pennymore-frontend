"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import RenterPreferenceView from "@/components/RenterPreferenceView";
import OpportunityDetailsTextarea from "@/components/agent/OpportunityDetailsTextarea";
import type { AppDispatch, RootState } from "@/store/store";
import {
  API_BASE_URL,
  ApiAgentRequestsResponse,
  NormalizedAgentRequest,
  cacheAgentRequests,
  normalizeAgentRequest,
  readCachedAgentRequests,
} from "../utils";
import { selectAgentHasGrantAccess } from "@/store/slices/authSlice";
import { fetchAgentProfile } from "@/store/slices/agentProfileSlice";
import { isUpcomingScope } from "@/lib/scope";
import {
  buildMatchSearchPayload,
  getAgentRequestHref,
  isCurrentAgentRegisteredForRequest,
  matchesAgentFilters,
  readStoredAgentListState,
} from "../../requestNavigation";

const NAVIGATION_STORAGE_KEY = "agent-dashboard-navigation";
const ARCHIVE_NAVIGATION_STORAGE_KEY = "agent-archived-navigation";
const NAVIGATION_LIMIT_FALLBACK = 10;
type RepresentationType = "owner_representation" | "renter_representation";
type OwnerRepresentationRegisteredAgent = NonNullable<
  NormalizedAgentRequest["raw"]["ownerRepresentationRegisteredAgent"]
>;
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

const riskyOpportunityDetailsPattern = () =>
  new RegExp(
    `(${RISKY_OPPORTUNITY_DETAIL_PHRASES.map(escapeRegExp).join("|")})`,
    "gi",
  );

const hasRiskyOpportunityDetailsWording = (value: string) =>
  riskyOpportunityDetailsPattern().test(value);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const opportunityDetailsHelperText: Record<RepresentationType, string> = {
  renter_representation:
    "Included in the email to the renter and visible to the registered agent. Kindly use neutral, factual details only (apartment features, address, cross streets, viewing times, next steps).",
  owner_representation:
    "Included in the email to the registered agent. Kindly use neutral, factual details only (apartment features, address, cross streets, viewing times, next steps).",
};

const opportunityDetailsPlaceholder: Record<RepresentationType, string> = {
  renter_representation: `e.g. I found an upcoming rental that may work for you: E 87th St between First
& Second Ave, large beautiful 1BR, $3,600, Sep 1 start, great light, elevator,
laundry in building. Video available. Reply all if interested.`,
  owner_representation: `e.g. I have an exclusive coming up that can fit your client. Large one bedroom, West 72nd Street between Broadway and Amsterdam Avenue, dishwasher, high ceilings, $3,800, September 1 start date, elevator and laundry building. Reach out for showing times.`,
};

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

const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

interface StripePaymentFormProps {
  amountLabel: string;
  clientSecret: string;
  onClose: () => void;
  onSuccess: (status?: string) => void;
}

function StripePaymentForm({
  amountLabel,
  clientSecret,
  onClose,
  onSuccess,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!stripe || !elements) {
      setErrorMessage("Stripe is still loading. Please try again.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage("Card details are not available yet.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: cardElement },
        },
      );

      if (error) {
        throw new Error(error.message || "Payment failed.");
      }

      onSuccess(paymentIntent?.status);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-gray-200 p-3">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#111827",
                "::placeholder": { color: "#9CA3AF" },
              },
            },
          }}
        />
      </div>
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      <div className="flex flex-wrap gap-3 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || !elements || isSubmitting}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Processing..." : `Pay ${amountLabel}`}
        </button>
      </div>
    </form>
  );
}

export default function AgentRenterRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const currentUserId = useSelector((state: RootState) => state.auth.user?._id);
  const hasGrantAccess = useSelector(selectAgentHasGrantAccess);

  const requestId = params?.id as string | undefined;
  const isArchiveContext = searchParams.get("from") === "archive";
  const isMatchResultsContext = searchParams.get("from") === "matches";

  const [request, setRequest] = useState<NormalizedAgentRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [paymentIntentData, setPaymentIntentData] = useState<{
    clientSecret?: string;
    paymentIntentId?: string;
    grantAccessId?: string;
    amount?: number;
    currency?: string;
  } | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [localPaymentStatus, setLocalPaymentStatus] = useState<string | null>(
    null,
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isConfirmChecked, setIsConfirmChecked] = useState(false);
  const [isRepresentationOpen, setIsRepresentationOpen] = useState(false);
  const [selectedRepresentationType, setSelectedRepresentationType] = useState<
    RepresentationType | ""
  >("");
  const [opportunityDetails, setOpportunityDetails] = useState("");
  const [navigationTargets, setNavigationTargets] = useState<{
    previousHref: string | null;
    nextHref: string | null;
  }>({
    previousHref: null,
    nextHref: null,
  });
  const [isResolvingNavigation, setIsResolvingNavigation] = useState(false);
  const [mutatingAllMarketOffer, setMutatingAllMarketOffer] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    dispatch(fetchAgentProfile());
  }, [accessToken, dispatch]);

  useEffect(() => {
    if (!requestId) return;
    const controller = new AbortController();

    const fetchRequest = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const cached = readCachedAgentRequests().find(
          (item) => item.id === requestId,
        );
        if (cached) {
          setRequest(cached);
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

        const response = await fetch(
          `${API_BASE_URL}/pre-market/${requestId}`,
          {
            method: "GET",
            headers,
            signal: controller.signal,
          },
        );

        const data = await response.json().catch(
          () =>
            ({}) as {
              success?: boolean;
              message?: string;
              data?: {
                registeredAgentInfo?: NormalizedAgentRequest["raw"]["ownerRepresentationRegisteredAgent"];
              };
            },
        );

        if (!response.ok || data?.success === false) {
          throw new Error(
            data?.message ||
              "We couldn't load this request right now. Please try again.",
          );
        }

        const found = data?.data ? normalizeAgentRequest(data.data) : null;
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
    if (!requestId) return;

    const controller = new AbortController();

    const resolveNavigation = async () => {
      const storageKey = isArchiveContext
        ? ARCHIVE_NAVIGATION_STORAGE_KEY
        : NAVIGATION_STORAGE_KEY;
      const storedState = readStoredAgentListState(storageKey);
      const useStoredContext =
        storedState?.itemIds?.some((itemId) => itemId === requestId) ?? false;
      const storedMatchSearchFilters =
        !isArchiveContext && useStoredContext
          ? (storedState?.matchSearchFilters ?? null)
          : null;
      const useStoredMatchContext =
        Boolean(storedState?.isMatchResultsMode) &&
        Boolean(storedMatchSearchFilters);
      const pageLimit =
        useStoredContext && storedState?.limit
          ? storedState.limit
          : NAVIGATION_LIMIT_FALLBACK;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const matchesCurrentRequest = (item: NormalizedAgentRequest) =>
        [item.id, item.raw?._id, item.raw?.id, item.raw?.requestId].some(
          (id) => id === requestId,
        );

      try {
        setIsResolvingNavigation(true);
        let previousHref: string | null = null;
        let nextHref: string | null = null;
        let foundCurrent = false;
        let pageToFetch = 1;
        let totalPages = 1;

        while (pageToFetch <= totalPages && !nextHref) {
          const params = new URLSearchParams({
            page: String(pageToFetch),
            limit: String(pageLimit),
          });

          const endpoint = isArchiveContext
            ? "/pre-market/agent/archived-requests"
            : "/pre-market/all";
          const response =
            useStoredMatchContext && storedMatchSearchFilters
              ? await fetch(`${API_BASE_URL}/pre-market/agent/match-search`, {
                  method: "POST",
                  headers,
                  signal: controller.signal,
                  body: JSON.stringify({
                    ...buildMatchSearchPayload(storedMatchSearchFilters),
                    page: pageToFetch,
                    limit: pageLimit,
                  }),
                })
              : await fetch(`${API_BASE_URL}${endpoint}?${params.toString()}`, {
                  method: "GET",
                  headers,
                  signal: controller.signal,
                });

          const data: ApiAgentRequestsResponse = await response
            .json()
            .catch(() => ({}) as ApiAgentRequestsResponse);

          if (!response.ok || data?.success === false) {
            throw new Error(
              data?.message ||
                "We couldn't load nearby requests right now. Please try again.",
            );
          }

          const normalized = (data.data ?? []).map(normalizeAgentRequest);
          cacheAgentRequests(normalized);
          totalPages = Math.max(1, data.pagination?.totalPages ?? totalPages);

          const visibleRequests = useStoredMatchContext
            ? normalized
            : !isArchiveContext && useStoredContext && storedState
              ? normalized.filter((item) =>
                  matchesAgentFilters(
                    item.raw,
                    storedState.filters,
                    storedState.showOwnReferrals,
                    currentUserId,
                  ),
                )
              : normalized;

          for (const item of visibleRequests) {
            const itemHref = isArchiveContext
              ? getAgentRequestHref(item.raw, item.id, currentUserId)
              : isMatchResultsContext
                ? `/agent/dashboard/${item.id}?from=matches`
                : `/agent/dashboard/${item.id}`;
            if (foundCurrent) {
              nextHref = itemHref;
              break;
            }

            if (matchesCurrentRequest(item)) {
              foundCurrent = true;
            } else {
              previousHref = itemHref;
            }
          }

          pageToFetch += 1;
        }

        if (!controller.signal.aborted) {
          setNavigationTargets(
            foundCurrent
              ? { previousHref, nextHref }
              : { previousHref: null, nextHref: null },
          );
        }
      } catch {
        if (!controller.signal.aborted) {
          setNavigationTargets({ previousHref: null, nextHref: null });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsResolvingNavigation(false);
        }
      }
    };

    resolveNavigation();

    return () => controller.abort();
  }, [
    accessToken,
    currentUserId,
    isArchiveContext,
    isMatchResultsContext,
    requestId,
  ]);

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
    const isOwnerRepresentationView =
      request?.ownerRepresentationSelected ||
      request?.representation_type === "owner_representation" ||
      request?.raw?.ownerRepresentationSelected ||
      request?.raw?.representation_type === "owner_representation";

    if (isOwnerRepresentationView) return null;

    const candidateReferrerIds = [
      request?.raw?.referrerId,
      request?.raw?.referralAgentId,
      request?.raw?.referralInfo?.referrer?.referrerId,
      request?.raw?.referralInfo?.referrer?.id,
      renterInfo?.referralInfo?.referrerId,
    ]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.trim());

    const canViewContact =
      !!currentUserId &&
      candidateReferrerIds.some((value) => value === currentUserId);

    if (!canViewContact) return null;

    return {
      name: renterInfo.renterName || renterInfo.fullName || "Unknown renter",
      email: renterInfo.renterEmail || renterInfo.email || "Not provided",
      phone: renterInfo.renterPhone || renterInfo.phoneNumber || "Not provided",
      registrationType: renterInfo.registrationType || "Not specified",
    };
  }, [currentUserId, renterInfo, request]);
  const ownerRepresentationRegisteredAgent =
    request?.raw?.ownerRepresentationRegisteredAgent;
  const isRegisteredAgentForRequest = isCurrentAgentRegisteredForRequest(
    request?.raw,
    currentUserId ?? null,
  );
  const ownerRepresentationMatches = isRegisteredAgentForRequest
    ? (request?.raw?.ownerRepresentationMatches ?? [])
    : [];
  const canRequestAccess =
    request?.raw?.canRequestAccess &&
    (request?.raw?.status === "Available" || "available");
  const listingStatus = request?.raw?.listingStatus || "";
  const isUpcomingRequest = isUpcomingScope(
    request?.raw?.scope ?? request?.scopeLabel,
  );
  const isListingMatched = listingStatus.toLowerCase() === "matched";
  const grantAccessEnabled = hasGrantAccess === true;
  const grantAccessStatus = request?.raw?.grantAccessStatus?.toLowerCase();
  const isRenterRepresentationMatched =
    !isUpcomingRequest &&
    (isListingMatched ||
      request?.alreadyMatchedByAgent === true ||
      request?.raw?.alreadyMatchedByAgent === true ||
      request?.status?.toLowerCase() === "matched" ||
      request?.raw?.status?.toLowerCase() === "matched") &&
    (grantAccessStatus === "free" || grantAccessStatus === "paid") &&
    request?.representation_type !== "owner_representation" &&
    request?.raw?.representation_type !== "owner_representation";
  const shouldShowAddOpportunity = isRenterRepresentationMatched;
  const canAddAdditionalOpportunity = shouldShowAddOpportunity;
  const isOwnerRepresentationMatch =
    request?.representation_type === "owner_representation" ||
    request?.raw?.representation_type === "owner_representation";
  const canAddOwnerOpportunity =
    isOwnerRepresentationMatch && isUpcomingRequest && isListingMatched;
  const isAccessRequestLocked =
    request?.raw?.shareConsent === false && !isRegisteredAgentForRequest;
  const confirmRequestScope =
    request?.raw?.scope?.trim() || request?.scopeLabel?.trim() || "Request";
  const isAllMarketRequest = confirmRequestScope === "All Market";
  // const shouldDisableMatchRequest = grantAccessEnabled
  //   ? isListingMatched
  //   : !canRequestAccess || isRequestSentByStatus || isRequestSent;
  const showPaymentCard =
    request?.raw?.status?.toLowerCase() === "approved" ||
    request?.raw?.grantAccessStatus?.toLowerCase() === "approved";
  const paymentStatus =
    localPaymentStatus || request?.raw?.payment?.status?.toLowerCase();
  const isPaid = paymentStatus === "succeeded";
  const paymentAmount =
    request?.raw?.payment?.amount ?? request?.raw?.chargeAmount;
  const paymentCurrency = request?.raw?.payment?.currency || "USD";

  const isDisabled = grantAccessEnabled
    ? isListingMatched
      && !canAddAdditionalOpportunity
      && !canAddOwnerOpportunity
      && !isUpcomingRequest
    : canRequestAccess === false || isSubmitting
      ? true
      : false;

  // {grantAccessEnabled
  //                 ? isListingMatched
  //                   ? "Match Again"
  //                   : isSubmitting
  //                   ? "Matching..."
  //                   : "Match Request"
  //                 : !canRequestAccess
  //                 ? "Request Sent"
  //                 : isSubmitting
  //                 ? "Sending..."
  //                 : "Match Request"}

  const formatPaymentAmount = (amount?: number, currency?: string) => {
    if (amount == null) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleMatchRequest = async (
    representationType: RepresentationType = "renter_representation",
    details: string = "",
    additionalOpportunity: boolean = false,
  ) => {
    if (!requestId || isDisabled || isSubmitting) return;
    setStatusMessage(null);
    const normalizedOpportunityDetails = details
      .trim()
      .slice(0, OPPORTUNITY_DETAILS_MAX_LENGTH);
    if (hasRiskyOpportunityDetailsWording(normalizedOpportunityDetails)) {
      setStatusMessage({
        type: "error",
        message: OPPORTUNITY_DETAILS_RISKY_WORDING_MESSAGE,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      if (grantAccessEnabled) {
        const response = await fetch(
          `${API_BASE_URL}/pre-market/agent/${requestId}/match`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              representation_type: representationType,
              ...(additionalOpportunity ? { additionalOpportunity: true } : {}),
              ...(normalizedOpportunityDetails
                ? { opportunityDetails: normalizedOpportunityDetails }
                : {}),
            }),
          },
        );

        const data = await response.json().catch(
          () =>
            ({}) as {
              success?: boolean;
              message?: string;
              data?: {
                registeredAgentInfo?: OwnerRepresentationRegisteredAgent | null;
                representationSelectedAt?: string | null;
              };
              registeredAgentInfo?: OwnerRepresentationRegisteredAgent | null;
              representationSelectedAt?: string | null;
            },
        );

        if (!response.ok || data?.success === false) {
          const errorMessage =
            data?.message || "Match request failed. Please try again.";
          throw new Error(errorMessage);
        }

        const matchPayload = data?.data ?? data;
        const representationSelectedAt =
          matchPayload?.representationSelectedAt ?? new Date().toISOString();

        setRequest((prev) =>
          prev
            ? {
                ...prev,
                ownerRepresentationSelected:
                  representationType === "owner_representation"
                    ? true
                    : prev.ownerRepresentationSelected,
                representation_type:
                  representationType === "owner_representation"
                    ? "owner_representation"
                    : representationType,
                representationSelectedAt:
                  representationType === "owner_representation"
                    ? representationSelectedAt
                    : prev.representationSelectedAt,
                raw: {
                  ...prev.raw,
                  ...(representationType === "owner_representation"
                    ? {
                        ownerRepresentationSelected: true,
                        ownerRepresentationRegisteredAgent:
                          matchPayload?.ownerRepresentationRegisteredAgent ??
                          matchPayload?.registeredAgentInfo ??
                          prev.raw.ownerRepresentationRegisteredAgent,
                        ownerRepresentationMatches:
                          matchPayload?.ownerRepresentationMatches ??
                          prev.raw.ownerRepresentationMatches,
                        representation_type: representationType,
                        representationSelectedAt,
                      }
                    : {
                        listingStatus: "matched",
                        status: "matched",
                        grantAccessStatus: "free",
                        representation_type: representationType,
                        representationSelectedAt,
                      }),
                },
              }
            : prev,
        );
        setStatusMessage({
          type: "success",
          message:
            data?.message ||
            (additionalOpportunity
              ? "Additional opportunity sent."
              : representationType === "owner_representation"
                ? "Owner representation selection saved."
                : "Match request created."),
        });
      } else {
        const response = await fetch(
          `${API_BASE_URL}/pre-market/grant-access/request`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              preMarketRequestId: requestId,
              representation_type: representationType,
              ...(normalizedOpportunityDetails
                ? { opportunityDetails: normalizedOpportunityDetails }
                : {}),
            }),
          },
        );

        const data = await response
          .json()
          .catch(
            () =>
              ({}) as {
                success?: boolean;
                message?: string;
                data?: {
                  ownerRepresentationMatches?: unknown;
                  ownerRepresentationRegisteredAgent?: unknown;
                };
                ownerRepresentationMatches?: unknown;
                ownerRepresentationRegisteredAgent?: unknown;
              },
          );

        if (!response.ok || data?.success === false) {
          const errorMessage =
            data?.message || "Match request failed. Please try again.";
          throw new Error(errorMessage);
        }

        const matchPayload = data?.data ?? data;

        setRequest((prev) =>
          prev
            ? {
                ...prev,
                ownerRepresentationSelected:
                  representationType === "owner_representation"
                    ? true
                    : prev.ownerRepresentationSelected,
                raw: {
                  ...prev.raw,
                  canRequestAccess: false,
                  status: "requested",
                  representation_type: representationType,
                  representationSelectedAt: new Date().toISOString(),
                  ...(representationType === "owner_representation"
                    ? {
                        ownerRepresentationSelected: true,
                        ownerRepresentationRegisteredAgent:
                          matchPayload?.ownerRepresentationRegisteredAgent ??
                          prev.raw.ownerRepresentationRegisteredAgent,
                        ownerRepresentationMatches:
                          matchPayload?.ownerRepresentationMatches ??
                          prev.raw.ownerRepresentationMatches,
                      }
                    : {}),
                },
                representation_type: representationType,
                representationSelectedAt: new Date().toISOString(),
              }
            : prev,
        );
        setStatusMessage({
          type: "success",
          message: data?.message || "Access request created.",
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Match request failed. Please try again.";
      setStatusMessage({ type: "error", message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePaymentIntent = async () => {
    if (!request?.raw?.grantAccessId || isCreatingIntent) return;
    setPaymentMessage(null);

    try {
      if (!stripePublishableKey) {
        throw new Error(
          "Stripe is not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
        );
      }

      setIsCreatingIntent(true);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(
        `${API_BASE_URL}/pre-market/payment/create-intent`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ grantAccessId: request.raw.grantAccessId }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "We couldn't create the payment intent.",
        );
      }

      const payload = data?.data ?? data;
      setPaymentIntentData({
        clientSecret: payload?.clientSecret,
        paymentIntentId: payload?.paymentIntentId,
        grantAccessId: payload?.grantAccessId || request.raw.grantAccessId,
        amount: payload?.amount ?? paymentAmount,
        currency: payload?.currency ?? paymentCurrency,
      });
      setIsPaymentOpen(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't create the payment intent.";
      setPaymentMessage({ type: "error", message });
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const handlePaymentSuccess = (status?: string) => {
    setLocalPaymentStatus(status || "succeeded");
    setIsPaymentOpen(false);
    setPaymentMessage({
      type: "success",
      message:
        status === "succeeded"
          ? "Payment completed successfully."
          : "Payment submitted.",
    });
  };

  const navigateToAdjacentRequest = (targetHref: string | null) => {
    if (!targetHref) return;
    router.push(targetHref);
  };

  const backHref = isArchiveContext
    ? "/agent/archived-requests"
    : "/agent/dashboard";
  const backLabel = isArchiveContext
    ? "Archived Requests"
    : isMatchResultsContext
      ? "Renter Matches"
      : "Renter Requests";
  const handleBack = () => {
    if (isMatchResultsContext) {
      router.back();
    } else {
      router.push(backHref);
    }
  };
  const opportunityDetailsCount = opportunityDetails.length;
  const opportunityDetailsCounterClass =
    opportunityDetailsCount >= OPPORTUNITY_DETAILS_MAX_LENGTH
      ? "text-red-600"
      : opportunityDetailsCount >= 280
        ? "text-orange-400"
        : "text-[#999999]";
  const hasRiskyOpportunityDetails =
    hasRiskyOpportunityDetailsWording(opportunityDetails);

  /**
   * Toggles the "All Market Offer" gate for this request from the detail
   * page. Only meaningful for the registered agent on an active Upcoming
   * request. Setting `enabled: false` is a one-way trip — the backend flips
   * scope to "All Market" and locks the gate permanently for that request.
   */
  const handleToggleAllMarketOffer = async (nextEnabled: boolean) => {
    const apiRequestId = request?.raw?._id;
    if (!apiRequestId || !isRegisteredAgentForRequest) {
      return;
    }
    const rawScope
      = request?.raw?.scope?.trim() ?? request?.scopeLabel?.trim();
    if (rawScope === "Upcoming (M)") {
      return;
    }
    setError(null);
    setMutatingAllMarketOffer(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      const response = await fetch(
        `${API_BASE_URL}/pre-market/${apiRequestId}/all-market-offer`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ enabled: nextEnabled }),
        },
      );
      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
        data?: {
          scope?: string;
          searchActivity?: { allMarketOfferEnabled?: boolean };
        };
      };
      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message
            || "We couldn't update the All Market Offer gate right now. Please try again.",
        );
      }
      // Update local request state so the toggle + cards reflect the new
      // server state immediately without a full refetch.
      setRequest((prev) => {
        if (!prev) return prev;
        const nextScope = data?.data?.scope ?? prev.raw?.scope ?? prev.scopeLabel;
        const nextEnabledValue =
          data?.data?.searchActivity?.allMarketOfferEnabled ?? nextEnabled;
        return {
          ...prev,
          allMarketOfferEnabled: nextEnabledValue,
          scopeLabel: typeof nextScope === "string" ? nextScope : prev.scopeLabel,
          isScopeUpcomingLike:
            nextScope === "Upcoming" || nextScope === "Upcoming (M)",
          raw: {
            ...prev.raw,
            scope: nextScope,
            allMarketOfferEnabled: nextEnabledValue,
            searchActivity: {
              ...prev.raw?.searchActivity,
              allMarketOfferEnabled: nextEnabledValue,
            },
          },
        };
      });
    } catch (err) {
      const message
        = err instanceof Error
          ? err.message
          : "We couldn't update the All Market Offer gate right now. Please try again.";
      setError(message);
    } finally {
      setMutatingAllMarketOffer(false);
    }
  };

  return (
    <section className="flex-1 bg-gray-50 h-full min-h-0 px-4 md:px-8 py-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-sm p-5 flex flex-wrap justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ArrowLeft
            onClick={handleBack}
            className="w-4 h-4 text-gray-600 cursor-pointer"
          />
          <span onClick={handleBack} className="cursor-pointer">
            {backLabel}
          </span>
          <span>›</span>
          <span className="font-medium text-gray-800">
            {request?.requestName || "Request Details"}
          </span>
        </div>

        {(() => {
          const rawStatus = request?.raw?.status || request?.status;
          const archiveLabel =
            request?.archiveReasonLabel || request?.raw?.archiveReasonLabel;
          if (!rawStatus && !archiveLabel) return null;
          if (request?.isArchivedForAgent || request?.raw?.isArchivedForAgent) {
            return (
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                {archiveLabel || "Archived"}
              </span>
            );
          }
          if (!rawStatus) {
            return (
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                {archiveLabel}
              </span>
            );
          }
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
            (request?.alreadyMatchedByAgent || matchedFromGrantStatus
              ? "Matched"
              : "Open");
          const isMatchedByAgent = statusLabel === "Matched";
          const statusClasses = isMatchedByAgent
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-600";

          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses}`}
            >
              {statusLabel}
            </span>
          );
        })()}
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-500">Price Range</p>
              <p className="text-base font-semibold text-[#0A093D]">
                {request.priceMaxLabel}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-500">Moving Window</p>
              <p className="text-base font-semibold text-[#0A093D]">
                {formatDate(movingDateRange?.earliest)} -{" "}
                {formatDate(movingDateRange?.latest)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-500">Bedrooms</p>
              <p className="text-base font-semibold text-[#0A093D]">
                {request.bedroomsLabel}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-500">Bathrooms</p>
              <p className="text-base font-semibold text-[#0A093D]">
                {request.bathroomsLabel}
              </p>
            </div>
            {isRegisteredAgentForRequest
              ? (() => {
                const gateValue = request.allMarketOfferEnabled !== false;
                const rawScope
                  = request?.raw?.scope?.trim() ?? request?.scopeLabel?.trim();
                const isUpcomingM = rawScope === "Upcoming (M)";
                const isLocked = isUpcomingM || mutatingAllMarketOffer;
                const lockedReason = isUpcomingM
                  ? "Locked once the request becomes Upcoming (M)"
                  : "Toggle the day-10 follow-up email";
                return (
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <p className="text-xs text-gray-500 leading-tight">
                      Offer full-market agent help
                      <br />
                      <span className="text-[11px] text-gray-400">
                        (day-10 follow-up email)
                      </span>
                    </p>
                    <label
                      className={`mt-2 inline-flex items-center gap-2 ${
                        isLocked
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer"
                      }`}
                      title={lockedReason}
                    >
                      <input
                        type="checkbox"
                        checked={gateValue}
                        disabled={isLocked}
                        onChange={(event) => {
                          if (isLocked) return;
                          void handleToggleAllMarketOffer(
                            event.target.checked,
                          );
                        }}
                        className={`h-5 w-5 rounded text-blue-600 focus:ring-blue-500 ${
                          isLocked
                            ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                            : "border-gray-300"
                        }`}
                        aria-label="Toggle All Market Offer"
                      />
                      <span
                        className={`text-xs font-medium ${
                          isLocked ? "text-gray-400" : "text-gray-700"
                        }`}
                      >
                        {gateValue ? "On" : "Off"}
                      </span>
                    </label>
                  </div>
                );
              })()
              : null}
          </div>

          {showPaymentCard && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#0A093D]">
                    Grant Access Payment
                  </h2>
                  <p className="text-sm text-gray-600">
                    Complete payment to unlock renter details.
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isPaid
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {isPaid ? "Paid" : paymentStatus || "Pending"}
                  </span>
                  <p className="mt-2 text-xs text-gray-500">Amount</p>
                  <p className="text-lg font-semibold text-[#0A093D]">
                    {formatPaymentAmount(paymentAmount, paymentCurrency)}
                  </p>
                </div>
              </div>

              {paymentMessage && (
                <p
                  className={`mt-3 text-sm ${
                    paymentMessage.type === "error"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {paymentMessage.message}
                </p>
              )}

              {!isPaid && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCreatePaymentIntent}
                    disabled={!request?.raw?.grantAccessId || isCreatingIntent}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isCreatingIntent ? "Creating..." : "Pay Now"}
                  </button>
                </div>
              )}
            </div>
          )}

          {isPaymentOpen &&
            paymentIntentData?.clientSecret &&
            stripePromise && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#0A093D]">
                      Complete Payment
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsPaymentOpen(false)}
                      className="text-sm text-gray-500 hover:text-gray-800"
                    >
                      Close
                    </button>
                  </div>
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      amountLabel={formatPaymentAmount(
                        paymentIntentData.amount ?? paymentAmount,
                        paymentIntentData.currency ?? paymentCurrency,
                      )}
                      clientSecret={paymentIntentData.clientSecret}
                      onClose={() => setIsPaymentOpen(false)}
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                </div>
              </div>
            )}

          {/* Renter Contact */}
          {renterContact && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#0A093D] mb-4">
                Renter Contact
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-gray-900 font-medium">
                      {renterContact.name}
                    </p>
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
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-[#0A093D]">
                  Renter Preference
                </h2>
                <div className="text-sm text-gray-600">
                  {request.boroughsLabel}
                </div>
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
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      !requestId ||
                      isDisabled ||
                      isAccessRequestLocked ||
                      isSubmitting
                    ) {
                      return;
                    }
                    if (canAddOwnerOpportunity) {
                      setSelectedRepresentationType("owner_representation");
                    } else if (canAddAdditionalOpportunity) {
                      setSelectedRepresentationType("renter_representation");
                    } else {
                      setSelectedRepresentationType("");
                    }
                    setOpportunityDetails("");
                    setIsRepresentationOpen(true);
                  }}
                  disabled={isDisabled || isAccessRequestLocked}
                  className={`justify-self-start px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${
                    isDisabled || isAccessRequestLocked
                      ? "bg-gray-200 text-gray-600"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {grantAccessEnabled
                    ? canAddOwnerOpportunity
                      ? "Add Opportunity"
                      : shouldShowAddOpportunity
                        ? "Add Opportunity"
                        : isListingMatched
                          ? "Add Opportunity"
                          : isSubmitting
                            ? "Matching..."
                            : "Match Request"
                    : !canRequestAccess
                      ? "Request Sent"
                      : isSubmitting
                        ? "Sending..."
                        : "Match Request"}
                </button>

                <div className="flex items-center justify-center gap-3 justify-self-center">
                  <button
                    type="button"
                    onClick={() =>
                      navigateToAdjacentRequest(navigationTargets.previousHref)
                    }
                    disabled={
                      !navigationTargets.previousHref || isResolvingNavigation
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 md:min-w-36"
                    aria-label="Previous request"
                  >
                    <ChevronLeft className="h-5 w-5 text-sky-500" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigateToAdjacentRequest(navigationTargets.nextHref)
                    }
                    disabled={
                      !navigationTargets.nextHref || isResolvingNavigation
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 md:min-w-36"
                    aria-label="Next request"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-5 w-5 text-sky-500" />
                  </button>
                </div>

                <div aria-hidden="true" />
              </div>

              {ownerRepresentationRegisteredAgent && (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="mb-3 text-base font-semibold text-[#0A093D]">
                    Registered Renter Agent
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-medium text-gray-900">
                          {ownerRepresentationRegisteredAgent.fullName ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">
                          {ownerRepresentationRegisteredAgent.email ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">
                          {ownerRepresentationRegisteredAgent.phoneNumber ||
                            "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {ownerRepresentationMatches.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-blue-700 mb-3">
                  Matched Owner Agents:
                </h3>
                <div className="space-y-1 text-sm">
                  {ownerRepresentationMatches.map((agent, index) => (
                    <p
                      key={`${agent.agentId || agent.email || index}`}
                      className={
                        agent.isViewed ? "text-gray-500" : "text-gray-900"
                      }
                    >
                      <span className="font-semibold">{index + 1}. </span>
                      <span className="font-semibold">
                        {agent.fullName || "Matched Agent"}
                      </span>
                      <span> | email: {agent.email || "N/A"}</span>
                      <span> | number: {agent.phoneNumber || "N/A"}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {isRepresentationOpen && (
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
              Which side would you like to represent?
            </h2>
            <div className="space-y-4">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 text-sm text-gray-800">
                <input
                  type="radio"
                  name="representation-type"
                  value="owner_representation"
                  checked={
                    selectedRepresentationType === "owner_representation"
                  }
                  onChange={() => {
                    setSelectedRepresentationType("owner_representation");
                    setOpportunityDetails("");
                  }}
                  className="h-4 w-4 text-blue-600"
                />
                <span>I intend to represent the owner</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 text-sm text-gray-800">
                <input
                  type="radio"
                  name="representation-type"
                  value="renter_representation"
                  checked={
                    selectedRepresentationType === "renter_representation"
                  }
                  onChange={() => {
                    setSelectedRepresentationType("renter_representation");
                    setOpportunityDetails("");
                  }}
                  className="h-4 w-4 text-blue-600"
                />
                <span>I intend to represent the renter</span>
              </label>
            </div>
            {selectedRepresentationType ? (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  Add Opportunity Details
                </h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {opportunityDetailsHelperText[selectedRepresentationType]}
                </p>
                <div className="mt-3">
                  <OpportunityDetailsTextarea
                    key={selectedRepresentationType}
                    representationType={selectedRepresentationType}
                    value={opportunityDetails}
                    onChange={setOpportunityDetails}
                    maxLength={OPPORTUNITY_DETAILS_MAX_LENGTH}
                    placeholder={
                      selectedRepresentationType
                        ? opportunityDetailsPlaceholder[selectedRepresentationType]
                        : opportunityDetailsPlaceholder.renter_representation
                    }
                    ariaInvalid={hasRiskyOpportunityDetails}
                    style={{ minHeight: "5.75rem" }}
                    className={`resize-none rounded-lg border px-3 py-2 text-sm leading-5 text-gray-800 outline-none transition focus:ring-2 ${
                      hasRiskyOpportunityDetails
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 text-gray-800 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                  />
                  <div className="mt-1 flex justify-end">
                    <span
                      className={`text-xs ${opportunityDetailsCounterClass}`}
                    >
                      {opportunityDetailsCount} /{" "}
                      {OPPORTUNITY_DETAILS_MAX_LENGTH}
                    </span>
                  </div>
                </div>
                {hasRiskyOpportunityDetails ? (
                  <p className="mt-2 text-xs leading-5 text-red-600">
                    {OPPORTUNITY_DETAILS_RISKY_WORDING_MESSAGE}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsRepresentationOpen(false);
                  setSelectedRepresentationType("");
                  setOpportunityDetails("");
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (
                    !selectedRepresentationType ||
                    hasRiskyOpportunityDetails
                  ) {
                    return;
                  }

                  setIsRepresentationOpen(false);
                  if (selectedRepresentationType === "owner_representation") {
                    handleMatchRequest(
                      "owner_representation",
                      opportunityDetails,
                      canAddOwnerOpportunity,
                    );
                    return;
                  }

                  setIsConfirmChecked(false);
                  setIsConfirmOpen(true);
                }}
                disabled={
                  !selectedRepresentationType ||
                  hasRiskyOpportunityDetails ||
                  isSubmitting
                }
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Confirm Match Request &ndash; {confirmRequestScope}
            </h2>
            {isAllMarketRequest ? (
              <div className="space-y-3 text-sm text-gray-700 mb-4">
                <p>
                  By proceeding, you confirm that you intend to represent this
                  renter with full-service, full-market representation,
                  including agent guidance, landlord and building screening,
                  scheduling, coordination, and ongoing support throughout the
                  rental process.
                </p>
                <p>
                  You will verify the renter&rsquo;s Corcoran agency disclosures
                  and client registration prior to taking any action on the
                  renter&rsquo;s behalf.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-700 mb-3">
                  By proceeding, you confirm that:
                </p>
                <ul className="text-sm text-gray-700 space-y-2 mb-4 list-disc pl-5">
                  <li>
                    You will verify the renter&rsquo;s Corcoran agency
                    disclosures and client registration prior to taking any
                    action on the renter&rsquo;s behalf.
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
                    If you are the agent identified in the renter’s disclosure,
                    you may pursue this opportunity on the renter’s behalf.
                  </li>
                  <li>
                    If you are not identified in the renter’s disclosure, you
                    will not take steps on the renter’s behalf until you are
                    properly identified through an additional agency disclosure
                    signed by the renter.
                  </li>
                </ul>
              </>
            )}
            <label className="flex items-start gap-2 text-sm text-gray-700 mb-6">
              <input
                type="checkbox"
                checked={isConfirmChecked}
                onChange={(e) => setIsConfirmChecked(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600"
              />
              <span className="font-semibold">
                {isAllMarketRequest
                  ? "Confirm Full-Service Full-Market Representation"
                  : "I confirm the above and approve proceeding with this match."}
              </span>
            </label>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isConfirmChecked || hasRiskyOpportunityDetails) return;
                  setIsConfirmOpen(false);
                  handleMatchRequest(
                    "renter_representation",
                    opportunityDetails,
                    canAddAdditionalOpportunity,
                  );
                }}
                disabled={
                  !isConfirmChecked ||
                  hasRiskyOpportunityDetails ||
                  isSubmitting
                }
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
