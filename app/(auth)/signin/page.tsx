"use client";

import { useRouter } from "next/navigation";

export default function SigninPage() {
  const router = useRouter();

  return (
    <div className="w-full">
      {/* Logo */}
      <h1 className="text-3xl sm:text-4xl font-semibold text-center text-black mb-2">
        LOGO
      </h1>

      {/* Headings */}
      <h2 className="text-2xl sm:text-3xl font-semibold text-center text-black mb-2">
        Welcome Back!
      </h2>
      <p className="text-text-tertiary text-center mb-6 text-sm sm:text-base">
        To login, enter your email address
      </p>

      {/* Form */}
      <form className="space-y-5 sm:space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-text-tertiary mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter email"
            className="
              w-full px-4 py-3 sm:py-3.5
              rounded-xl bg-surface-secondary
              border border-border-secondary
              text-text-secondary text-sm sm:text-base
              focus:outline-none focus:border-action
              transition
            "
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-text-tertiary mb-2">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter password"
            className="
              w-full px-4 py-3 sm:py-3.5
              rounded-xl bg-surface-secondary
              border border-border-secondary
              text-text-secondary text-sm sm:text-base
              focus:outline-none focus:border-action
              transition
            "
          />
          <div className="text-right mt-2">
            <a
              href="/forgot-password"
              className="text-action hover:text-action-hover text-sm sm:text-base"
            >
              Forgot Password?
            </a>
          </div>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="
            w-full bg-action hover:bg-action-hover text-text-inverted
            py-3 sm:py-3.5 rounded-xl
            transition
          "
        >
          Login
        </button>

        {/* Footer */}
        <p className="text-text-tertiary text-center text-sm sm:text-base">
          Don’t have an account?{" "}
          <a href="/signup" className="text-action hover:text-action-hover">
            Create an account
          </a>
        </p>
      </form>
    </div>
  );
}
