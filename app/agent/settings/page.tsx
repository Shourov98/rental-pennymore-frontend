"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAgentProfile,
  updateAgentProfile,
} from "@/store/slices/agentProfileSlice";
import { updateUser } from "@/store/slices/authSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { Spinner } from "@/components/ui/spinner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const agentSubscription = useSelector((state: RootState) => {
    const profileSubscription =
      state.agentProfile.profile?.emailSubscriptionEnabled ??
      state.auth.agentProfile?.emailSubscriptionEnabled;

    return typeof profileSubscription === "boolean"
      ? profileSubscription
      : state.auth.user?.emailSubscriptionEnabled;
  });
  const [subscribed, setSubscribed] = useState<boolean | null>(
    typeof agentSubscription === "boolean" ? agentSubscription : null,
  );
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(
    typeof agentSubscription !== "boolean",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptingRequests, setAcceptingRequests] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isTogglingRequests, setIsTogglingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof agentSubscription === "boolean") {
      setSubscribed(agentSubscription);
      setIsLoadingSubscription(false);
    }
  }, [agentSubscription]);

  useEffect(() => {
    if (!accessToken) return;

    let isCurrent = true;

    const fetchEmailSubscription = async () => {
      setError(null);
      setIsLoadingSubscription(true);

      try {
        const profile = await dispatch(fetchAgentProfile()).unwrap();
        if (!isCurrent) return;

        setSubscribed(profile.emailSubscriptionEnabled !== false);
      } catch (err) {
        if (!isCurrent) return;

        const message =
          err instanceof Error
            ? err.message
            : typeof err === "string"
              ? err
              : "We couldn't load your email notification setting right now.";
        setError(message);
      } finally {
        if (isCurrent) {
          setIsLoadingSubscription(false);
        }
      }
    };

    fetchEmailSubscription();

    return () => {
      isCurrent = false;
    };
  }, [accessToken, dispatch]);

  useEffect(() => {
    const fetchAcceptingRequests = async () => {
      setRequestsError(null);
      setIsLoadingRequests(true);
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

        const response = await fetch(
          `${API_BASE_URL}/agent/accepting-requests/status`,
          {
            method: "GET",
            headers,
          },
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data?.success === false) {
          throw new Error(
            data?.message || "We couldn't load your request status right now.",
          );
        }

        setAcceptingRequests(Boolean(data?.data?.acceptingRequests));
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "We couldn't load your request status right now.";
        setRequestsError(message);
      } finally {
        setIsLoadingRequests(false);
      }
    };

    fetchAcceptingRequests();
  }, [accessToken]);

  const toggleAcceptingRequests = async () => {
    setRequestsError(null);
    setIsTogglingRequests(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(
        `${API_BASE_URL}/agent/accepting-requests/toggle`,
        {
          method: "POST",
          headers,
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "We couldn't update your request status right now.",
        );
      }

      setAcceptingRequests(Boolean(data?.data?.acceptingRequests));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't update your request status right now.";
      setRequestsError(message);
    } finally {
      setIsTogglingRequests(false);
    }
  };

  const toggleSubscription = async () => {
    if (subscribed === null) return;

    setError(null);
    setIsSaving(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(
        `${API_BASE_URL}/agent/email-subscription/toggle`,
        {
          method: "POST",
          headers,
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            "We couldn't update your email subscription right now.",
        );
      }

      const isEnabled =
        typeof data?.data?.emailSubscriptionEnabled === "boolean"
          ? data.data.emailSubscriptionEnabled
          : !subscribed;
      setSubscribed(isEnabled);
      dispatch(
        updateAgentProfile({
          emailSubscriptionEnabled: isEnabled,
        }),
      );
      dispatch(
        updateUser({
          emailSubscriptionEnabled: isEnabled,
        }),
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't update your email subscription right now.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const isRequestsBusy = isLoadingRequests || isTogglingRequests;
  const requestsStatusLabel = isLoadingRequests
    ? "Loading"
    : isTogglingRequests
      ? "Updating"
      : acceptingRequests
        ? "Accepting requests"
        : "Not accepting requests";

  const isSubscriptionBusy = isLoadingSubscription || isSaving;
  const subscriptionStatusLabel = isLoadingSubscription
    ? "Loading"
    : isSaving
      ? "Updating"
      : subscribed
        ? "Receiving notification emails"
        : "Not receiving notification emails";

  return (
    <section className="w-full bg-gray-50 min-h-screen py-10 px-4 sm:px-8 md:px-12">
      {/* Header */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8">
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-900">
          Settings
        </h1>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            Accept renter requests
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Toggle whether you want to receive new renter requests.
          </p>

          {requestsError && (
            <p className="text-sm text-red-600 mb-3">{requestsError}</p>
          )}

          <div className="flex items-center gap-4">
            <button
              type="button"
              role="switch"
              aria-checked={acceptingRequests}
              aria-label="Accept renter requests"
              aria-busy={isRequestsBusy}
              onClick={toggleAcceptingRequests}
              disabled={isRequestsBusy}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-70 ${
                acceptingRequests
                  ? "bg-blue-600"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            >
              <span
                className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow transition ${
                  acceptingRequests ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              {requestsStatusLabel}
              {isRequestsBusy && <Spinner className="size-4 text-blue-600" />}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            Email notifications
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Toggle whether you want to receive notification emails.
          </p>

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

          <div className="flex items-center gap-4">
            <button
              type="button"
              role="switch"
              aria-checked={subscribed ?? false}
              aria-label="Email notifications"
              aria-busy={isSubscriptionBusy}
              onClick={toggleSubscription}
              disabled={isSubscriptionBusy || subscribed === null}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-70 ${
                subscribed ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"
              }`}
            >
              <span
                className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow transition ${
                  subscribed ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              {subscriptionStatusLabel}
              {isSubscriptionBusy && (
                <Spinner className="size-4 text-blue-600" />
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
