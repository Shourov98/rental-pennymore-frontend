"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pos-exterior-researchers-vegetarian.trycloudflare.com/api/v1";

type Questionnaire = {
  lookingToPurchase: boolean;
  purchaseTimeline: string;
  buyerSpecialistNeeded: boolean;
  renterSpecialistNeeded: boolean;
};

function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
  });
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    null
  );
  const referralCode = searchParams.get("referralCode") || "";

  useEffect(() => {
    const rawQuestionnaire = searchParams.get("questionnaire");
    if (!rawQuestionnaire) {
      setQuestionnaire(null);
      return;
    }

    try {
      const parsed = JSON.parse(rawQuestionnaire) as Questionnaire;
      setQuestionnaire(parsed);
    } catch {
      setQuestionnaire(null);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    if (!questionnaire) {
      setStatusMessage({
        type: "error",
        message: "Missing questionnaire data. Please restart the flow.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/renter/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          fullName: formData.fullName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          referralCode,
          questionnaire,
        }),
      });

      console.log(response);

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Unable to register right now. Please try again later."
        );
      }

      setStatusMessage({
        type: "success",
        message: data?.message || "Registration complete.",
      });
      router.push("/mor-confirmation");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to register right now. Please try again later.";
      setStatusMessage({ type: "error", message });
    } finally {
      setLoading(false);
    }
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
      <h2 className="text-xl sm:text-2xl font-semibold text-center text-text-primary mb-2">
        Mor Team “Renters Edge” Registration Form
      </h2>
      <p className="text-text-secondary text-center mb-6 text-sm sm:text-base leading-relaxed max-w-[400px] mx-auto">
        Providing you with options to view upcoming rentals that aren’t publicly
        marked and a 15 second market report read.
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 sm:space-y-6 text-left"
      >
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-text-tertiary mb-2">
            Full Name
          </label>
          <div className="flex items-center bg-surface-secondary border border-border-secondary rounded-xl px-4 py-3 sm:py-3.5">
            <Image
              src="/icons/user.svg"
              alt="User icon"
              width={20}
              height={20}
              className="w-5 h-5 text-action mr-2"
            />
            <input
              type="text"
              placeholder="Name"
              value={formData.fullName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fullName: e.target.value }))
              }
              className="flex-1 bg-transparent focus:outline-none text-text-secondary text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-semibold text-text-tertiary mb-2">
            Phone no.
          </label>
          <div className="flex items-center bg-surface-secondary border border-border-secondary rounded-xl px-4 py-3 sm:py-3.5">
            <Image
              src="/icons/lucide/phone.svg"
              alt="Phone icon"
              width={20}
              height={20}
              className="w-5 h-5 text-action mr-2"
            />
            <input
              type="tel"
              placeholder="Phone no"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phoneNumber: e.target.value,
                }))
              }
              className="flex-1 bg-transparent focus:outline-none text-text-secondary text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-text-tertiary mb-2">
            Email
          </label>
          <div className="flex items-center bg-surface-secondary border border-border-secondary rounded-xl px-4 py-3 sm:py-3.5">
            <Image
              src="/icons/mail-01.svg"
              alt="Mail icon"
              width={20}
              height={20}
              className="w-5 h-5 text-action mr-2"
            />
            <input
              type="email"
              placeholder="Enter email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="flex-1 bg-transparent focus:outline-none text-text-secondary text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-start gap-3 mt-2">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="w-5 h-5 accent-action cursor-pointer mt-[2px]"
          />
          <label className="text-sm sm:text-base text-text-secondary">
            I agree to the{" "}
            <a href="#" className="text-action hover:text-action-hover">
              terms and conditions
            </a>
          </label>
        </div>

        {/* Signup Button */}
        <button
          type="submit"
          disabled={!agree || loading}
          className="
            w-full bg-action hover:bg-action-hover text-text-inverted
            py-3 sm:py-3.5 rounded-lg transition
            disabled:opacity-70
          "
        >
          {loading ? "Signing up..." : "Signup"}
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

        {/* Footer */}
        <div className="text-center text-sm sm:text-base mt-2">
          <p className="text-text-tertiary">
            Already have an account?{" "}
            <a href="/signin" className="text-action hover:text-action-hover">
              Login
            </a>
          </p>
          <a
            href="/terms-conditions"
            className="text-action hover:text-action-hover text-sm mt-2 inline-block"
          >
            Terms & Conditions
          </a>
        </div>
      </form>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <SignupPageInner />
    </Suspense>
  );
}
