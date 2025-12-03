"use client";

import { useState } from "react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

export default function SettingsPage() {
  const [subscribed, setSubscribed] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleUnsubscribe = () => setSubscribed(false);
  const handleSubscribe = () => setSubscribed(true);

  const handleDelete = () => {
    // TODO: connect delete API
    setShowDeleteModal(false);
    alert("Account deleted (mock)");
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

          {subscribed ? (
            <button
              onClick={handleUnsubscribe}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Unsubscribe to Email
            </button>
          ) : (
            <button
              onClick={handleSubscribe}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Subscribe to Email
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

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-5 py-2 rounded-lg bg-red-100 text-red-600 font-medium hover:bg-red-200 transition"
          >
            Delete Account
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
