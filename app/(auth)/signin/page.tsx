"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  agentLoginSuccess,
  authFailure,
  authStart,
  renterLoginSuccess,
} from "@/store/slices/authSlice";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pos-exterior-researchers-vegetarian.trycloudflare.com/api/v1";

export default function SigninPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);

    if (!email.trim() || !password.trim()) {
      setStatusMessage({
        type: "error",
        message: "Email and password are required.",
      });
      return;
    }

    try {
      setIsLoading(true);
      dispatch(authStart());
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        const message =
          data?.message || "Login failed. Please check your credentials.";
        dispatch(authFailure(message));
        throw new Error(message);
      }

      const payload = data?.data;
      const role = payload?.user?.role;

      if (role === "Renter" && payload?.tokens?.accessToken) {
        dispatch(
          renterLoginSuccess({
            user: payload.user,
            renter: payload.renter,
            tokens: payload.tokens,
            registrationType: payload.registrationType ?? "normal",
          })
        );
      } else if (payload?.user && payload?.accessToken) {
        dispatch(
          agentLoginSuccess({
            user: payload.user,
            accessToken: payload.accessToken,
            expiresIn: payload.expiresIn ?? "",
            mustChangePassword: !!payload.mustChangePassword,
          })
        );
      }

      const destination =
        role === "Agent" ? "/agent/dashboard" : "/renter/saved-requests";
      setStatusMessage({
        type: "success",
        message: data.message || "Login successful.",
      });
      router.replace(destination);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials.";
      setStatusMessage({ type: "error", message });
      dispatch(authFailure(message));
    } finally {
      setIsLoading(false);
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
        {statusMessage && (
          <p
            className={`text-sm sm:text-base ${
              statusMessage.type === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {statusMessage.message}
          </p>
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
