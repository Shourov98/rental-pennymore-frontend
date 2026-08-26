"use client";

import Image from "next/image";
import { X } from "lucide-react";

function XCircleIcon() {
  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 sm:h-12 sm:w-12"
    >
      <Image
        src="/icons/Unmatch.png"
        alt=""
        width={24}
        height={24}
        className="h-6 w-6 object-contain"
      />
    </span>
  );
}

export type UnmatchRequestDialogProps = {
  matchedAgentFullName?: string | null;
  renterFullName?: string | null;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const formatFirstNameLastInitial = (fullName?: string | null) => {
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "Unknown";
  if (parts.length === 1) return parts[0];
  const lastInitial = parts[parts.length - 1]?.charAt(0)?.toUpperCase() ?? "";
  return `${parts[0]} ${lastInitial}.`;
};

export default function UnmatchRequestDialog({
  matchedAgentFullName,
  renterFullName,
  isSubmitting,
  onConfirm,
  onCancel,
}: UnmatchRequestDialogProps) {
  const matchedAgentLabel = formatFirstNameLastInitial(matchedAgentFullName);
  const renterLabel = formatFirstNameLastInitial(renterFullName);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 p-3 sm:p-4">
      <div className="flex min-h-full items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="unmatch-request-title"
          className="flex max-h-[calc(100vh-1.5rem)] w-[90vw] max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl sm:max-h-[calc(100vh-2rem)] sm:w-full"
        >
          <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4 sm:px-8 sm:py-5">
            <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-5">
              <XCircleIcon />
              <div>
                <h2
                  id="unmatch-request-title"
                  className="text-base font-semibold leading-tight text-gray-900 sm:text-xl"
                >
                  Unmatch Request
                </h2>
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  <span>Unmatch</span>{" "}
                  <span className="font-medium text-gray-900">
                    {matchedAgentLabel}
                  </span>{" "}
                  <span>(Agent)</span>{" "}
                  <span>from</span>{" "}
                  <span className="font-medium text-gray-900">
                    {renterLabel}
                  </span>{" "}
                  <span>(Renter)</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="shrink-0 cursor-pointer rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              aria-label="Close unmatch dialog"
            >
              <X className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
          </div>

          <div className="overflow-y-auto px-5 py-5 sm:px-8 sm:py-8">
            <p className="text-sm text-gray-700 sm:text-base">
              Once unmatched, this request returns to All-Market status. You can
              reshare it to pair with a new agent.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:justify-end sm:gap-5 sm:px-8 sm:py-5">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded border border-gray-300 px-6 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 sm:w-auto sm:min-w-[110px] sm:px-12 sm:text-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto sm:min-w-[220px] sm:px-14 sm:text-lg"
            >
              {isSubmitting ? "Unmatching..." : "Confirm Unmatch"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
