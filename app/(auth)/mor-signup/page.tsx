"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [agree, setAgree] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // handle signup logic here
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <h1 className="text-3xl sm:text-4xl font-semibold text-center text-black mb-4">
        LOGO
      </h1>

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
          disabled={!agree}
          onClick={() => router.push("/mor-confirmation")}
          className="
            w-full bg-action hover:bg-action-hover text-text-inverted
            py-3 sm:py-3.5 rounded-lg transition
            disabled:opacity-70
          "
        >
          Signup
        </button>

        {/* Footer */}
        <div className="text-center text-sm sm:text-base mt-2">
          <p className="text-text-tertiary">
            Already have an account?{" "}
            <a href="/signin" className="text-action hover:text-action-hover">
              Login
            </a>
          </p>
          <a
            href="#"
            className="text-action hover:text-action-hover text-sm mt-2 inline-block"
          >
            Terms & Conditions
          </a>
        </div>
      </form>
    </div>
  );
}
