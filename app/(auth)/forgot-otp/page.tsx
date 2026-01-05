"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pos-exterior-researchers-vegetarian.trycloudflare.com/api/v1";

function OtpVerifyPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // only single digit numbers
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input automatically
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 4) {
      setStatusMessage({
        type: "error",
        message: "Please enter the 4-digit code.",
      });
      return;
    }

    if (!email) {
      setStatusMessage({
        type: "error",
        message: "Missing email. Please restart the flow.",
      });
      return;
    }

    setStatusMessage(null);
    setLoading(true);

    fetch(`${API_BASE_URL}/auth/verify-password-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: code }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(
            data?.message || "Invalid or expired code. Please try again."
          );
        }
        setStatusMessage({
          type: "success",
          message: data.message || "OTP verified successfully.",
        });
        router.push(
          `/reset-password?email=${encodeURIComponent(
            email
          )}&otp=${encodeURIComponent(code)}`
        );
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to verify right now. Please try again in a moment.";
        setStatusMessage({
          type: "error",
          message,
        });
      })
      .finally(() => setLoading(false));
  };

  const handleResend = () => {
    console.log("Resend OTP triggered");
    // resend logic here
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="w-full flex mb-5 justify-center">
        <Link href="/">
          <Image
            className="w-[120px] md:w-[150px] lg:w-[180px] h-auto"
            src="/Logo_1.svg"
            alt="Logo"
            width={180}
            height={150}
          />
        </Link>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-center text-text-primary mb-1">
        Verify Code
      </h2>
      <p className="text-center text-text-secondary mb-6 text-sm sm:text-base">
        We’ve sent a one-time verification code to your email: <br />
        <span className="text-blue-700 font-medium">
          {email || "your email"}
        </span>
        Please enter the code below to verify within 5 minute. If you don’t see
        the email, please check your junk or spam folder. If it’s there, mark it
        as <span className="font-semibold">“Not Junk”</span> so future emails
        are delivered correctly.
      </p>

      {/* OTP Input Fields */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex justify-center gap-3 sm:gap-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="
                w-12 sm:w-14 h-12 sm:h-14 text-center text-lg sm:text-xl font-semibold
                border border-border-secondary rounded-xl
                bg-surface-secondary focus:outline-none focus:border-blue-500
                text-gray-800
              "
            />
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full bg-action hover:bg-action-hover
            text-text-inverted font-semibold
            py-3 sm:py-3.5 rounded-lg transition
            disabled:opacity-60
          "
        >
          {loading ? "Verifying..." : "Next"}
        </button>

        {statusMessage && (
          <p
            className={`text-sm sm:text-base ${
              statusMessage.type === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {statusMessage.message}
          </p>
        )}

        {/* Resend and Back */}
        <div className="flex flex-col items-center gap-3 text-sm sm:text-base mt-1">
          <p className="text-text-tertiary">
            Don’t receive OTP?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="text-action hover:text-action-hover font-semibold"
            >
              Resend again
            </button>
          </p>

          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="flex items-center gap-2 text-text-tertiary hover:text-action transition"
          >
            <Image
              src="/icons/arrow-left-01.svg"
              alt="Back icon"
              width={20}
              height={20}
              className="w-4 h-4"
            />
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default function OtpVerifyPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <OtpVerifyPageInner />
    </Suspense>
  );
}
