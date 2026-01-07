"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ReferConfirmationPage() {
  const router = useRouter();

  const handleNext = () => {
    router.push("/signin"); // navigate to next step (change if needed)
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Confirmation Card */}

      <h2 className="text-lg text-center sm:text-xl font-semibold text-text-primary mb-4">
        You’re one step away to complete registration
      </h2>

      <button
        onClick={handleNext}
        className="
            mt-2 sm:mt-3 bg-action hover:bg-action-hover
            text-text-inverted text-sm sm:text-base
            font-semibold px-8 py-2.5 sm:py-3 rounded-lg transition
          "
      >
        Next
      </button>
    </div>
  );
}
