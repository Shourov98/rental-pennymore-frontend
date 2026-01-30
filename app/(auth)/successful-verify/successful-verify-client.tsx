"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function SuccessfulVerifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") || "";
  const role = roleParam.toLowerCase();
  const isAgent = role === "agent";

  const title = isAgent
    ? "Registration request submitted"
    : "You’re almost there!";
  const buttonText = isAgent ? "Done" : "Get Started";
  const handleClick = () => {
    router.push("/signin");
  };

  return (
    <div className="w-full flex flex-col items-center justify-center text-center">
      {/* Success Icon */}
      <div className="flex items-center justify-center mb-5">
        <div className="bg-action rounded-full p-3 sm:p-4">
          <Image
            src="/icons/tick-01.svg"
            alt="Success"
            width={32}
            height={32}
            className="w-7 h-7 sm:w-8 sm:h-8 text-white"
          />
        </div>
      </div>

      {/* Title + Subtitle */}
      <h2 className="text-2xl font-semibold text-text-primary mb-2">{title}</h2>
      <p className="text-text-secondary mb-6 text-sm sm:text-base max-w-xs sm:max-w-sm">
        {isAgent ? (
          <>
            <span className="font-semibold">Your email has been verified.</span>
            <br />
            Agent registration is subject to review and approval.
            <br />
            If approved, you’ll be able to access your account and receive
            renter requests.
            <br />
            We may contact you if additional information is needed during the
            review.
          </>
        ) : (
          <>
            <span className="font-semibold">Your email is verified.</span>
            <br />
            Go ahead and submit your first request when you’re ready.
          </>
        )}
      </p>

      {/* Action Button */}
      <button
        onClick={handleClick}
        className="
          flex items-center justify-center gap-2
          bg-action hover:bg-action-hover
          text-text-inverted font-semibold
          px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl transition
        "
      >
        {buttonText}
      </button>
    </div>
  );
}
