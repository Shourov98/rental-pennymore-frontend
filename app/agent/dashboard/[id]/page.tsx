"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { ArrowLeft, Phone, Mail, User } from "lucide-react";
import RenterPreferenceView from "@/components/RenterPreferenceView";
import { RootState } from "@/store/store";
import {
  API_BASE_URL,
  NormalizedAgentRequest,
  normalizeAgentRequest,
  readCachedAgentRequests,
} from "../utils";
import { readCachedAgentMatches } from "../../matches/utils";

const unitFeatureLabels: Record<string, string> = {
  laundryInUnit: "Laundry in unit",
  privateOutdoorSpace: "Private outdoor space",
  dishwasher: "Dishwasher",
};

const buildingFeatureLabels: Record<string, string> = {
  doorman: "Doorman",
  elevator: "Elevator",
  laundryInBuilding: "Laundry in building",
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
  labels: Record<string, string>
) =>
  Object.entries(values || {})
    .filter(([, value]) => value)
    .map(([key]) => labels[key] || key);

export default function AgentRenterRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const requestId = params?.id as string | undefined;

  const [request, setRequest] = useState<NormalizedAgentRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequestSent, setIsRequestSent] = useState(false);
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

  useEffect(() => {
    if (!requestId) return;
    const controller = new AbortController();

    const fetchRequest = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const cached = readCachedAgentRequests().find(
          (item) => item.id === requestId
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
          }
        );

        const data = await response
          .json()
          .catch(() => ({} as { success?: boolean; message?: string }));

        if (!response.ok || data?.success === false) {
          throw new Error(
            data?.message ||
              "We couldn't load this request right now. Please try again."
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
    const cachedMatches = readCachedAgentMatches();
    const alreadyMatched = cachedMatches.some(
      (m) => m.id === requestId || m.raw?.requestId === requestId
    );
    setIsRequestSent(alreadyMatched);
  }, [requestId]);

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
    [unitFeatures]
  );
  const buildingFeaturesList = useMemo(
    () => formatFeatureGroup(buildingFeatures, buildingFeatureLabels),
    [buildingFeatures]
  );
  const petPolicyList = useMemo(
    () => formatFeatureGroup(petPolicy, petPolicyLabels),
    [petPolicy]
  );
  const guarantorList = useMemo(
    () => formatFeatureGroup(guarantorRequired, guarantorLabels),
    [guarantorRequired]
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
    return {
      name: renterInfo.renterName || "Unknown renter",
      email: renterInfo.renterEmail || "Not provided",
      phone: renterInfo.renterPhone || "Not provided",
      registrationType: renterInfo.registrationType || "Not specified",
    };
  }, [renterInfo]);
  const requestStatus = (
    request?.raw?.status ||
    request?.status ||
    ""
  ).toLowerCase();
  const isRequestSentByStatus =
    requestStatus === "sent" || requestStatus === "requested";
  const canRequestAccess = request?.raw?.canRequestAccess ?? true;
  const shouldDisableMatchRequest =
    !canRequestAccess || isRequestSentByStatus || isRequestSent;
  const showPaymentCard =
    request?.raw?.status?.toLowerCase() === "approved" ||
    request?.raw?.grantAccessStatus?.toLowerCase() === "approved";
  const paymentStatus = request?.raw?.payment?.status?.toLowerCase();
  const isPaid = paymentStatus === "succeeded";
  const paymentAmount =
    request?.raw?.payment?.amount ?? request?.raw?.chargeAmount;
  const paymentCurrency = request?.raw?.payment?.currency || "USD";

  const formatPaymentAmount = (amount?: number, currency?: string) => {
    if (amount == null) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleMatchRequest = async () => {
    if (!requestId || shouldDisableMatchRequest || isSubmitting) return;
    setStatusMessage(null);

    try {
      setIsSubmitting(true);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(
        `${API_BASE_URL}/pre-market/grant-access/request`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ preMarketRequestId: requestId }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        const errorMessage =
          data?.message || "Match request failed. Please try again.";
        throw new Error(errorMessage);
      }

      setIsRequestSent(true);
      setStatusMessage({
        type: "success",
        message: data?.message || "Access request created.",
      });
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
        }
      );
      console.log("Response:", response);

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "We couldn't create the payment intent."
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
      console.log("Payment intent created:", payload);
      setPaymentMessage({
        type: "success",
        message: "Payment intent created. Proceed with payment processing.",
      });
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

  return (
    <section className="flex-1 bg-gray-50 h-full min-h-0 px-4 md:px-8 py-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-sm p-5 flex flex-wrap justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ArrowLeft
            onClick={() => router.back()}
            className="w-4 h-4 text-gray-600 cursor-pointer"
          />
          <span
            onClick={() => router.push("/agent/dashboard")}
            className="cursor-pointer"
          >
            Renter Requests
          </span>
          <span>›</span>
          <span className="font-medium text-gray-800">
            {request?.requestName || "Request Details"}
          </span>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            request?.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {request?.status === "active" ? "Active" : "Inactive"}
        </span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
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
          </div>

          {showPaymentCard && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#0A093D]">
                    Grant Access Payment
                  </h2>
                  <p className="text-sm text-gray-600">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        isPaid ? "text-green-600" : "text-amber-600"
                      }`}
                    >
                      {isPaid ? "Paid" : paymentStatus || "Pending"}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Amount</p>
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
                  {paymentIntentData && (
                    <p className="text-xs text-gray-500">
                      Intent: {paymentIntentData.paymentIntentId}
                    </p>
                  )}
                </div>
              )}
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

            <RenterPreferenceView data={renterPreferenceData} />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              <button
                type="button"
                onClick={handleMatchRequest}
                disabled={
                  !requestId || shouldDisableMatchRequest || isSubmitting
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${
                  shouldDisableMatchRequest
                    ? "bg-gray-200 text-gray-600"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {shouldDisableMatchRequest
                  ? "Request Sent"
                  : isSubmitting
                  ? "Sending..."
                  : "Match Request"}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
