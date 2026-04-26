"use client";

import { X } from "lucide-react";

export type ArchiveReason =
  | "registration_missing"
  | "disclosure_missing"
  | "search_inactive"
  | "client_placed";

export type ArchiveMode = "registered" | "matched";

function ArchiveFolderIcon() {
  return (
    <svg
      viewBox="0 0 36 36"
      aria-hidden="true"
      className="h-8 w-8 shrink-0 sm:h-10 sm:w-10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 11.5C7 9.84315 8.34315 8.5 10 8.5H15.2C16.1492 8.5 17.0418 8.94842 17.6 9.71L18.65 11.15C18.9328 11.5378 19.3865 11.7667 19.8664 11.7667H26C27.6569 11.7667 29 13.1098 29 14.7667V16H7V11.5Z"
        fill="#111827"
      />
      <path
        d="M7 15.5C7 13.8431 8.34315 12.5 10 12.5H26C27.6569 12.5 29 13.8431 29 15.5V25.5C29 27.1569 27.6569 28.5 26 28.5H10C8.34315 28.5 7 27.1569 7 25.5V15.5Z"
        stroke="#2563EB"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M7 16H29"
        stroke="#2563EB"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M18 19V28"
        stroke="#2563EB"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M13.5 23.5L18 19L22.5 23.5"
        stroke="#2563EB"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const formatDialogRenterName = (fullName?: string | null) => {
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "Unknown Renter";
  if (parts.length === 1) return parts[0];

  const lastInitial = parts[parts.length - 1]?.charAt(0)?.toUpperCase();
  return `${parts[0]} ${lastInitial}.`;
};

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
  renterName,
  selectedReason,
  isSubmitting,
  onReasonChange,
  onCancel,
  onConfirm,
}: {
  mode: ArchiveMode;
  renterName?: string | null;
  selectedReason: ArchiveReason | "";
  isSubmitting: boolean;
  onReasonChange: (reason: ArchiveReason) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const roleLabel =
    mode === "registered" ? "Registered Renter" : "Matched Renter";
  const titleName = formatDialogRenterName(renterName);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 p-3 sm:p-4">
      <div className="flex min-h-full items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="archive-request-title"
          className="flex max-h-[calc(100vh-1.5rem)] w-[90vw] max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-xl sm:max-h-[calc(100vh-2rem)] sm:w-full"
        >
          <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4 sm:px-8 sm:py-5">
            <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-5">
              <ArchiveFolderIcon />
              <h2
                id="archive-request-title"
                className="text-base font-semibold leading-tight tracking-wide text-gray-900 sm:text-xl"
              >
                <span>{`Archive Request - ${titleName}`}</span>{" "}
                <span className="text-[#6B7280]">({roleLabel})</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="shrink-0 cursor-pointer rounded p-1 text-gray-500 hover:bg-gray-100"
              aria-label="Close archive dialog"
            >
              <X className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
          </div>

          <div className="overflow-y-auto px-5 py-5 sm:px-8 sm:py-8">
            <p className="mb-5 text-sm text-gray-600 sm:mb-6 sm:text-base">
              Select a reason to archive this request:
            </p>
            <div className="space-y-6 sm:space-y-8">
              {reasonOptions[mode].map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-start gap-3 sm:gap-4"
                >
                  <input
                    type="radio"
                    name="archive-reason"
                    value={option.value}
                    checked={selectedReason === option.value}
                    onChange={() => onReasonChange(option.value)}
                    className="mt-1 h-5 w-5 border-gray-400 text-blue-600 focus:ring-blue-500 sm:h-6 sm:w-6"
                  />
                  <span>
                    <span className="block text-base font-semibold text-gray-700 sm:text-lg">
                      {option.label}
                    </span>
                    <span className="mt-2 block text-xs italic text-gray-500 sm:mt-4 sm:text-base">
                      ({option.description})
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:justify-end sm:gap-5 sm:px-8 sm:py-5">
            <button
              type="button"
              onClick={onCancel}
              className="w-full cursor-pointer rounded border border-gray-300 px-6 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 sm:w-auto sm:min-w-[110px] sm:px-12 sm:text-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!selectedReason || isSubmitting}
              className="w-full cursor-pointer rounded bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto sm:min-w-[220px] sm:px-14 sm:text-lg"
            >
              {isSubmitting ? "Archiving..." : "Archive Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
