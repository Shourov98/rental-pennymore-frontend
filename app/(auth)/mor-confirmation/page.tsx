"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ReferConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userEmail = searchParams.get("email") || "your email";

  const handleNext = () => {
    router.push("/signin");
  };

  return (
    <div className="w-full">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">
          You’re one step away
        </h2>
        <p className="mt-2 text-sm sm:text-base text-text-secondary leading-relaxed">
          We sent a temporary password to:
        </p>

        <div className="mt-3 inline-flex items-center justify-center rounded-full bg-blue-50 px-4 py-1.5">
          <span className="text-sm sm:text-base font-semibold text-blue-700">
            {userEmail}
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm sm:text-base text-text-secondary leading-relaxed">
        <p>
          Please go to the sign-in page and enter your email plus the temporary
          password.If you don’t see the email, check your{" "}
          <span className="font-medium">Spam</span> or{" "}
          <span className="font-medium">Junk</span> folder.
        </p>

        <p></p>

        <p>
          If it’s there, mark it as{" "}
          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 font-semibold text-gray-900">
            Not Junk
          </span>{" "}
          so future emails arrive correctly.
        </p>
      </div>

      <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:justify-center">
        <button
          onClick={handleNext}
          className="
              w-full sm:w-auto
              bg-action hover:bg-action-hover
              text-text-inverted text-sm sm:text-base
              font-semibold px-8 py-2.5 sm:py-3 rounded-lg transition
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            "
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function ReferConfirmationPage() {
  return (
    <Suspense fallback={<div className="w-full" />}>
      <ReferConfirmationContent />
    </Suspense>
  );
}
