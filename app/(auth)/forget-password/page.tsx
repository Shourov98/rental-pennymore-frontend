"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pos-exterior-researchers-vegetarian.trycloudflare.com/api/v1";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatusMessage({ type: "error", message: "Email is required." });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Unable to process request right now. Please try again."
        );
      }

      setStatusMessage({
        type: "success",
        message: data?.message || "Password reset OTP sent to your email.",
      });
      router.push(`/forgot-otp?email=${encodeURIComponent(trimmedEmail)}`);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to process request right now. Please try again.";
      setStatusMessage({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <h1 className="text-3xl font-semibold text-center text-black mb-4">
        Logo
      </h1>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-center text-text-primary mb-1">
        Forgot Password
      </h2>
      <p className="text-center text-text-secondary mb-6 text-sm sm:text-base">
        Enter your email to reset password
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-text-tertiary mb-2">
            Email
          </label>
          <div className="flex items-center bg-surface-secondary border border-border-secondary rounded-xl px-4 py-3 sm:py-3.5">
            <Image
              src="/icons/mail-01.svg"
              alt="Email icon"
              width={20}
              height={20}
              className="w-5 h-5 text-action mr-2"
            />
            <input
              type="email"
              placeholder="Enter email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none text-text-secondary text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Status */}
        {statusMessage && (
          <p
            className={`text-sm sm:text-base ${
              statusMessage.type === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {statusMessage.message}
          </p>
        )}

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
          {loading ? "Sending..." : "Next"}
        </button>

        {/* Back to Login */}
        <div className="flex items-center justify-center gap-2 text-sm sm:text-base mt-2">
          <Image
            src="/icons/arrow-left-01.svg"
            alt="Back icon"
            width={16}
            height={16}
            className="w-4 h-4"
          />
          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="text-text-tertiary hover:text-action font-medium transition"
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}
