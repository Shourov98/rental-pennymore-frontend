"use client";

import { useState } from "react";
import Image from "next/image";

export default function ReferFormPage() {
  const [agree, setAgree] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState("");
  const [selectedSpecialist, setSelectedSpecialist] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // submit logic here
    console.log("Form submitted");
  };

  return (
    <main className="flex flex-col items-center justify-center w-full min-h-screen bg-white px-4 py-10 sm:py-16">
      <div
        className="
          w-full max-w-[1100px] bg-white rounded-2xl shadow-md
          px-6 sm:px-10 py-10 sm:py-14 text-center
        "
      >
        {/* Header */}
        <h1 className="text-2xl text-black sm:text-3xl font-semibold mb-2">
          LOGO
        </h1>
        <h2 className="text-xl text-black sm:text-2xl font-semibold mb-2">
          The Mor Team “Renters Edge” Specification Form
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-8 max-w-[700px] mx-auto">
          Providing you with options to view upcoming rentals that aren’t
          publicly marketed and a 15 second market report read.
        </p>

        {/* Sub Heading */}
        <h3 className="text-lg text-black sm:text-xl font-semibold mb-1">
          LOGO
        </h3>
        <h4 className="text-base text-black sm:text-lg font-semibold mb-6">
          See it first, Rent it First
        </h4>
        <p className="text-gray-600 text-sm sm:text-base mb-10">
          Get Access to NYC pre-market apartments before they are listed
        </p>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 mb-12">
          <Step
            icon="/icons/steps/submit.svg"
            title="Step 1"
            subtitle="Submit Preferences"
            description="Submit your pre-market search preferences to start seeing apartments before they’re listed."
          />
          <Step
            icon="/icons/steps/connect.svg"
            title="Step 2"
            subtitle="Get Matched"
            description="Your request will be sent to our agents, who will reach out once a pre-market match is found."
          />
          <Step
            icon="/icons/steps/decide.svg"
            title="Step 3"
            subtitle="View & Decide"
            description="Register with the agent, view the apartment, apply if you choose, and only pay at lease signing."
          />
        </div>

        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className="text-left space-y-6 sm:space-y-8"
        >
          {/* Question 1 */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              Would you like to register to BeforeListed?
            </p>
            <div className="space-y-2">
              <label className="flex items-start gap-2">
                <input
                  type="radio"
                  name="register"
                  value="yes"
                  checked={selectedRegister === "yes"}
                  onChange={(e) => setSelectedRegister(e.target.value)}
                  className="mt-[3px]"
                />
                <span className="text-gray-600 text-sm sm:text-base">
                  Yes, I would like to get access to apartments before they are
                  listed (Input your rent preferences on the next page).
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="radio"
                  name="register"
                  value="no"
                  checked={selectedRegister === "no"}
                  onChange={(e) => setSelectedRegister(e.target.value)}
                  className="mt-[3px]"
                />
                <span className="text-gray-600 text-sm sm:text-base">
                  No, thank you.
                </span>
              </label>
            </div>
          </div>

          {/* Question 2 */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              Are you considering buying? If so, when are you looking to
              purchase?
            </p>
            <textarea
              placeholder="Text here"
              rows={3}
              className="w-full text-gray-800 rounded-xl border border-gray-300 px-4 py-3 bg-gray-50 focus:outline-none focus:border-blue-500 resize-none text-sm sm:text-base"
            ></textarea>
          </div>

          {/* Question 3 */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              We offer the option to connect you with one of our top buyer and
              renter specialists...
            </p>
            <div className="space-y-2">
              <label className="flex items-start gap-2">
                <input
                  type="radio"
                  name="specialist"
                  value="renter"
                  checked={selectedSpecialist === "renter"}
                  onChange={(e) => setSelectedSpecialist(e.target.value)}
                  className="mt-[3px]"
                />
                <span className="text-gray-600 text-sm sm:text-base">
                  Yes, please have the renter specialist reach out to me.
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="radio"
                  name="specialist"
                  value="buyer"
                  checked={selectedSpecialist === "buyer"}
                  onChange={(e) => setSelectedSpecialist(e.target.value)}
                  className="mt-[3px]"
                />
                <span className="text-gray-600 text-sm sm:text-base">
                  Yes, please have the buyer specialist reach out to me.
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="radio"
                  name="specialist"
                  value="none"
                  checked={selectedSpecialist === "none"}
                  onChange={(e) => setSelectedSpecialist(e.target.value)}
                  className="mt-[3px]"
                />
                <span className="text-gray-600 text-sm sm:text-base">
                  No thank you.
                </span>
              </label>
            </div>
          </div>

          {/* Agreement */}
          <div className="flex flex-col items-center justify-between gap-3">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-[2px] accent-action cursor-pointer"
              />
              <span className="text-sm sm:text-base text-gray-600">
                I agree to the terms and conditions
              </span>
            </label>

            <a
              href="#"
              className="text-action hover:text-action-hover text-sm sm:text-base"
            >
              Terms & Conditions
            </a>
          </div>

          {/* Submit */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={!agree}
              className="
                bg-action hover:bg-action-hover text-text-inverted
                font-semibold rounded-lg px-10 py-2.5 sm:py-3
                transition disabled:opacity-60
              "
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

/* ───────────── Step component ───────────── */
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
    <div className="flex flex-col items-center text-center px-2 sm:px-4">
      <Image
        src={icon}
        alt={title}
        width={80}
        height={80}
        className="mb-4 w-14 sm:w-16 h-auto"
      />
      <h3 className="font-semibold text-lg text-text-primary mb-1">{title}</h3>
      <p className="font-medium text-base text-text-primary mb-2">{subtitle}</p>
      <p className="text-gray-600 text-sm sm:text-base">{description}</p>
    </div>
  );
}
