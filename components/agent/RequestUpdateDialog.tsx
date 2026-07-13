"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const MAX_MESSAGE_LENGTH = 350;

const SUGGESTION_CHIPS = [
  "Did you reach out to the client yet?",
  "Have you scheduled any showings yet?",
  "Any applications submitted yet?",
  "Has the deal closed?",
] as const;

function MailWithCircleIcon() {
  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-12 sm:w-12"
    >
      <Image
        src="/icons/Ask-for-update.png"
        alt=""
        className="h-8 w-8 object-contain"
      />
    </span>
  );
}

export type RequestUpdateDialogProps = {
  matchedAgentFullName?: string | null;
  renterFullName?: string | null;
  isSubmitting: boolean;
  onConfirm: (personalMessage: string | undefined) => void;
  onCancel: () => void;
};

const formatFirstNameLastInitial = (fullName?: string | null) => {
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "Unknown";
  if (parts.length === 1) return parts[0];
  const lastInitial = parts[parts.length - 1]?.charAt(0)?.toUpperCase() ?? "";
  return `${parts[0]} ${lastInitial}.`;
};

export default function RequestUpdateDialog({
  matchedAgentFullName,
  renterFullName,
  isSubmitting,
  onConfirm,
  onCancel,
}: RequestUpdateDialogProps) {
  const [includePersonal, setIncludePersonal] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!includePersonal && message.length > 0) {
      // keep message content but disable the field
    }
  }, [includePersonal, message.length]);

  const textBoxActive = includePersonal || message.length > 0;
  const matchedAgentLabel = formatFirstNameLastInitial(matchedAgentFullName);
  const renterLabel = formatFirstNameLastInitial(renterFullName);

  const handleChipClick = (chip: string) => {
    if (!includePersonal) {
      setIncludePersonal(true);
    }
    setMessage(chip);
  };

  const handleConfirm = () => {
    const trimmed = message.trim();
    onConfirm(trimmed.length > 0 ? trimmed : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 p-3 sm:p-4">
      <div className="flex min-h-full items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-update-title"
          className="flex max-h-[calc(100vh-1.5rem)] w-[90vw] max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl sm:max-h-[calc(100vh-2rem)] sm:w-full"
        >
          <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4 sm:px-8 sm:py-5">
            <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-5">
              <MailWithCircleIcon />
              <div>
                <h2
                  id="request-update-title"
                  className="text-base font-semibold leading-tight text-gray-900 sm:text-xl"
                >
                  Request Update
                </h2>
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  Send a check-in email to{" "}
                  <span className="font-medium text-gray-900">
                    {matchedAgentLabel}
                  </span>{" "}
                  <span>(Agent)</span> regarding their work with{" "}
                  <span className="font-medium text-gray-900">
                    {renterLabel}
                  </span>
                  <span>(Renter)</span>.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="shrink-0 cursor-pointer rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              aria-label="Close request update dialog"
            >
              <X className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
          </div>

          <div className="overflow-y-auto px-5 py-5 sm:px-8 sm:py-8">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={includePersonal}
                onChange={(e) => setIncludePersonal(e.target.checked)}
                className="h-5 w-5 border-gray-400 text-blue-600 focus:ring-blue-500 sm:h-6 sm:w-6"
              />
              <span className="text-sm text-gray-700 sm:text-base">
                Include a personal message
              </span>
            </label>

            <div className="mt-5">
              <textarea
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                    setMessage(e.target.value);
                  }
                }}
                disabled={!textBoxActive}
                placeholder="Type a personal message…"
                className={`w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-base ${
                  textBoxActive
                    ? "bg-white text-gray-800"
                    : "bg-gray-50 text-gray-400"
                }`}
                rows={4}
                maxLength={MAX_MESSAGE_LENGTH}
              />
              <div className="mt-1 text-right text-xs text-gray-500">
                {message.length} / {MAX_MESSAGE_LENGTH}
              </div>
            </div>

            <div className="mt-3 flex flex-col items-start gap-2">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="cursor-pointer whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 sm:text-sm"
                >
                  {chip}
                </button>
              ))}
            </div>
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
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto sm:min-w-[220px] sm:px-14 sm:text-lg"
            >
              {isSubmitting ? "Sending..." : "Request Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
