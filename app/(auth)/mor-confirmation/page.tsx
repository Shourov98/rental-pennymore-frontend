import Image from "next/image";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ReferConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userEmail = searchParams.get("email") || "your email";

  const handleNext = () => {
    router.push("/signin"); // navigate to next step (change if needed)
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Confirmation Card */}

      <h2 className="text-lg text-center sm:text-xl font-semibold text-text-primary mb-4">
        You’re one step away to complete registration
      </h2>
      <p className="text-text-secondary text-center text-sm sm:text-base leading-relaxed mb-5 max-w-[420px]">
        We’ve sent a temporary password to your email: {userEmail}
        <br />
        <br />
        Please enter your email and temporary password in signin page.
        <br />
        If you don’t see the email, please check your junk or spam folder.
        <br />
        If it’s there, mark it as “Not Junk” so future emails are delivered
        correctly.
      </p>

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

export default function ReferConfirmationPage() {
  return (
    <Suspense fallback={<div className="w-full" />}>
      <ReferConfirmationContent />
    </Suspense>
  );
}
