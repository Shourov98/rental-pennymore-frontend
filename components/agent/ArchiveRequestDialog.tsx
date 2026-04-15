"use client";

import { Archive, X } from "lucide-react";

export type ArchiveReason =
  | "registration_missing"
  | "disclosure_missing"
  | "search_inactive"
  | "client_placed";

type ArchiveMode = "registered" | "matched";

const reasonOptions: Record<
  ArchiveMode,
  Array<{ value: ArchiveReason; label: string; description: string }>
> = {
  registered: [
    {
      value: "registration_missing",
      label: "Registration Missing",
      description: "Renter did not sign brokerage client registration",
    },
    {
      value: "search_inactive",
      label: "Search Inactive",
      description: "Renter is no longer actively searching",
    },
    {
      value: "client_placed",
      label: "Client Placed",
      description: "Renter secured an apartment through you",
    },
  ],
  matched: [
    {
      value: "disclosure_missing",
      label: "Disclosure Missing",
      description: "Renter did not sign brokerage disclosure",
    },
    {
      value: "search_inactive",
      label: "Search Inactive",
      description: "Renter is no longer actively searching",
    },
    {
      value: "client_placed",
      label: "Client Placed",
      description: "Renter secured an apartment through you",
    },
  ],
};

export default function ArchiveRequestDialog({
  mode,
  selectedReason,
  isSubmitting,
  onReasonChange,
  onCancel,
  onConfirm,
}: {
  mode: ArchiveMode;
  selectedReason: ArchiveReason | "";
  isSubmitting: boolean;
  onReasonChange: (reason: ArchiveReason) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const title =
    mode === "registered"
      ? "Archive Registered Renter Request"
      : "Archive Matched Renter Request";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-8 py-5">
          <div className="flex items-center gap-5">
            <Archive className="h-10 w-10 fill-amber-400 text-amber-500" />
            <h2 className="text-2xl font-semibold tracking-wide text-gray-900">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close archive dialog"
          >
            <X className="h-8 w-8" />
          </button>
        </div>

        <div className="px-8 py-8">
          <p className="mb-6 text-lg text-gray-600">
            Select a reason to archive this request:
          </p>
          <div className="space-y-8">
            {reasonOptions[mode].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-4"
              >
                <input
                  type="radio"
                  name="archive-reason"
                  value={option.value}
                  checked={selectedReason === option.value}
                  onChange={() => onReasonChange(option.value)}
                  className="mt-1 h-6 w-6 border-gray-400 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  <span className="block text-xl font-semibold text-gray-700">
                    {option.label}
                  </span>
                  <span className="mt-4 block text-lg italic text-gray-500">
                    ({option.description})
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-8 py-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-gray-300 px-12 py-3 text-lg font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!selectedReason || isSubmitting}
            className="rounded bg-blue-600 px-14 py-3 text-lg font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSubmitting ? "Archiving..." : "Archive Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
