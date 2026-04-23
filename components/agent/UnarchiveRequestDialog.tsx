"use client";

import { ArchiveRestore, X } from "lucide-react";

export default function UnarchiveRequestDialog({
  reasonLabel,
  isSubmitting,
  onCancel,
  onConfirm,
}: {
  reasonLabel: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 p-3 sm:p-4">
      <div className="flex min-h-full items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="unarchive-request-title"
          className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-xl sm:max-h-[calc(100vh-2rem)]"
        >
          <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4 sm:px-8 sm:py-5">
            <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-5">
              <ArchiveRestore className="h-8 w-8 shrink-0 text-blue-600 sm:h-10 sm:w-10" />
              <h2
                id="unarchive-request-title"
                className="text-xl font-semibold leading-tight tracking-wide text-gray-900 sm:text-2xl lg:text-3xl"
              >
                Unarchive Request
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-100"
              aria-label="Close unarchive dialog"
            >
              <X className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
          </div>

          <div className="space-y-5 overflow-y-auto px-5 py-5 text-gray-900 sm:space-y-8 sm:px-8 sm:py-8">
            <p className="text-2xl font-semibold leading-snug sm:text-3xl">
              Are you sure you want to reactivate this request?
            </p>
            <p className="text-base font-medium leading-relaxed sm:text-xl">
              This request will be restored to its previous location (Renter
              Requests or Matched Requests).
            </p>
            <p className="text-base font-medium leading-relaxed sm:text-xl">
              The request was previously archived for the following reason:
            </p>
            <p className="text-xl font-semibold leading-snug sm:text-2xl">
              {reasonLabel}
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:justify-end sm:gap-5 sm:px-8 sm:py-5">
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded border border-gray-300 px-6 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 sm:w-auto sm:px-12 sm:text-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="w-full rounded bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto sm:px-14 sm:text-xl"
            >
              {isSubmitting ? "Unarchiving..." : "Unarchive Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
