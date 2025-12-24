"use client";

import { useEffect, useState } from "react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateRenter } from "@/store/slices/authSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pos-exterior-researchers-vegetarian.trycloudflare.com/api/v1";

export default function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const router = useRouter();
  const renterSubscription = useSelector(
    (state: RootState) => state.auth.renter?.emailSubscriptionEnabled
  );
  const [subscribed, setSubscribed] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof renterSubscription === "boolean") {
      setSubscribed(renterSubscription);
    }
  }, [renterSubscription]);

  const toggleSubscription = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(
        `${API_BASE_URL}/renter/email-subscription/toggle`,
        {
          method: "POST",
          headers,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            "We couldn't update your email subscription right now."
        );
      }

      const isEnabled = !!data?.data?.emailSubscriptionEnabled;
      setSubscribed(isEnabled);
      dispatch(
        updateRenter({
          emailSubscriptionEnabled: isEnabled,
        })
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

  const handleDelete = async () => {
    setDeleteError(null);
    setIsDeleting(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(`${API_BASE_URL}/renter/profile`, {
        method: "DELETE",
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "We couldn't delete your account right now."
        );
      }

      dispatch(logout());
      setShowDeleteModal(false);
      router.replace("/signin");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't delete your account right now.";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="w-full bg-gray-50 min-h-screen py-10 px-4 sm:px-8 md:px-12">
      {/* Header */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8">
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-gray-900">
          Settings
        </h1>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Saved Requests */}
        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            Saved requests
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Alerts on every request you have saved
          </p>
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-600">Tip:</span> remove
            outdated searches in{" "}
            <a href="#" className="text-blue-500 hover:underline">
              My Activity
            </a>
          </p>
        </div>

        {/* Email Notifications */}
        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            {subscribed
              ? "Unsubscribe from email notification"
              : "Subscribe to email notification"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {subscribed
              ? "By unsubscribing, you’ll no longer get emails from our marketing team. This includes search updates."
              : "Subscribe again to receive search updates and marketing emails."}
          </p>

          {error && (
            <p className="text-sm text-red-600 mb-3">{error}</p>
          )}

          {subscribed ? (
            <button
              onClick={toggleSubscription}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-70"
              disabled={isSaving}
            >
              {isSaving ? "Updating..." : "Unsubscribe to Email"}
            </button>
          ) : (
            <button
              onClick={toggleSubscription}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-70"
              disabled={isSaving}
            >
              {isSaving ? "Updating..." : "Subscribe to Email"}
            </button>
          )}
        </div>

        {/* Delete Account */}
        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            Delete your Account
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            This will permanently delete your account from the system.
          </p>

          {deleteError && (
            <p className="text-sm text-red-600 mb-3">{deleteError}</p>
          )}

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-5 py-2 rounded-lg bg-red-100 text-red-600 font-medium hover:bg-red-200 transition disabled:opacity-70"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </section>
  );
}
