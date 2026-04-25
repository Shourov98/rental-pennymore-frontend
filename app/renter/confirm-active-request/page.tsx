"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ConfirmationState = "loading" | "success" | "error";

export default function ConfirmActiveRequestPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";
  const [state, setState] = useState<ConfirmationState>("loading");
  const [message, setMessage] = useState("Confirming your request...");

  useEffect(() => {
    const controller = new AbortController();

    const confirmRequest = async () => {
      if (!token) {
        setState("error");
        setMessage("This confirmation link is invalid.");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/pre-market/confirm-active-search?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            signal: controller.signal,
          },
        );
        const data = (await response.json().catch(() => ({}))) as {
          success?: boolean;
          message?: string;
        };

        if (!response.ok || data?.success === false) {
          throw new Error(
            data?.message ||
              "We couldn't confirm your request right now. Please try again.",
          );
        }

        setState("success");
        setMessage("Your request is still active. Thank you for confirming.");
      } catch (error) {
        if (controller.signal.aborted) return;

        setState("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "We couldn't confirm your request right now. Please try again.",
        );
      }
    };

    void confirmRequest();

    return () => controller.abort();
  }, [token]);

  const toneClasses = useMemo(() => {
    if (state === "success") {
      return "border-green-200 bg-green-50 text-green-800";
    }

    if (state === "error") {
      return "border-red-200 bg-red-50 text-red-800";
    }

    return "border-blue-200 bg-blue-50 text-blue-800";
  }, [state]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">
          Active Request Confirmation
        </h1>
        <div className={`mt-6 rounded-xl border px-4 py-4 text-sm ${toneClasses}`}>
          {message}
        </div>
        <div className="mt-6">
          <Link
            href="/renter/saved-requests"
            className="inline-flex cursor-pointer items-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Back to Saved Requests
          </Link>
        </div>
      </div>
    </main>
  );
}
