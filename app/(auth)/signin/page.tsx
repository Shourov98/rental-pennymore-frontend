"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  agentLoginSuccess,
  authFailure,
  authStart,
  adminSessionDetected,
  selectAuth,
  selectIsAuthed,
  selectSessionReady,
  renterLoginSuccess,
} from "@/store/slices/authSlice";
import { fetchAgentProfile } from "@/store/slices/agentProfileSlice";
import type { AppDispatch } from "@/store/store";
import Link from "next/link";
import { getSavedReferralCode, saveReferralCode } from "@/lib/referralCode";
import {
  RENTER_DASHBOARD_PATH,
  renterHasActiveRequest,
} from "@/lib/renterRedirect";
import { Spinner } from "@/components/ui/spinner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const EMAIL_NOT_VERIFIED_MESSAGE = "please verify your email";

type DefaultReferralAgent = {
  id: string;
  role: string;
  fullName: string;
  title?: string | null;
  brokerageName?: string | null;
  email?: string;
  phoneNumber?: string;
  referralCode: string;
  referralLink?: string;
  loginLink?: string;
};

type LoginErrorResponse = {
  success?: boolean;
  message?: string;
  errorCode?: string;
  details?: {
    defaultReferralAgent?: DefaultReferralAgent;
  };
};

function SigninPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralFromUrl = searchParams.get("ref");
  const dispatch = useDispatch<AppDispatch>();
  const isAuthed = useSelector(selectIsAuthed);
  const sessionReady = useSelector(selectSessionReady);
  const auth = useSelector(selectAuth);
  const [hasMounted, setHasMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savedReferralCode, setSavedReferralCode] = useState<string | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isContinueLoading, setIsContinueLoading] = useState(false);
  const [defaultReferralAgent, setDefaultReferralAgent] =
    useState<DefaultReferralAgent | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const getRedirectDestination = useCallback(
    (forcedDestination?: string) => {
      if (forcedDestination) return forcedDestination;

      const redirectTarget = searchParams.get("redirect");
      if (
        redirectTarget === "Request-Submlsslon-Page" ||
        redirectTarget === "pre-market-listing"
      ) {
        return "/Request-Submlsslon-Page";
      }

      if (
        redirectTarget &&
        redirectTarget.startsWith("/") &&
        !redirectTarget.startsWith("//") &&
        !redirectTarget.startsWith("/signin")
      ) {
        return redirectTarget;
      }

      return "/";
    },
    [searchParams],
  );

  const resolveRoleBasedDestination = useCallback(
    async (role: string | undefined): Promise<string> => {
      if (role === "Agent") return "/agent/dashboard";

      if (role !== "Renter") return "/";

      // Renters land on /renter/saved-requests when they have at least one
      // currently-active pre-market request; otherwise on the marketing
      // homepage so they can learn about the product and submit their first
      // request.
      const hasActiveRequest = await renterHasActiveRequest();
      return hasActiveRequest ? RENTER_DASHBOARD_PATH : "/";
    },
    [],
  );

  useEffect(() => {
    if (!sessionReady || !isAuthed) return;
    let cancelled = false;
    void (async () => {
      const explicit = getRedirectDestination();
      // getRedirectDestination returns "/" when no ?redirect= is set;
      // anything other than "/" means the caller asked for a specific
      // destination and we honor it as-is.
      if (explicit !== "/") {
        router.replace(explicit);
        return;
      }
      const authRole = auth?.role ?? auth?.user?.role ?? null;
      const destination = await resolveRoleBasedDestination(authRole ?? undefined);
      if (!cancelled) router.replace(destination);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    auth?.role,
    auth?.user?.role,
    getRedirectDestination,
    isAuthed,
    resolveRoleBasedDestination,
    router,
    sessionReady,
  ]);

  useEffect(() => {
    const nextSaved = referralFromUrl
      ? saveReferralCode(referralFromUrl)
      : getSavedReferralCode();
    setSavedReferralCode(nextSaved);
  }, [referralFromUrl]);

  if (!hasMounted || !sessionReady || isAuthed) {
    return (
      <div className="flex min-h-48 w-full items-center justify-center">
        <Spinner className="size-6 text-action" />
      </div>
    );
  }

  const signupHref = (() => {
    const referralCode = referralFromUrl || savedReferralCode;
    if (!referralCode) return "/signup/agent";
    return `/signup/agent?ref=${encodeURIComponent(referralCode)}`;
  })();

  const completeLogin = async (
    data: {
      message?: string;
      data?: {
        user?: { role?: string };
        renter?: unknown;
        tokens?: {
          accessToken?: string;
          refreshToken?: string;
          expiresIn?: string;
        };
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: string;
        registrationType?: string;
        referralInfo?: unknown;
        mustChangePassword?: boolean;
        title?: string | null;
        agentProfile?: unknown;
      };
    },
    forcedDestination?: string,
  ) => {
    const payload = data?.data;
    const role = payload?.user?.role;

    if (role === "Admin") {
      // Admins should sign in via the dedicated dashboard, not here. Treat
      // this as an unauthorized login — same path as any other bad credentials.
      dispatch(adminSessionDetected());
      setStatusMessage({
        type: "error",
        message: "Invalid email or password.",
      });
      return;
    }

    if (role === "Renter" && payload?.user) {
      const tokens = (
        payload?.tokens?.accessToken
          ? payload.tokens
          : payload?.accessToken
            ? {
                accessToken: payload.accessToken,
                refreshToken: payload.refreshToken,
                expiresIn: payload.expiresIn,
              }
            : undefined
      ) as Parameters<typeof renterLoginSuccess>[0]["tokens"];
      dispatch(
        renterLoginSuccess({
          user: payload.user as Parameters<
            typeof renterLoginSuccess
          >[0]["user"],
          renter:
            (payload.renter as Parameters<
              typeof renterLoginSuccess
            >[0]["renter"]) ?? null,
          tokens,
          registrationType:
            payload.registrationType === "social" ? "social" : "normal",
          referralInfo:
            (payload.referralInfo as Parameters<
              typeof renterLoginSuccess
            >[0]["referralInfo"]) ?? null,
        }),
      );
    } else if (payload?.user && payload?.accessToken) {
      dispatch(
        agentLoginSuccess({
          user: payload.user as Parameters<typeof agentLoginSuccess>[0]["user"],
          accessToken: payload.accessToken,
          expiresIn: payload.expiresIn ?? "",
          mustChangePassword: !!payload.mustChangePassword,
          title: payload.title ?? null,
          agentProfile:
            (payload.agentProfile as Parameters<
              typeof agentLoginSuccess
            >[0]["agentProfile"]) ?? null,
        }),
      );
      dispatch(fetchAgentProfile());
    }

    const explicitDestination = getRedirectDestination(forcedDestination);
    const destination = explicitDestination === "/"
      ? await resolveRoleBasedDestination(role)
      : explicitDestination;
    setStatusMessage({
      type: "success",
      message: data.message || "Login successful.",
    });
    router.replace(destination);
  };

  const login = async (
    referralCodeOverride?: string,
    forcedDestination?: string,
  ): Promise<boolean> => {
    const referralCode = (
      referralCodeOverride ||
      referralFromUrl ||
      savedReferralCode ||
      getSavedReferralCode()
    )?.trim();

    const loginPayload: {
      email: string;
      password: string;
      referralCode?: string;
    } = {
      email: email.trim(),
      password,
    };

    if (referralCode) {
      loginPayload.referralCode = referralCode;
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(loginPayload),
    });

    const data = (await response
      .json()
      .catch(() => ({}))) as LoginErrorResponse & {
      data?: Parameters<typeof agentLoginSuccess>[0] & {
        registrationType?: string;
        renter?: unknown;
        tokens?: {
          accessToken?: string;
          refreshToken?: string;
          expiresIn?: string;
        };
        referralInfo?: unknown;
      };
    };

    if (!response.ok || !data?.success) {
      const message =
        data?.message || "Login failed. Please check your credentials.";
      dispatch(authFailure(message));

      if (
        data?.errorCode === "ACCESS_UNAUTHORIZED" &&
        data?.details?.defaultReferralAgent
      ) {
        setDefaultReferralAgent(data.details.defaultReferralAgent);
        setStatusMessage(null);
        return false;
      }

      const isEmailNotVerified
        = typeof message === "string"
          && message.trim().toLowerCase().includes(EMAIL_NOT_VERIFIED_MESSAGE);

      if (isEmailNotVerified) {
        const userEmail = email.trim();
        if (userEmail) {
          // Fire-and-forget the resend — don't block the redirect on it.
          // If resend hits the 60s cooldown, the user still has the OTP page
          // and can use the existing "Resend code" button there.
          fetch(`${API_BASE_URL}/auth/resend-verification`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail }),
          }).catch(() => {
            // Swallow network errors; the OTP page has its own resend button.
          });
          setStatusMessage({
            type: "success",
            message: "Sending a verification code to your email...",
          });
          router.push(`/otp-verify?email=${encodeURIComponent(userEmail)}`);
          return false;
        }
      }

      throw new Error(message);
    }

    setDefaultReferralAgent(null);
    await completeLogin(data, forcedDestination);
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setDefaultReferralAgent(null);

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
      await login();
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

  const handleContinueWithDefaultAgent = async () => {
    if (!defaultReferralAgent?.referralCode) return;

    try {
      setStatusMessage(null);
      setIsContinueLoading(true);
      dispatch(authStart());
      saveReferralCode(defaultReferralAgent.referralCode);
      await login(defaultReferralAgent.referralCode, "/");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't continue right now. Please try again.";
      setStatusMessage({ type: "error", message });
      dispatch(authFailure(message));
    } finally {
      setIsContinueLoading(false);
    }
  };

  return (
    <div className="w-full relative">
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

      {/* Headings */}
      <h2 className="text-2xl sm:text-3xl font-semibold text-center text-black mb-2">
        Welcome!
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
          <div className="flex items-center bg-surface-secondary border border-border-secondary rounded-xl px-4 py-3 sm:py-3.5 transition focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400">
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
              className="flex-1 bg-transparent focus:outline-none text-text-secondary text-base"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-text-tertiary mb-2">
            Password
          </label>
          <div className="flex items-center bg-surface-secondary border border-border-secondary rounded-xl px-4 py-3 sm:py-3.5 transition focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400">
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
              className="flex-1 bg-transparent focus:outline-none text-text-secondary text-base"
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
            } whitespace-pre-line`}
          >
            {statusMessage.message}
          </p>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="
            flex w-full items-center justify-center gap-2 bg-action hover:bg-action-hover text-text-inverted
            py-3 sm:py-3.5 rounded-xl
            transition disabled:opacity-70 disabled:cursor-not-allowed
          "
        >
          {isLoading ? (
            <>
              <span>Logging in</span>
              <Spinner className="size-4 text-white" />
            </>
          ) : (
            "Login"
          )}
        </button>

        {/* Footer */}
        <p className="text-text-tertiary text-center text-sm sm:text-base">
          Don’t have an account?{" "}
          <a href={signupHref} className="text-action hover:text-action-hover">
            Create an account
          </a>
        </p>
      </form>

      {defaultReferralAgent && (
        <div className="fixed inset-0 z-50 bg-black/60 px-4 py-6 sm:py-10">
          <div className="mx-auto flex h-full w-full max-w-4xl items-center justify-center">
            <div className="w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 lg:p-10 shadow-2xl">
              <div className="mb-5">
                <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700">
                  Account Notice
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-5">
                Agent no longer participating
              </h3>
              <div className="space-y-4 text-[15px] leading-7 sm:text-base text-gray-700">
                <p>
                  Your originally registered agent is no longer participating in
                  the BeforeListed intake service. You may contact that agent
                  directly if you wish.
                </p>
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
                  Your request will remain private on BeforeListed and will not
                  be shared with any other agents unless you choose to continue.
                </p>
                <p>
                  If you would like to continue using the service, you may
                  request representation by{" "}
                  <span className="font-semibold text-gray-900">
                    {defaultReferralAgent.fullName}
                  </span>
                  , a licensed New York real estate agent. If you proceed, you
                  will be asked to review and sign the required Corcoran agency
                  disclosures before any assistance begins.
                </p>
                <p className="rounded-xl border border-blue-200 bg-blue-100 px-4 py-3 text-blue-900">
                  If you are currently working with a different agent who uses
                  the BeforeListed service, please log in using that agent’s
                  unique registration link.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleContinueWithDefaultAgent}
                  disabled={isContinueLoading}
                  className="w-full rounded-xl bg-action px-5 py-3.5 text-sm sm:text-base font-semibold text-text-inverted transition hover:bg-action-hover disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isContinueLoading
                    ? "Continuing..."
                    : `Continue with ${defaultReferralAgent.fullName}`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDefaultReferralAgent(null);
                    router.replace("/");
                  }}
                  disabled={isContinueLoading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3.5 text-sm sm:text-base font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  No, thank you
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense fallback={null}>
      <SigninPageContent />
    </Suspense>
  );
}
