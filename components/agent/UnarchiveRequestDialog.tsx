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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-8 py-5">
          <div className="flex items-center gap-5">
            <ArchiveRestore className="h-10 w-10 text-blue-600" />
            <h2 className="text-3xl font-semibold tracking-wide text-gray-900">
              Unarchive Request
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close unarchive dialog"
          >
            <X className="h-8 w-8" />
          </button>
        </div>

        <div className="space-y-8 px-8 py-8 text-2xl font-semibold text-gray-900">
          <p>Are you sure you want to reactivate this request?</p>
          <p className="text-xl font-medium leading-relaxed">
            This request will be restored to its previous location
            <br />
            (Renter Requests or Matched Requests).
          </p>
          <p className="text-xl font-medium leading-relaxed">
            The request was previously archived
            <br />
            for the following reason:
          </p>
          <p>{reasonLabel}</p>
        </div>

        <div className="flex items-center justify-end gap-5 border-t border-gray-200 px-8 py-5">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded bg-blue-600 px-14 py-3 text-xl font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSubmitting ? "Unarchiving..." : "Unarchive Request"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-gray-300 px-12 py-3 text-xl font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
