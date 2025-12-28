"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarDays,
  DollarSign,
  MapPin,
} from "lucide-react";
import AgentContactCard from "@/components/AgentContactCard";
import { RootState } from "@/store/store";
import RenterPreferenceView from "@/components/RenterPreferenceView";
import {
  API_BASE_URL,
  ApiMatchesResponse,
  NormalizedMatchRequest,
  cacheMatches,
  normalizeRequest,
  readCachedMatches,
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

export default function RenterMatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const requestId = params?.id as string | undefined;

  const [request, setRequest] = useState<NormalizedMatchRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;
    const controller = new AbortController();

    const fetchRequest = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const cached = readCachedMatches().find((item) => item.id === requestId);
        if (cached) {
          setRequest(cached);
          setIsLoading(false);
          return;
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

        const queryParams = new URLSearchParams({
          page: "1",
          limit: "50",
        });

        const response = await fetch(
          `${API_BASE_URL}/pre-market/renter/requests/with-agents?${queryParams.toString()}`,
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
              "We couldn't load this request right now. Please try again."
          );
        }

        const normalizedList = (data.data ?? []).map(normalizeRequest);
        cacheMatches(normalizedList);

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
      note: "",
    };
  }, [
    buildingFeaturesList,
    bedrooms,
    preferences,
    guarantorList,
    locations,
    movingDateRange?.earliest,
    movingDateRange?.latest,
    petPolicyList,
    priceRange?.max,
    priceRange?.min,
    unitFeaturesList,
    bathrooms,
  ]);

  return (
    <section className="w-full min-h-screen bg-[#F8F9FB] px-4 md:px-8 py-6">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <p className="text-xs text-gray-500">Request ID: {requestId}</p>
            <h1 className="text-2xl font-semibold text-[#0A093D]">
              {request?.requestName || "Request Details"}
            </h1>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Price Range</p>
                <p className="text-base font-semibold text-[#0A093D]">
                  {request.priceRangeLabel}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Moving Window</p>
                <p className="text-base font-semibold text-[#0A093D]">
                  {formatDate(movingDateRange?.earliest)} -{" "}
                  {formatDate(movingDateRange?.latest)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
              <BedDouble className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Bedrooms</p>
                <p className="text-base font-semibold text-[#0A093D]">
                  {request.bedroomsLabel}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
              <Bath className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Bathrooms</p>
                <p className="text-base font-semibold text-[#0A093D]">
                  {request.bathroomsLabel}
                </p>
              </div>
          </div>
        </div>

          {/* Preferences Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#0A093D]">
                Request Preferences
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                {request.boroughsLabel}
              </div>
            </div>
            <RenterPreferenceView data={renterPreferenceData} />
          </div>

          {/* Matched Agents Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#0A093D]">
                Matched Agents ({request.agentMatchCount})
              </h2>
            </div>

            {request.matchedAgents.length === 0 ? (
              <p className="text-gray-600 text-sm">No agents matched yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {request.matchedAgents.map((agent) => (
                  <AgentContactCard
                    key={agent._id || agent.userId || agent.email || Math.random()}
                    agent={{
                      image: agent.profileImageUrl,
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
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
