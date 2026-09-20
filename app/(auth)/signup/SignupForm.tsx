"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Eye, EyeOff, UsersRound } from "lucide-react";
import { getSavedReferralCode, saveReferralCode } from "@/lib/referralCode";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const INACTIVE_REGISTRATION_LINK_CODE = "REGISTRATION_LINK_INACTIVE";
const RENTER_PASSWORD_MIN_LENGTH = 8;
const RENTER_PASSWORD_TOO_SHORT_MESSAGE =
  "Password must be at least 8 characters.";
const PURCHASE_TIMELINE_OPTIONS = [
  "0–3 months",
  "3–6 months",
  "6–12 months",
  "12+ months",
  "Not sure",
] as const;

type SignupRole = "renter" | "agent";
type ReferralDisplay = {
  referrerName?: string | null;
  brokerageName?: string | null;
};
type ApiErrorDetail = {
  field?: string;
  message?: string;
};
type ApiResponsePayload = {
  success?: boolean;
  message?: string;
  errorCode?: string;
  errors?: ApiErrorDetail[];
  data?: ReferralDisplay;
};

const isApiResponsePayload = (value: unknown): value is ApiResponsePayload =>
  typeof value === "object" && value !== null;

const getApiFieldError = (data: unknown, fieldName: string): string | null => {
  if (!isApiResponsePayload(data) || !Array.isArray(data.errors)) {
    return null;
  }

  const error = data.errors.find((item) => {
    const field = item.field?.split(".").filter(Boolean).pop();
    return field === fieldName;
  });

  return error?.message?.trim() || null;
};

const getApiErrorMessage = (data: unknown, fallback: string): string => {
  if (!isApiResponsePayload(data)) return fallback;

  const validationMessages = data.errors
    ?.map((error) => error.message?.trim())
    .filter((message): message is string => Boolean(message));

  if (validationMessages?.length) {
    return validationMessages.join(" ");
  }

  return data.message?.trim() || fallback;
};

export default function SignupForm({ role }: { role: SignupRole }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralFromUrl = searchParams.get("ref");
  const [savedReferralCode, setSavedReferralCode] = useState<string | null>(
    null,
  );
  const [agree, setAgree] = useState(false);
  const [buyerSpecialistNeeded, setBuyerSpecialistNeeded] = useState(false);
  const [purchaseTimeline, setPurchaseTimeline] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [referralDisplay, setReferralDisplay] =
    useState<ReferralDisplay | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    licenseNumber: "",
    title: "",
    brokerageName: "",
    email: "",
    password: "",
    referralCode: "",
  });

  const isAgent = role === "agent";
  const isRenter = role === "renter";
  const isAgentFormIncomplete =
    isAgent &&
    (!formData.fullName ||
      !formData.phoneNumber ||
      !formData.licenseNumber ||
      !formData.title ||
      !formData.brokerageName ||
      !formData.email ||
      !formData.password);
  const isRenterFormIncomplete =
    isRenter &&
    (!formData.fullName ||
      !formData.phoneNumber ||
      !formData.email ||
      !formData.password);
  const isFormIncomplete = isAgent
    ? isAgentFormIncomplete
    : isRenterFormIncomplete;

  useEffect(() => {
    const nextSaved = referralFromUrl
      ? saveReferralCode(referralFromUrl)
      : getSavedReferralCode();
    setSavedReferralCode(nextSaved);
  }, [referralFromUrl]);

  useEffect(() => {
    if (!isRenter) return;
    const referralCode = referralFromUrl || savedReferralCode;
    setReferralDisplay(null);
    if (!referralCode) return;

    setFormData((prev) => ({
      ...prev,
      referralCode: prev.referralCode || referralCode,
    }));
  }, [isRenter, referralFromUrl, savedReferralCode]);

  useEffect(() => {
    if (!isRenter) return;
    const referralCode = referralFromUrl || savedReferralCode;
    if (!referralCode) return;

    const controller = new AbortController();

    const verifyRegistrationLink = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/renter/registration-link/status?referralCode=${encodeURIComponent(
            referralCode,
          )}`,
          { signal: controller.signal },
        );
        const data = (await response.json().catch(() => ({}))) as {
          success?: boolean;
          errorCode?: string;
          data?: ReferralDisplay;
        };

        if (
          !response.ok &&
          data?.errorCode === INACTIVE_REGISTRATION_LINK_CODE
        ) {
          router.replace("/registration-link-not-active");
        }

        if (response.ok && data?.data) {
          setReferralDisplay(data.data);
        }
      } catch {
        if (controller.signal.aborted) return;
      }
    };

    void verifyRegistrationLink();

    return () => controller.abort();
  }, [isRenter, referralFromUrl, router, savedReferralCode]);

  const signinHref = (() => {
    const referralCode = referralFromUrl || savedReferralCode;
    if (!referralCode) return "/signin";
    return `/signin?ref=${encodeURIComponent(referralCode)}`;
  })();

  const resendVerification = async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok || !data?.success) {
      throw new Error(
        data?.message ||
          "Unable to resend verification. Please try again shortly.",
      );
    }
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const trimmedFullName = formData.fullName.trim();
    const hasFullNameSpace = /\s+/.test(trimmedFullName);

    if (!trimmedFullName || !hasFullNameSpace) {
      setStatusMessage({
        type: "error",
        message: "Please enter your full name.",
      });
      return;
    }

    if (!agree) {
      setStatusMessage({
        type: "error",
        message: "Please agree to the terms to continue.",
      });
      return;
    }

    if (
      isRenter &&
      formData.password.length > 0 &&
      formData.password.length < RENTER_PASSWORD_MIN_LENGTH
    ) {
      setStatusMessage(null);
      setFieldErrors({ password: RENTER_PASSWORD_TOO_SHORT_MESSAGE });
      return;
    }

    const email = formData.email.trim();

    setLoading(true);
    setStatusMessage(null);

    try {
      if (isAgent) {
        const response = await fetch(`${API_BASE_URL}/agent/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            phoneNumber: formData.phoneNumber.trim(),
            licenseNumber: formData.licenseNumber.trim(),
            title: formData.title,
            brokerageName: formData.brokerageName.trim(),
            email,
            password: formData.password,
          }),
        });

        const data = (await response.json().catch(() => ({}))) as unknown;

        if (!response.ok || !isApiResponsePayload(data) || !data?.success) {
          throw new Error(
            getApiErrorMessage(
              data,
              "Unable to sign up at the moment. Please try again.",
            ),
          );
        }

        setStatusMessage({
          type: "success",
          message: data.message || "Agent registered successfully.",
        });
        router.push(`/otp-verify?email=${encodeURIComponent(email)}`);
        return;
      }

      const renterPayload: {
        email: string;
        password: string;
        fullName: string;
        phoneNumber: string;
        referralCode?: string;
        questionnaire: { buyerSpecialistNeeded: boolean; purchaseTimeline?: string };
      } = {
        email,
        password: formData.password,
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        questionnaire: {
          buyerSpecialistNeeded,
          ...(buyerSpecialistNeeded && purchaseTimeline
            ? { purchaseTimeline }
            : {}),
        },
      };

      const referralCode = formData.referralCode.trim();
      if (referralCode) {
        renterPayload.referralCode = referralCode;
      }

      const response = await fetch(`${API_BASE_URL}/renter/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(renterPayload),
      });

      const data = (await response.json().catch(() => ({}))) as unknown;

      if (!response.ok || !isApiResponsePayload(data) || !data?.success) {
        if (
          isApiResponsePayload(data) &&
          data?.errorCode === INACTIVE_REGISTRATION_LINK_CODE
        ) {
          router.replace("/registration-link-not-active");
          return;
        }

        const passwordError = getApiFieldError(data, "password");
        if (passwordError) {
          setFieldErrors({ password: passwordError });
          setStatusMessage(null);
          return;
        }

        throw new Error(
          getApiErrorMessage(
            data,
            "Unable to sign up at the moment. Please try again.",
          ),
        );
      }

      setStatusMessage({
        type: "success",
        message: data.message || "Renter registered successfully.",
      });
      router.push(`/otp-verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to sign up at the moment. Please try again.";

      const normalized = message.toLowerCase();
      const looksLikeExistingEmail =
        isAgent &&
        email &&
        (normalized.includes("already") ||
          normalized.includes("exist") ||
          normalized.includes("registered") ||
          normalized.includes("used") ||
          normalized.includes("taken"));
      const renterAlreadyRegistered =
        isRenter && email && normalized.trim() === "email already registered";
      const shouldAttemptResend =
        looksLikeExistingEmail || renterAlreadyRegistered;

      if (shouldAttemptResend) {
        try {
          const data = await resendVerification(email);
          setStatusMessage({
            type: "success",
            message:
              data?.message ||
              "Verification code has been resent to your email.",
          });
          router.push(`/otp-verify?email=${encodeURIComponent(email)}`);
          return;
        } catch (resendError) {
          const resendMessage =
            resendError instanceof Error
              ? resendError.message
              : "Unable to resend verification. Please try again.";
          if (resendMessage.toLowerCase().includes("email already verified")) {
            setStatusMessage({ type: "error", message: resendMessage });
            setTimeout(() => {
              router.push("/signin");
            }, 1500);
            return;
          }
          setStatusMessage({ type: "error", message: resendMessage });
          return;
        }
      }

      setStatusMessage({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
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
      <h2 className="text-2xl font-semibold text-center text-text-primary mb-1">
        {isRenter ? "Start Your Rental Request" : "Create an Account"}
      </h2>
      {isRenter ? (
        <div className="mb-4 text-center">
          {referralDisplay?.referrerName && referralDisplay?.brokerageName && (
            <p className="text-lg font-bold text-text-primary">
              {referralDisplay.referrerName} &bull;{" "}
              {referralDisplay.brokerageName}
            </p>
          )}
          <p className="mt-2 text-base font-semibold text-action">
            Take Less Than 2 Minutes To Complete
          </p>
          <div className="mt-3 flex justify-center">
            <span className="inline-flex items-center rounded-full border border-[#CFE1FF] bg-blue-400 px-4 py-1 text-xs font-semibold text-white sm:text-sm">
              Renter
            </span>
          </div>
        </div>
      ) : (
        <div className="flex justify-center mb-2">
          <span
            className={`inline-flex items-center rounded-full px-4 py-1 text-xs sm:text-sm font-semibold border ${
              isAgent
                ? "bg-blue-400 text-white border-[#CFE1FF]"
                : "bg-blue-400 text-white border-[#ABEFC6]"
            }`}
          >
            Agent
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <InputField
          icon="/icons/user.svg"
          label="Full Name"
          placeholder="Name"
          value={formData.fullName}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, fullName: value }))
          }
        />

        {isRenter ? (
          <div className="space-y-3 rounded-xl border border-border-secondary bg-surface-secondary p-4">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={buyerSpecialistNeeded}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setBuyerSpecialistNeeded(checked);
                  if (!checked) setPurchaseTimeline("");
                }}
                className="mt-0.5 h-4 w-4 accent-action"
              />
              <span>I would like to know more about upcoming sales service.</span>
            </label>
            {buyerSpecialistNeeded ? (
              <div>
                <label className="mb-2 block text-sm font-semibold text-text-tertiary">Purchase Timeline</label>
                <select value={purchaseTimeline} onChange={(event) => setPurchaseTimeline(event.target.value)} className="w-full rounded-lg border border-border-secondary bg-white px-3 py-2 text-sm text-text-secondary">
                  <option value="">Select a timeline</option>
                  {PURCHASE_TIMELINE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            ) : null}
          </div>
        ) : null}

        <InputField
          icon="/icons/lucide/phone.svg"
          label="Phone no."
          placeholder="Phone no"
          value={formData.phoneNumber}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, phoneNumber: value }))
          }
        />

        {isAgent && (
          <>
            <InputField
              icon="/icons/text-number-sign.svg"
              label="License No."
              placeholder="Enter number"
              value={formData.licenseNumber}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, licenseNumber: value }))
              }
            />
            <SelectField
              label="Title"
              value={formData.title}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, title: value }))
              }
              icon={<UsersRound className="w-5 h-5 text-black mr-2" />}
              options={[
                "Licensed Real Estate Salesperson",
                "Associate Real Estate Broker",
              ]}
            />
            <InputField
              icon="/icons/user.svg"
              label="Brokerage Name"
              placeholder="Name"
              value={formData.brokerageName}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, brokerageName: value }))
              }
            />
          </>
        )}

        <InputField
          icon="/icons/mail-01.svg"
          label="Email"
          type="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, email: value }))
          }
        />

        <InputField
          icon="/icons/square-lock-01.svg"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          rightIcon={
            showPassword ? (
              <EyeOff className="text-black w-5 h-5" />
            ) : (
              <Eye className="text-black w-5 h-5" />
            )
          }
          onRightIconClick={() => setShowPassword((prev) => !prev)}
          value={formData.password}
          onChange={(value) => {
            setFormData((prev) => ({ ...prev, password: value }));
            setFieldErrors((prev) => {
              if (!prev.password) return prev;
              const next = { ...prev };
              delete next.password;
              return next;
            });
          }}
          error={fieldErrors.password}
        />

        <div className="flex items-start gap-3 mt-2">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="w-5 h-5 accent-action cursor-pointer mt-[2px]"
          />
          <label className="text-sm sm:text-base text-text-secondary">
            I agree to the{" "}
            <a
              href="/terms-conditions"
              className="text-action hover:text-action-hover font-semibold"
            >
              terms and conditions
            </a>
          </label>
        </div>

        {statusMessage && (
          <div
            className={`text-sm sm:text-base ${
              statusMessage.type === "error" ? "text-red-600" : "text-green-600"
            } whitespace-pre-line`}
          >
            {statusMessage.message}
          </div>
        )}

        <button
          type="submit"
          disabled={!agree || loading || isFormIncomplete}
          className="
            w-full bg-action hover:bg-action-hover text-text-inverted
            font-semibold py-3 sm:py-3.5 rounded-lg transition
            disabled:opacity-20
          "
        >
          {loading ? "Signing up..." : isRenter ? "Continue" : "Signup"}
        </button>

        <div className="text-center text-sm sm:text-base mt-2">
          <p className="text-text-tertiary">
            Already have an account?{" "}
            <a
              href={signinHref}
              className="text-action hover:text-action-hover font-semibold"
            >
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

function InputField({
  icon,
  rightIcon,
  label,
  placeholder,
  type = "text",
  onRightIconClick,
  value,
  onChange,
  error,
}: {
  icon: string;
  rightIcon?: ReactNode;
  label: string;
  placeholder: string;
  type?: string;
  onRightIconClick?: () => void;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-tertiary mb-2">
        {label}
      </label>
      <div className="flex items-center justify-between bg-surface-secondary border border-border-secondary rounded-xl px-4 py-3 sm:py-3.5 transition focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400">
        <div className="flex items-center flex-1">
          <Image
            src={icon}
            alt={`${label} icon`}
            width={20}
            height={20}
            className="w-5 h-5 text-action mr-2"
          />
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none text-text-secondary text-base"
          />
        </div>
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="ml-2 opacity-70 hover:opacity-100 transition"
            aria-label="Toggle password visibility"
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  icon,
  options,
}: {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  icon?: ReactNode;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-tertiary mb-2">
        {label}
      </label>
      <div className="relative flex items-center bg-surface-secondary border border-border-secondary rounded-xl px-4 py-3 sm:py-3.5 transition focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400">
        {icon ? <span className="shrink-0">{icon}</span> : null}
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full bg-transparent focus:outline-none text-base appearance-none pr-7 ${
            value ? "text-text-secondary" : "text-gray-400"
          }`}
        >
          <option value="">Select title</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          className="w-4 h-4 text-blue-500 pointer-events-none absolute right-4"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
