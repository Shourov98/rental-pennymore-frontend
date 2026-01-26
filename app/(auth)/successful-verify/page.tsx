"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PasswordChangedPage() {
  const router = useRouter();

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
      <h2 className="text-2xl font-semibold text-text-primary mb-2">
        You’re almost there!
      </h2>
      <p className="text-text-secondary mb-6 text-sm sm:text-base max-w-xs sm:max-w-sm">
        Your email has been verified, now you have to submit your preference to
        get listing according to your needs.
      </p>

      {/* Back to Login Button */}
      <button
        onClick={() => router.push("/signin")}
        className="
          flex items-center justify-center gap-2
          bg-action hover:bg-action-hover
          text-text-inverted font-semibold
          px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl transition
        "
      >
        Done
      </button>
    </div>
  );
}
