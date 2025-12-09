"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { useLoginAgentMutation } from "@/store/api";
import { selectAuth } from "@/store/slices/authSlice";

export default function SigninPage() {
  const router = useRouter();
  const auth = useSelector(selectAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [login, { isLoading, error: mutationError }] = useLoginAgentMutation();

  useEffect(() => {
    if (auth.status === "authenticated") {
      const destination =
        auth.role === "Agent" ? "/agent/dashboard" : "/renter/matches";
      router.replace(destination);
    }
  }, [auth.role, auth.status, router]);

  const extractErrorMessage = (
    error: FetchBaseQueryError | SerializedError | undefined | null
  ) => {
    if (!error) return null;

    if ("data" in error && error.data) {
      const data = error.data as { message?: string; error?: string };
      return data.message || data.error || null;
    }

    if ("error" in error && error.error) {
      return typeof error.error === "string" ? error.error : null;
    }

    if ("message" in error && error.message) {
      return error.message;
    }

    return null;
  };

  const errorMessage = useMemo(() => {
    if (formError) return formError;
    const apiErrorMessage = extractErrorMessage(mutationError);
    if (!mutationError && !apiErrorMessage) return null;
    return apiErrorMessage || "Login failed. Please try again.";
  }, [formError, mutationError]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError("Email and password are required.");
      return;
    }

    try {
      await login({ email: email.trim(), password }).unwrap();
    } catch (err) {
      if (err && typeof err === "object" && "data" in err) {
        const data = (err as { data?: { message?: string; error?: string } })
          .data;
        setFormError(
          data?.message ?? data?.error ?? "Login failed. Please try again."
        );
        return;
      }

      if (err && typeof err === "object" && "message" in err) {
        const message = (err as { message?: string }).message;
        setFormError(message ?? "Login failed. Please try again.");
        return;
      }

      setFormError("Login failed. Please try again.");
    }
  };

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
        To login, enter your credentials
      </p>

      {/* Form */}
      <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none text-text-secondary text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-text-tertiary mb-2">
            Password
          </label>
          <div className="flex items-center bg-surface-secondary border border-border-secondary rounded-xl px-4 py-3 sm:py-3.5">
            <Image
              src="/icons/square-lock-01.svg"
              alt="Lock icon"
              width={20}
              height={20}
              className="w-5 h-5 text-action mr-2"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none text-text-secondary text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Image
                src="/icons/view.svg"
                alt="Toggle password visibility"
                width={20}
                height={20}
                className="w-5 h-5 text-action"
              />
            </button>
          </div>

          <div className="text-right mt-2">
            <a
              href="/forget-password"
              className="text-action hover:text-action-hover text-sm sm:text-base"
            >
              Forgot Password?
            </a>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <p className="text-red-600 text-sm sm:text-base">{errorMessage}</p>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="
            w-full bg-action hover:bg-action-hover text-text-inverted
            py-3 sm:py-3.5 rounded-xl
            transition disabled:opacity-70 disabled:cursor-not-allowed
          "
        >
          {isLoading ? "Logging in..." : "Login"}
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
