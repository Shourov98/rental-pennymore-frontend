"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type SignupRole = "renter" | "agent";

export default function SignupForm({ role }: { role: SignupRole }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralFromUrl = searchParams.get("ref");
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
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
    if (!isRenter || !referralFromUrl) return;

    setFormData((prev) => ({
      ...prev,
      referralCode: prev.referralCode || referralFromUrl,
    }));
  }, [isRenter, referralFromUrl]);

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
          "Unable to resend verification. Please try again shortly."
      );
    }
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message ||
              "Unable to sign up at the moment. Please try again."
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
      } = {
        email,
        password: formData.password,
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
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

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to sign up at the moment. Please try again."
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
        isRenter &&
        email &&
        normalized.trim() === "email already registered";
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
      <h2 className="text-2xl font-semibold text-center text-text-primary mb-1">
        Create an Account
      </h2>
      <p className="text-center text-text-secondary mb-1 text-sm sm:text-base">
        {isAgent ? "Agent sign up" : "Renter sign up"}
      </p>
      <p className="text-center text-text-secondary mb-6 text-sm sm:text-base">
        {isAgent ? (
          <>
            Looking for renter access instead?{" "}
            <Link
              href="/signup/renter"
              className="text-action hover:text-action-hover font-semibold"
            >
              Sign up as renter
            </Link>
          </>
        ) : (
          <>
            Looking for agent access instead?{" "}
            <Link
              href="/signup/agent"
              className="text-action hover:text-action-hover font-semibold"
            >
              Sign up as agent
            </Link>
          </>
        )}
      </p>

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
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, password: value }))
          }
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
            }`}
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
          {loading ? "Signing up..." : "Signup"}
        </button>

        <div className="text-center text-sm sm:text-base mt-2">
          <p className="text-text-tertiary">
            Already have an account?{" "}
            <a
              href="/signin"
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
}: {
  icon: string;
  rightIcon?: ReactNode;
  label: string;
  placeholder: string;
  type?: string;
  onRightIconClick?: () => void;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-tertiary mb-2">
        {label}
      </label>
      <div className="flex items-center justify-between bg-surface-secondary border border-border-secondary rounded-xl px-4 py-3 sm:py-3.5">
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
            className="flex-1 bg-transparent focus:outline-none text-text-secondary text-sm sm:text-base"
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
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-tertiary mb-2">
        {label}
      </label>
      <div className="flex items-center justify-between bg-surface-secondary border border-border-secondary rounded-xl px-4 py-3 sm:py-3.5">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-transparent focus:outline-none text-text-secondary text-sm sm:text-base"
        >
          <option value="">Select title</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
