"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { ArrowLeft, Phone, Mail, User } from "lucide-react";
import RenterPreferenceView from "@/components/RenterPreferenceView";
import { RootState } from "@/store/store";
import {
  API_BASE_URL,
  ApiAgentMatchesResponse,
  NormalizedAgentMatch,
  cacheAgentMatches,
  normalizeAgentMatch,
  readCachedAgentMatches,
} from "../utils";

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
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
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

export default function AgentMatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const requestId = params?.id as string | undefined;

  const [request, setRequest] = useState<NormalizedAgentMatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;
    const controller = new AbortController();

    const fetchRequest = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const cached = readCachedAgentMatches().find(
          (item) => item.id === requestId
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
          }
        );

        const data: ApiAgentMatchesResponse = await response
          .json()
          .catch(() => ({} as ApiAgentMatchesResponse));

        if (!response.ok || data?.success === false) {
          throw new Error(
            data?.message ||
              "We couldn't load this request right now. Please try again."
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
    };
  }, [renterInfo]);

  return (
    <section className="flex-1 bg-gray-50 min-h-screen px-4 md:px-8 py-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-sm p-5 flex flex-wrap justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ArrowLeft
            onClick={() => router.back()}
            className="w-4 h-4 text-gray-600 cursor-pointer"
          />
          <span onClick={() => router.push("/agent/matches")} className="cursor-pointer">
            Matched Requests
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
          {/* Renter Contact */}
          {renterContact && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#0A093D] mb-4">
                Renter Contact Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-gray-900 font-medium">{renterContact.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">{renterContact.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-gray-900 font-medium">{renterContact.phone}</p>
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
              <div className="text-sm text-gray-600">{request.boroughsLabel}</div>
            </div>

            <RenterPreferenceView data={renterPreferenceData} />
          </div>
        </>
      )}
    </section>
  );
}
