"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RentersEdgeFormInner() {
  const [agree, setAgree] = useState(false);
  const [registerOption, setRegisterOption] = useState("");
  const [buyerOption, setBuyerOption] = useState("");
  const [purchaseTimeline, setPurchaseTimeline] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode =
    searchParams.get("referralCode") || searchParams.get("ref") || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerOption || !buyerOption) {
      return;
    }

    if (registerOption === "no" || buyerOption === "none") {
      router.push("/");
      return;
    }

    const questionnaire = {
      lookingToPurchase: registerOption === "yes",
      purchaseTimeline: purchaseTimeline.trim(),
      buyerSpecialistNeeded: buyerOption === "buyer",
      renterSpecialistNeeded: buyerOption === "renter",
    };

    const params = new URLSearchParams();
    if (referralCode) {
      params.set("referralCode", referralCode);
    }
    params.set("questionnaire", JSON.stringify(questionnaire));
    router.push(`/mor-signup?${params.toString()}`);
  };

  return (
    <section className="w-full min-h-screen bg-[#F8F9FB] px-4 md:px-12 py-10 flex justify-center">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-sm p-6 md:p-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mt-4">
            The Mor Team &quot;Renters Edge&quot; Specification Form
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto text-sm md:text-base">
            Providing you with options to view upcoming rentals that aren’t
            publicly marketed and a 15-second market report read.
          </p>
        </div>

        {/* Sub Logo + Info */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="text-black pr-3">
              <Image
                src="/Logo_1.svg"
                alt="Logo"
                width={200}
                height={150}
                className="w-[120px] md:w-[160px] lg:w-[200px] h-auto"
              />
            </Link>
          </div>
          <h4 className="text-base font-semibold text-gray-700">
            See it first, Rent it First
          </h4>
          <p className="text-gray-600 text-sm mt-1">
            The BeforeListed™ network of top agents gives you early access to
            rentals before they are listed by contacting trusted owners on your
            behalf for upcoming units that match your preferences. Discover
            below market rents and, in some cases, rent stabilized pre market
            apartments. Pay our broker fee only if you rent.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
          {/* Step 1 */}
          <Step
            icon="/icons/steps/submit.svg"
            title="Step 1"
            subtitle="Submit Preferences"
            description="Submit your pre-market request preferences to our agents to search on your behalf."
          />

          {/* Arrow */}
          <Arrow />

          {/* Step 2 */}
          <Step
            icon="/icons/steps/connect.svg"
            title="Step 2"
            subtitle="Get Matched"
            description="When a matching pre-market listing is found, your agent will contact you with details."
          />

          {/* Arrow */}
          <Arrow />

          {/* Step 3 */}
          <Step
            icon="/icons/steps/decide.svg"
            title="Step 3"
            subtitle="View & Decide"
            description="Register to view the apartment, apply if you choose, and only pay their broker fee at lease signing."
          />
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Register Option */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              Would you like to start a request at BeforeListed?
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="register"
                  value="yes"
                  checked={registerOption === "yes"}
                  onChange={(e) => setRegisterOption(e.target.value)}
                  className="accent-blue-600"
                />
                Yes, I would like to get access to apartments before they are
                listed.
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="register"
                  value="no"
                  checked={registerOption === "no"}
                  onChange={(e) => setRegisterOption(e.target.value)}
                  className="accent-blue-600"
                />
                No, thank you.
              </label>
            </div>
          </div>

          {/* Buying Question */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              Are you considering buying? If so, when are you looking to
              purchase?
            </p>
            <textarea
              value={purchaseTimeline}
              onChange={(e) => setPurchaseTimeline(e.target.value)}
              placeholder="Text here"
              className="w-full text-gray-700 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={2}
            />
          </div>

          {/* Specialist Option */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              We offer the option to connect you with one of our top buyer and
              renter specialists.
            </p>
            <p className="text-gray-600 text-sm mb-4">
              This expert has helped countless renters secure their ideal homes
              and can do the same for you.
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="buyer"
                  value="renter"
                  checked={buyerOption === "renter"}
                  onChange={(e) => setBuyerOption(e.target.value)}
                  className="accent-blue-600"
                />
                Yes, please have the renter specialist reach out to me.
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="buyer"
                  value="buyer"
                  checked={buyerOption === "buyer"}
                  onChange={(e) => setBuyerOption(e.target.value)}
                  className="accent-blue-600"
                />
                Yes, please have the buyer specialist reach out to me.
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="buyer"
                  value="none"
                  checked={buyerOption === "none"}
                  onChange={(e) => setBuyerOption(e.target.value)}
                  className="accent-blue-600"
                />
                No, thank you.
              </label>
            </div>
          </div>

          {/* Terms & Submit */}
          <div className="flex flex-col items-center text-center">
            <label className="flex text-gray-800 items-center gap-2 text-sm mb-2">
              <input
                type="checkbox"
                checked={agree}
                onChange={() => setAgree(!agree)}
                className="accent-blue-600"
              />
              I agree to the terms and conditions
            </label>
            <a href="#" className="text-blue-600 text-sm hover:underline mb-4">
              Terms & Conditions
            </a>
            <button
              type="submit"
              disabled={!agree}
              className={`px-6 py-2 rounded-lg text-white font-medium ${
                agree
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              Done
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default function RentersEdgeForm() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <RentersEdgeFormInner />
    </Suspense>
  );
}

/* --- Reusable Step Component --- */
function Step({
  icon,
  title,
  subtitle,
  description,
}: {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center max-w-[220px] mx-auto">
      <div className="w-16 h-16 mb-4 relative">
        <Image
          src={icon}
          alt={subtitle}
          width={64}
          height={64}
          className="object-contain mx-auto"
        />
      </div>
      <h3 className="font-semibold text-blue-700 text-sm mb-1">{title}</h3>
      <h4 className="font-semibold text-gray-900">{subtitle}</h4>
      <p className="text-gray-600 text-sm mt-2">{description}</p>
    </div>
  );
}

/* --- Reusable Arrow Component --- */
function Arrow() {
  return (
    <>
      <div className="hidden sm:block">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-300"
        >
          <path
            d="M5 12H19M19 12L12 5M19 12L12 19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="sm:hidden">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-400"
        >
          <path
            d="M12 5V19M12 19L5 12M12 19L19 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
}
