"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // send reset request logic here
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
              className="flex-1 bg-transparent focus:outline-none text-text-secondary text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="
            w-full bg-action hover:bg-action-hover
            text-text-inverted font-semibold
            py-3 sm:py-3.5 rounded-lg transition
          "
        >
          Next
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
